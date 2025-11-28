
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, Monitor, PhoneOff, MessageSquare, Users, Sparkles, Send, X, ChevronRight, Menu, LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { USERS, AI_COMMANDS, User, AICommand } from '../mockData';

interface ControlButtonProps {
  icon: LucideIcon;
  active?: boolean;
  onClick: () => void;
  danger?: boolean;
  label: string;
  className?: string;
}

const ControlButton = ({ icon: Icon, active, onClick, danger, label, className }: ControlButtonProps) => (
  <button
    onClick={onClick}
    className={`relative group flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full transition-all duration-300
      ${danger 
        ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30' 
        : active 
          ? 'bg-white text-slate-900 shadow-lg' 
          : 'bg-slate-800/50 text-white hover:bg-slate-700/50 backdrop-blur-md'
      } ${className}`}
  >
    <Icon size={20} />
    <span className="hidden md:block absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
      {label}
    </span>
  </button>
);

interface AIAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  type: 'ai' | 'user';
  text: string;
}

const AIAssistantPanel = ({ isOpen, onClose }: AIAssistantPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([
    { type: 'ai', text: "Hi! I'm Lumina. I can help you manage this meeting. Try asking me to 'Summarize discussion' or 'Record meeting'." }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { type: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI processing
    setTimeout(() => {
      const command = AI_COMMANDS.find(c =>
        input.toLowerCase().includes(c.command.toLowerCase().split(' ')[0])
      );

      const responseText = command
        ? command.response
        : "I'm listening. I can help with summaries, action items, and meeting controls.";

      setMessages(prev => [...prev, { type: 'ai', text: responseText }]);
      setIsTyping(false);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 md:right-4 top-0 md:top-4 bottom-0 md:bottom-24 w-full md:w-80 bg-white/90 backdrop-blur-xl md:rounded-2xl shadow-2xl border-l md:border border-white/50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 z-50">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-blue-50">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-indigo-600" />
          <h3 className="font-semibold text-slate-800">Lumina AI</h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
          <X size={16} className="text-slate-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
              msg.type === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-slate-100 text-slate-700 rounded-tl-none'
            }`}>
              <p className="whitespace-pre-line">{msg.text}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none flex gap-1">
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-slate-100 bg-white/50">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Lumina..."
            className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-100 border-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          <button 
            type="submit"
            disabled={!input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={14} />
          </button>
        </div>
      </form>
    </div>
  );
};

const MeetingRoom = () => {
  const navigate = useNavigate();
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [aiOpen, setAiOpen] = useState(false);
  const [participants, setParticipants] = useState(USERS);

  return (
    <div className="h-screen w-full bg-slate-900 relative overflow-hidden flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white text-sm font-medium">
            00:12:45
          </div>
          <h1 className="text-white font-medium text-lg drop-shadow-md hidden md:block">Q3 Product Roadmap Review</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Encrypted
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4 pt-20 pb-24 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-7xl mx-auto w-full h-full overflow-y-auto">
        {participants.map((user) => (
          <div key={user.id} className="relative rounded-2xl overflow-hidden bg-slate-800 border border-white/10 shadow-2xl group min-h-[200px]">
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
            />
            
            {/* Overlay Info */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-md text-white text-sm font-medium flex items-center gap-2">
                {user.isMuted ? <MicOff size={14} className="text-red-400" /> : <Mic size={14} className="text-green-400" />}
                {user.name}
              </div>
            </div>

            {/* Speaking Indicator */}
            {user.isSpeaking && (
              <div className="absolute inset-0 border-4 border-indigo-500/50 rounded-2xl pointer-events-none animate-pulse" />
            )}
          </div>
        ))}
      </div>

      {/* AI Panel */}
      <AIAssistantPanel isOpen={aiOpen} onClose={() => setAiOpen(false)} />

      {/* Bottom Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 md:gap-4 px-4 md:px-6 py-3 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl z-50 max-w-[95vw] overflow-x-auto">
        <ControlButton 
          icon={micOn ? Mic : MicOff} 
          active={micOn} 
          onClick={() => setMicOn(!micOn)} 
          label={micOn ? "Mute" : "Unmute"}
        />
        <ControlButton 
          icon={camOn ? Video : VideoOff} 
          active={camOn} 
          onClick={() => setCamOn(!camOn)} 
          label={camOn ? "Stop Video" : "Start Video"}
        />
        <div className="w-px h-8 bg-white/20 mx-1 md:mx-2" />
        <ControlButton 
          icon={Monitor} 
          onClick={() => {}} 
          label="Share Screen"
          className="hidden md:flex"
        />
        <ControlButton 
          icon={Sparkles} 
          active={aiOpen}
          onClick={() => setAiOpen(!aiOpen)} 
          label="AI Agent"
          className="text-indigo-400"
        />
        <ControlButton 
          icon={MessageSquare} 
          onClick={() => {}} 
          label="Chat"
        />
        <ControlButton 
          icon={Users} 
          onClick={() => {}} 
          label="Participants"
          className="hidden md:flex"
        />
        <div className="w-px h-8 bg-white/20 mx-1 md:mx-2" />
        <ControlButton 
          icon={PhoneOff} 
          danger 
          onClick={() => navigate('/')} 
          label="Leave"
        />
      </div>
    </div>
  );
};

export default MeetingRoom;
