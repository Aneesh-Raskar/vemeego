
import React, { useState } from 'react';
import { MessageSquare, Search, MoreVertical, Phone, Video, ArrowLeft } from 'lucide-react';
import { USERS } from '../mockData';

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <div className="h-full flex bg-white/50 backdrop-blur-sm relative">
      {/* Chat Sidebar */}
      <div className={`
        w-full md:w-80 border-r border-slate-200 flex flex-col bg-white/40 absolute md:static inset-0 z-10 transition-transform duration-300
        ${selectedChat ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}
      `}>
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search chats..." 
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {USERS.map((user, i) => (
            <div 
              key={user.id} 
              onClick={() => setSelectedChat(user)}
              className={`p-4 flex items-center gap-3 hover:bg-white/60 cursor-pointer transition-colors ${i === 0 ? 'bg-white/80 border-l-4 border-indigo-500' : ''}`}
            >
              <div className="relative">
                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${i < 2 ? 'bg-green-500' : 'bg-slate-300'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-semibold text-slate-800 truncate">{user.name}</h3>
                  <span className="text-xs text-slate-400">10:42 AM</span>
                </div>
                <p className="text-sm text-slate-500 truncate">Hey, did you see the latest designs?</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`
        flex-1 flex flex-col bg-white/20 absolute md:static inset-0 z-20 transition-transform duration-300 bg-[#f0f4f8] md:bg-transparent
        ${selectedChat ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white/40 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSelectedChat(null)}
              className="md:hidden p-2 -ml-2 hover:bg-slate-100 rounded-full text-slate-600"
            >
              <ArrowLeft size={20} />
            </button>
            <img src={selectedChat?.avatar || USERS[0].avatar} alt="User" className="w-10 h-10 rounded-full object-cover" />
            <div>
              <h3 className="font-bold text-slate-800">{selectedChat?.name || USERS[0].name}</h3>
              <span className="text-xs text-green-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Online
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-slate-100 rounded-full text-slate-600"><Phone size={20} /></button>
            <button className="p-2 hover:bg-slate-100 rounded-full text-slate-600"><Video size={20} /></button>
            <button className="p-2 hover:bg-slate-100 rounded-full text-slate-600"><MoreVertical size={20} /></button>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          <div className="flex justify-center">
            <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">Today</span>
          </div>
          
          <div className="flex gap-3">
            <img src={selectedChat?.avatar || USERS[0].avatar} alt="User" className="w-8 h-8 rounded-full object-cover mt-1" />
            <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm max-w-md text-slate-700">
              <p>Hi! I just uploaded the new Q3 roadmap files. Let me know what you think.</p>
            </div>
          </div>

          <div className="flex gap-3 flex-row-reverse">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">ME</div>
            <div className="bg-indigo-600 p-3 rounded-2xl rounded-tr-none shadow-sm max-w-md text-white">
              <p>Thanks Alex! I'll take a look right now.</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white/60 border-t border-slate-200">
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Type a message..." 
              className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <button className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors">
              <MessageSquare size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
