
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, ArrowRight, Plus, FolderOpen } from 'lucide-react';
import { MEETINGS, Meeting } from '../mockData';

interface MeetingCardProps {
  meeting: Meeting;
  onJoin: (id: string) => void;
}

const MeetingCard = ({ meeting, onJoin }: MeetingCardProps) => (
  <div className="group relative p-6 rounded-2xl bg-white/60 backdrop-blur-md border border-white/50 shadow-sm hover:shadow-xl hover:bg-white/80 transition-all duration-300">
    <div className="flex justify-between items-start mb-4">
      <div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-2
          ${meeting.status === 'Live Now' 
            ? 'bg-red-100 text-red-600 animate-pulse' 
            : 'bg-indigo-50 text-indigo-600'
          }`}>
          {meeting.status === 'Live Now' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5" />}
          {meeting.status}
        </span>
        <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
          {meeting.title}
        </h3>
      </div>
      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
        <ArrowRight size={20} />
      </div>
    </div>
    
    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-6">
      <div className="flex items-center gap-1.5">
        <Clock size={16} />
        {meeting.time}
      </div>
      <div className="flex items-center gap-1.5">
        <Users size={16} />
        {meeting.participants.length} attendees
      </div>
    </div>

    <div className="flex items-center justify-between">
      <div className="flex -space-x-2">
        {meeting.participants.map((p, i) => (
          <img 
            key={p.id} 
            src={p.avatar} 
            alt={p.name}
            className="w-8 h-8 rounded-full border-2 border-white ring-1 ring-slate-100"
            style={{ zIndex: 10 - i }}
          />
        ))}
      </div>
      <button 
        onClick={() => onJoin(meeting.id)}
        className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20"
      >
        Join Room
      </button>
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();

  const handleJoin = (id: string) => {
    navigate(`/meeting/${id}`);
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-10 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">Good Morning, Alex</h1>
          <p className="text-slate-500">You have 3 meetings scheduled for today.</p>
        </div>
        <button className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40">
          <Plus size={20} />
          New Meeting
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-semibold text-slate-700 flex items-center gap-2">
            <Calendar size={20} className="text-indigo-500" />
            Today's Schedule
          </h2>
          <div className="grid gap-4">
            {MEETINGS.map(meeting => (
              <MeetingCard key={meeting.id} meeting={meeting} onJoin={handleJoin} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-slate-700">Quick Actions</h2>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-xl shadow-indigo-500/20">
            <h3 className="text-lg font-bold mb-2">AI Assistant</h3>
            <p className="text-indigo-100 text-sm mb-4">
              Prepare for your next meeting. Ask Lumina to summarize previous notes.
            </p>
            <button className="w-full py-2.5 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-colors text-sm font-medium">
              Open Assistant
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-white/60 backdrop-blur-md border border-white/50 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4">Recent Files</h3>
            <div className="space-y-3">
              {['Q3_Roadmap.pdf', 'Design_System_v2.fig', 'Budget_2025.xlsx'].map((file, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 transition-colors cursor-pointer">
                  <div className="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <FolderOpen size={16} />
                  </div>
                  <span className="text-sm text-slate-600">{file}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
