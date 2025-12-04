import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, ArrowRight, Video, Plus, X, Loader2 } from 'lucide-react';
import { api } from '../utils/api';
import { API_ENDPOINTS } from '../config';

interface Meeting {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  status: string;
  type: string;
  is_open: boolean;
  host_id: string;
  participants: any[]; // We might need to fetch participants separately or include them in response
}

interface MeetingCardProps {
  meeting: Meeting;
  onJoin: (id: string) => void;
}

const MeetingCard = ({ meeting, onJoin }: MeetingCardProps) => {
  const startTime = new Date(meeting.start_time);
  const isLive = new Date() >= startTime && (!meeting.end_time || new Date() <= new Date(meeting.end_time));
  
  return (
    <div className="group relative p-6 rounded-2xl bg-white/60 backdrop-blur-md border border-white/50 shadow-sm hover:shadow-xl hover:bg-white/80 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-2
            ${isLive 
              ? 'bg-red-100 text-red-600 animate-pulse' 
              : meeting.status === 'scheduled'
              ? 'bg-indigo-50 text-indigo-600'
              : 'bg-slate-100 text-slate-600'
            }`}>
            {isLive && <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5" />}
            {isLive ? 'Live Now' : meeting.status}
          </span>
          <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
            {meeting.title}
          </h3>
          <p className="text-xs text-slate-500 mt-1">{meeting.type} • {meeting.is_open ? 'Open' : 'Closed'}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
          <ArrowRight size={20} />
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-6">
        <div className="flex items-center gap-1.5">
          <Clock size={16} />
          {startTime.toLocaleString()}
        </div>
        {/* <div className="flex items-center gap-1.5">
          <Users size={16} />
          {meeting.participants?.length || 0} attendees
        </div> */}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {/* Placeholder for participants avatars */}
          {/* {meeting.participants?.slice(0, 3).map((p, i) => (
            <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white ring-1 ring-slate-100 flex items-center justify-center text-xs font-bold text-slate-500" style={{ zIndex: 10 - i }}>
              {p.name?.[0]}
            </div>
          ))} */}
        </div>
        <button 
          onClick={() => onJoin(meeting.id)}
          className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20"
        >
          {isLive ? 'Join Room' : 'View Details'}
        </button>
      </div>
    </div>
  );
};

const Meetings = () => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [type, setType] = useState("scheduled");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(API_ENDPOINTS.MEETINGS.LIST);
      setMeetings(response.data);
    } catch (error) {
      console.error("Failed to fetch meetings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = (id: string) => {
    navigate(`/meeting/${id}`);
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startTime) return;

    try {
      setIsSubmitting(true);
      await api.post(API_ENDPOINTS.MEETINGS.CREATE, {
        title,
        description,
        start_time: new Date(startTime).toISOString(),
        type,
        is_open: isOpen,
        participants: [] // Add participants selection logic later
      });
      
      setShowScheduleModal(false);
      fetchMeetings();
      
      // Reset form
      setTitle("");
      setDescription("");
      setStartTime("");
      setType("scheduled");
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to schedule meeting:", error);
      alert("Failed to schedule meeting");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 relative">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-10 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">My Meetings</h1>
          <p className="text-slate-500">View your upcoming and past meeting history.</p>
        </div>
        <button 
          onClick={() => setShowScheduleModal(true)}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40"
        >
          <Video size={20} />
          Schedule Meeting
        </button>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {meetings.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-500">
                No meetings found. Schedule one to get started!
              </div>
            ) : (
              meetings.map(meeting => (
                <MeetingCard key={meeting.id} meeting={meeting} onJoin={handleJoin} />
              ))
            )}
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-800">Schedule Meeting</h3>
              <button onClick={() => setShowScheduleModal(false)} className="p-1 hover:bg-slate-200 rounded-full text-slate-500">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSchedule} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="Meeting Title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="webinar">Webinar</option>
                  </select>
                </div>
                
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isOpen}
                      onChange={(e) => setIsOpen(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="text-sm text-slate-700">Open Meeting</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Meetings;
