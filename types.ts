export interface Possibility {
  country: string;
  confidence: number;
}

export interface AiGuessResponse {
  possibilities: Possibility[];
  clues: string[];
  finalGuess: string;
  hostCommentary: string; // The "Hmm, let me analyze this..." part
  confidenceScore: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface AiRevealResponse {
  isCorrect: boolean; // Does the AI think the user's location matches the visual clues?
  locationName: string;
  hostReaction: string; // The "WOW!" or "You got me!" part
  funFacts: string[];
  learningNote?: string; // Explanation of why it looked like somewhere else, or specific detail
}

export interface AiFlightResponse {
  locationName: string;
  city: string;
  country: string;
  description: string; // Short and concise
  pilotAnnouncement: string; // What the pilot says upon arrival
  imageUrl?: string; // Base64 generated image
}

export type GameState = 
  | 'intro' 
  | 'analyzing' 
  | 'guessed' 
  | 'revealing' 
  | 'result'
  | 'flying'
  | 'flight_arrived'
  | 'error';

export interface ChatMessage {
  id: string;
  role: 'host' | 'user';
  text?: string;
  image?: string; // Base64 or URL
  type: 'text' | 'image' | 'guess' | 'result' | 'flight_destination';
  data?: AiGuessResponse | AiRevealResponse | AiFlightResponse;
}