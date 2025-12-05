import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AiGuessResponse, AiRevealResponse, AiFlightResponse } from "../types";

// Helper to convert File to Base64 string (stripping header)
export const fileToGenerativePart = async (file: File): Promise<{ mimeType: string; data: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve({
        mimeType: file.type,
        data: base64Data,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const SYSTEM_INSTRUCTION = `
You are "Captain Atlas", a worldly, adventurous, and confident geography game host and pilot.
Your goal is to guess where in the world a photo was taken, OR describe a location based on coordinates.
Your personality is energetic, encouraging, and full of wanderlust.

Style Guide:
- Use travel-themed emojis naturally 🌍 ✈️ 📸 🗺️
- Be dramatic and enthusiastic about the world's beauty.
- Keep ALL descriptions and commentary SHORT, PUNCHY, and CONCISE.
- If you are right, celebrate your expertise!
- If you are wrong, be genuinely fascinated by the new discovery and explain what tricked you.
`;

const guessSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    possibilities: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          country: { type: Type.STRING },
          confidence: { type: Type.NUMBER, description: "Percentage as a number 0-100" },
        },
        required: ["country", "confidence"],
      },
    },
    clues: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Short visual clues (max 3-4 words each)",
    },
    finalGuess: { type: Type.STRING },
    hostCommentary: { type: Type.STRING, description: "Very short, concise analysis (max 20 words)" },
    confidenceScore: { type: Type.NUMBER },
    coordinates: {
      type: Type.OBJECT,
      properties: {
        lat: { type: Type.NUMBER },
        lng: { type: Type.NUMBER },
      },
      required: ["lat", "lng"],
      description: "Estimated latitude and longitude of the final guess location."
    },
  },
  required: ["possibilities", "clues", "finalGuess", "hostCommentary", "confidenceScore", "coordinates"],
};

const revealSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    isCorrect: { type: Type.BOOLEAN, description: "True if the user's location matches your visual analysis/final guess." },
    locationName: { type: Type.STRING },
    hostReaction: { type: Type.STRING, description: "Short reaction" },
    funFacts: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Short fun facts" },
    learningNote: { type: Type.STRING, description: "Concise learning note" },
  },
  required: ["isCorrect", "locationName", "hostReaction", "funFacts"],
};

const flightSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    locationName: { type: Type.STRING, description: "The specific name of the place/landmark" },
    city: { type: Type.STRING },
    country: { type: Type.STRING },
    description: { type: Type.STRING, description: "A very short, engaging description (max 15 words)." },
    pilotAnnouncement: { type: Type.STRING, description: "Short arrival announcement." },
  },
  required: ["locationName", "city", "country", "description", "pilotAnnouncement"],
};

export const analyzeImage = async (file: File): Promise<AiGuessResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const imagePart = await fileToGenerativePart(file);

  const prompt = `
    STEP 1 - FIRST GUESS:
    Look at this image.
    1. List 3 possible countries with confidence % for each.
    2. List visual clues (VERY SHORT).
    3. Make your final guess.
    4. Estimate the specific latitude and longitude coordinates of this location.
    5. Provide a short, punchy commentary.
    
    Output strictly in JSON format matching the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        role: 'user',
        parts: [
          { inlineData: imagePart },
          { text: prompt }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: guessSchema,
        temperature: 0.7, 
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AiGuessResponse;
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw error;
  }
};

export const checkReveal = async (file: File, userLocation: string): Promise<AiRevealResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const imagePart = await fileToGenerativePart(file);

  const prompt = `
    STEP 3 - AFTER USER REVEALS:
    The user says this place is: "${userLocation}".

    1. Evaluate: Does this location match the visual evidence in the image? 
    2. React: (Short and fun)
    3. Provide:
       - The canonical name of the location.
       - 2-3 short fun facts.
       - A concise learning note.

    Output strictly in JSON format matching the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        role: 'user',
        parts: [
          { inlineData: imagePart },
          { text: prompt }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: revealSchema,
        temperature: 0.8,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as AiRevealResponse;
  } catch (error) {
    console.error("Error processing reveal:", error);
    throw error;
  }
};

export const flyToCoordinates = async (lat: string, lng: string): Promise<AiFlightResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Step 1: Identify the location using text model
  const prompt = `
    FLIGHT MODE INITIATED:
    We are flying to coordinates: ${lat}, ${lng}.
    
    1. Identify exactly what is at this location.
    2. Write a VERY short description (max 15 words).
    3. Write a short pilot announcement.
    
    Output strictly in JSON format matching the schema.
  `;

  let locationData: AiFlightResponse;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        role: 'user',
        parts: [{ text: prompt }]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: flightSchema,
        temperature: 0.7,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    locationData = JSON.parse(text) as AiFlightResponse;
    
  } catch (error) {
    console.error("Error identifying coordinates:", error);
    throw error;
  }

  // Step 2: Generate an image of the identified location
  try {
    const imagePrompt = `A stunning, realistic, high-quality travel photograph of ${locationData.locationName}, ${locationData.city}, ${locationData.country}. The image should look like a professional National Geographic shot.`;
    
    const imageResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: imagePrompt },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "4:3",
        }
      }
    });

    for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64EncodeString = part.inlineData.data;
        locationData.imageUrl = `data:image/png;base64,${base64EncodeString}`;
        break;
      }
    }
  } catch (imageError) {
    console.warn("Failed to generate image:", imageError);
    // Continue without image if generation fails
  }

  return locationData;
};