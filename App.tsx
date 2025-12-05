import React, { useState, useRef, useEffect } from 'react';
import { Upload, Send, RefreshCw, Image as ImageIcon, Globe, Plane, Cloud, MapPin } from 'lucide-react';
import { GameState, ChatMessage, AiGuessResponse, AiRevealResponse, AiFlightResponse } from './types';
import { analyzeImage, checkReveal, flyToCoordinates } from './services/geminiService';
import { HostAvatar } from './components/HostAvatar';
import { AnalysisCard } from './components/AnalysisCard';
import { ResultCard } from './components/ResultCard';
import { DestinationCard } from './components/DestinationCard';

function App() {
  const [gameState, setGameState] = useState<GameState>('intro');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [userRevealInput, setUserRevealInput] = useState('');
  
  // Coordinate State
  const [coordinatesInput, setCoordinatesInput] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on message update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, gameState]);

  const addMessage = (role: 'host' | 'user', text?: string, data?: any, type: 'text' | 'guess' | 'result' | 'image' | 'flight_destination' = 'text') => {
    setMessages(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      role,
      text,
      data,
      type
    }]);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(url);
    setGameState('analyzing');
    
    // Add messages to chat
    addMessage('host', "Ooh! A new destination! Let me get my map... 🗺️");
    addMessage('user', undefined, undefined, 'image');

    performAnalysis(file);
  };

  const performAnalysis = async (file: File) => {
    setIsLoading(true);
    try {
      const result: AiGuessResponse = await analyzeImage(file);
      
      setIsLoading(false);
      addMessage('host', result.hostCommentary);
      addMessage('host', undefined, result, 'guess');
      
      setTimeout(() => {
        addMessage('host', "Am I close? Tell me where in the world this actually is!");
        setGameState('guessed');
      }, 1000);

    } catch (error) {
      setIsLoading(false);
      addMessage('host', "Turbulence! 🌪️ I'm having trouble seeing that clearly. Mind trying another photo?");
      setGameState('error');
    }
  };

  const handleRevealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !userRevealInput.trim()) return;

    const location = userRevealInput;
    setUserRevealInput('');
    setGameState('revealing');
    addMessage('user', location);
    setIsLoading(true);

    try {
      const result: AiRevealResponse = await checkReveal(selectedFile, location);
      setIsLoading(false);
      addMessage('host', result.hostReaction);
      addMessage('host', undefined, result, 'result');
      setGameState('result');
    } catch (error) {
      setIsLoading(false);
      addMessage('host', "My compass is spinning! Can you say that again?");
      setGameState('guessed');
    }
  };

  const handleFlightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coordinatesInput.trim()) return;

    // Parse coordinates from string input (e.g. "32.65, 51.67")
    let lat = '';
    let lng = '';
    
    // Remove parentheses if present and trim
    const cleanInput = coordinatesInput.replace(/[()]/g, '').trim();

    if (cleanInput.includes(',')) {
      const parts = cleanInput.split(',');
      lat = parts[0].trim();
      lng = parts[1].trim();
    } else if (cleanInput.includes(' ')) {
      // Fallback for space separated
      const parts = cleanInput.split(/\s+/);
      lat = parts[0];
      lng = parts[1];
    }

    setGameState('flying');
    addMessage('user', `Flying to ${cleanInput} ✈️`);
    addMessage('host', "Copy that! Coordinates received. Fasten your seatbelts, we are taking off! 🛫");
    setIsLoading(true);

    try {
      // Pass the parsed components if available, otherwise pass the raw string
      // The API service expects individual strings but if we fail to parse, we might send bad data
      // For this UI update, we assume user pastes "lat, long" format
      const result: AiFlightResponse = await flyToCoordinates(lat || cleanInput, lng || '');
      setIsLoading(false);
      addMessage('host', result.pilotAnnouncement);
      addMessage('host', undefined, result, 'flight_destination');
      setGameState('flight_arrived');
    } catch (error) {
      setIsLoading(false);
      addMessage('host', "Mayday! 📡 I can't locate a landing strip at those coordinates. Are we in the middle of the ocean?");
      setGameState('intro');
    }
  };

  const resetGame = () => {
    setGameState('intro');
    setMessages([]);
    setSelectedFile(null);
    setPreviewUrl(null);
    setUserRevealInput('');
    setCoordinatesInput('');
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <header className="w-full flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-sky-600 p-2 rounded-lg shadow-lg text-white">
             <Globe size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 leading-none">Where Is This?</h1>
            <span className="text-sm font-bold text-sky-600 tracking-widest">WORLD EDITION 🌍</span>
          </div>
        </div>
        <button onClick={resetGame} className="p-2 text-sky-600 hover:bg-sky-100 rounded-full transition">
          <RefreshCw size={20} />
        </button>
      </header>

      {/* Main Game Area */}
      <div className="flex-1 w-full bg-white/50 backdrop-blur-sm rounded-3xl shadow-xl border border-white/60 flex flex-col overflow-hidden h-[70vh]">
        
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          {/* Intro Message */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 p-8">
              
              <div className="relative w-40 h-40 flex items-center justify-center mb-2">
                {/* Clouds */}
                <div className="absolute top-2 right-2 text-sky-200 animate-pulse" style={{ animationDuration: '3s' }}>
                   <Cloud size={28} fill="currentColor" />
                </div>
                <div className="absolute bottom-6 left-1 text-sky-200 animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                   <Cloud size={36} fill="currentColor" />
                </div>

                {/* Orbit Track */}
                <div className={`absolute inset-2 border-2 border-dashed border-sky-300/50 rounded-full ${gameState === 'flying' ? 'animate-spin-fast' : 'animate-spin-slow'}`}></div>
                
                {/* Plane in Orbit */}
                <div className={`absolute inset-0 ${gameState === 'flying' ? 'animate-spin-fast' : 'animate-spin-slow'}`}>
                   <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white p-1.5 rounded-full shadow-sm border border-sky-100 transform -rotate-45 z-20">
                      <Plane size={20} className="text-sky-600" fill="currentColor" />
                   </div>
                </div>

                {/* Avatar Center */}
                <div className="w-24 h-24 bg-gradient-to-br from-sky-400 to-indigo-600 rounded-full flex items-center justify-center text-5xl shadow-xl z-10 animate-float border-4 border-white relative overflow-hidden">
                  <span className="relative z-10">🧑‍✈️</span>
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-white opacity-20 rounded-t-full"></div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 host-font">Welcome Aboard!</h2>
              <p className="text-gray-600 max-w-sm text-sm">
                I'm <b>Captain Atlas</b>. Upload a photo to test my geography skills, OR enter coordinates to fly there instantly!
              </p>
              
              <div className="w-full max-w-sm space-y-4">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Upload size={20} />
                  Identify Photo
                </button>
                
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase">Or Fly To Coordinates</span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <form onSubmit={handleFlightSubmit} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-200">
                  <div className="mb-2">
                    <input 
                      type="text" 
                      placeholder="Paste coordinates (e.g. 32.65, 51.67)" 
                      value={coordinatesInput}
                      onChange={(e) => setCoordinatesInput(e.target.value)}
                      className="w-full p-3 bg-gray-50 rounded-lg text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-800 placeholder-gray-400 font-mono"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={!coordinatesInput.trim()}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg shadow transition flex items-center justify-center gap-2 text-sm"
                  >
                    <Plane size={16} />
                    Take Off
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* Messages Loop */}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Avatar */}
              {msg.role === 'host' ? (
                <div className="flex-shrink-0 mt-1"><HostAvatar /></div>
              ) : (
                <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mt-1">
                  <span className="text-lg">👤</span>
                </div>
              )}

              {/* Content */}
              <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                
                {/* Text Bubbles */}
                {msg.text && (
                  <div className={`px-4 py-3 rounded-2xl text-sm md:text-base leading-relaxed shadow-sm ${
                    msg.role === 'host' 
                      ? 'bg-white text-gray-800 rounded-tl-none border border-gray-100' 
                      : 'bg-sky-600 text-white rounded-tr-none'
                  }`}>
                    {msg.text}
                  </div>
                )}

                {/* Specific Data Components */}
                {msg.type === 'guess' && msg.data && (
                  <AnalysisCard data={msg.data as AiGuessResponse} />
                )}
                
                {msg.type === 'result' && msg.data && (
                  <ResultCard data={msg.data as AiRevealResponse} />
                )}

                {msg.type === 'flight_destination' && msg.data && (
                  <DestinationCard data={msg.data as AiFlightResponse} />
                )}

                {msg.type === 'image' && previewUrl && (
                  <div className="rounded-2xl overflow-hidden border-4 border-white shadow-md w-48 md:w-64">
                    <img src={previewUrl} alt="Uploaded" className="w-full h-auto object-cover" />
                  </div>
                )}

              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <HostAvatar />
              <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-gray-100 flex items-center gap-2">
                <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                {gameState === 'flying' && <span className="ml-2 text-xs text-sky-500 font-bold uppercase animate-pulse">Flying...</span>}
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Interaction Area (Sticky Footer inside container) - Only for Image Game */}
        {(gameState === 'guessed' || gameState === 'error') && (
          <div className="p-4 bg-white border-t border-gray-100">
             <form onSubmit={handleRevealSubmit} className="relative flex items-center">
                <input
                  type="text"
                  value={userRevealInput}
                  onChange={(e) => setUserRevealInput(e.target.value)}
                  placeholder="Tell Captain Atlas where this is..."
                  className="w-full pl-4 pr-12 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition text-gray-800"
                  autoFocus
                />
                <button 
                  type="submit" 
                  disabled={!userRevealInput.trim() || isLoading}
                  className="absolute right-2 p-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <Send size={18} />
                </button>
             </form>
          </div>
        )}

        {(gameState === 'result' || gameState === 'flight_arrived') && (
           <div className="p-4 bg-white border-t border-gray-100 flex justify-center">
              <button 
                onClick={resetGame}
                className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition flex items-center gap-2 shadow-lg"
              >
                <MapPin size={18} />
                New Destination
              </button>
           </div>
        )}

      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept="image/*" 
        className="hidden" 
      />

    </div>
  );
}

export default App;