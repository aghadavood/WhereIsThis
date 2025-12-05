# 🌍 Where Is This? 

Testing if Gemini 3 Pro actually knows the world — specifically Iran.

## What This Does

**Mode 1: Upload a Photo**
- AI guesses the location
- Returns coordinates (lat/lng)
- Shows confidence % and visual clues

**Mode 2: Enter Coordinates**
- AI identifies the place
- Generates an image of that location

## The Experiment

Google says Gemini 3 Pro can recognize any place on Earth from coordinates.

So I tested it with Iran — a country the world barely knows.

Results:
- Famous spots ✅ (Naqsh-e Jahan Square)
- Hidden gems ❌ (Confused Choobi Bridge with Marnan Bridge)

AI only knows what the world teaches it.

## Built With

- **Gemini 3 Pro** — location recognition + coordinate identification
- - **Nano Banana** 

## Try It Yourself

1. Clone this repo
2. Get a free API key from [ai.google.dev](https://ai.google.dev)
3. Create `.env` file:
```
API_KEY=your_key_here
```
4. Install & run:
```bash
npm install
npm run dev
```

## Features in the Code

| Function | What It Does |
|----------|--------------|
| `analyzeImage()` | Upload photo → get location guess + coordinates |
| `checkReveal()` | Reveal the real location → AI reacts + fun facts |
| `flyToCoordinates()` | Enter lat/lng → AI names place + generates image |

## Why Iran?

Isfahan = "Nesf-e Jahan" = Half of the World

Most people have never seen it. AI barely knows it.

This is me telling the algorithm.

🇮🇷

## Friday AI Experiments

Every Friday I build something with AI tools. This is one of them.
