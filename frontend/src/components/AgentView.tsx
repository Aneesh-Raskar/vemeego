
import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, Sparkles, Activity } from 'lucide-react';

const AgentView = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const scrollToBottom = () => {
    // Only scroll the container, not the whole page
    if (scrollContainerRef.current) {
      const { scrollHeight, clientHeight } = scrollContainerRef.current;
      scrollContainerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if (transcript.length > 0) {
      scrollToBottom();
    }
  }, [transcript]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newTranscript = [...transcript, { type: 'user', text: inputValue }];
    setTranscript(newTranscript);
    setInputValue("");
    
    // Simulate AI response
    setTimeout(() => {
      setTranscript(prev => [...prev, { 
        type: 'ai', 
        text: "I've processed that request. Is there anything else you need help with regarding the Q3 Roadmap?" 
      }]);
    }, 1000);
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      // Simulate voice input
      setTimeout(() => {
        setTranscript(prev => [...prev, { type: 'user', text: "Show me the latest design files." }]);
        setIsListening(false);
        setTimeout(() => {
          setTranscript(prev => [...prev, { type: 'ai', text: "Opening the design files folder for you now." }]);
        }, 1000);
      }, 2000);
    }
  };

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-slate-900 text-white">
      {/* Background Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 z-10 w-full max-w-4xl mx-auto">
        {/* AI Visualizer */}
        <div className="mb-8 md:mb-12 relative shrink-0">
          <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center transition-all duration-500
            ${isListening ? 'bg-indigo-500 shadow-[0_0_100px_rgba(99,102,241,0.5)] scale-110' : 'bg-slate-800 border border-white/10 shadow-2xl'}
          `}>
            <Sparkles size={32} className={`md:w-12 md:h-12 ${isListening ? 'text-white animate-spin-slow' : 'text-indigo-400'}`} />
          </div>
          {isListening && (
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap text-indigo-300 font-medium animate-pulse">
              Listening...
            </div>
          )}
        </div>

        {/* Transcript Area */}
        <div 
          ref={scrollContainerRef}
          className="w-full max-w-2xl h-64 md:h-80 overflow-y-auto mb-8 space-y-4 px-4 scrollbar-hide overscroll-contain"
        >
          {transcript.length === 0 && (
            <div className="text-center text-slate-400">
              <p className="text-base md:text-lg mb-2">"Schedule a meeting with Sarah"</p>
              <p className="text-base md:text-lg mb-2">"Summarize the last call"</p>
              <p className="text-base md:text-lg">"Open the Q3 Budget file"</p>
            </div>
          )}
          {transcript.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 md:p-4 rounded-2xl text-base md:text-lg ${
                msg.type === 'user' 
                  ? 'bg-white/10 backdrop-blur-md text-white rounded-tr-none' 
                  : 'bg-indigo-600/80 backdrop-blur-md text-white rounded-tl-none shadow-lg shadow-indigo-500/20'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="w-full max-w-2xl relative shrink-0">
          <form onSubmit={handleSend} className="relative z-20">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask Lumina..."
              className="w-full pl-6 pr-24 md:pr-32 py-3 md:py-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-2xl text-sm md:text-base"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2 rounded-xl transition-colors ${isListening ? 'bg-red-500/80 text-white' : 'hover:bg-white/10 text-slate-300'}`}
              >
                {isListening ? <Activity size={18} className="animate-pulse" /> : <Mic size={18} />}
              </button>
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AgentView;
