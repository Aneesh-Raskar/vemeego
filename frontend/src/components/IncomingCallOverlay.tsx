import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';
import { api } from '../utils/api';
import { API_ENDPOINTS } from '../config';

interface IncomingCallProps {
  // No props needed, it manages its own state via Supabase subscription
}

const IncomingCallOverlay: React.FC<IncomingCallProps> = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!user) return;

    // Subscribe to meeting_participants table for new invites
    const channel = supabase
      .channel('incoming_calls')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'meeting_participants',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          console.log("Incoming call payload:", payload);
          const newParticipant = payload.new;
          if (newParticipant.status === 'invited') {
            // Fetch meeting details to show who is calling
            try {
              const meetingRes = await api.get(API_ENDPOINTS.MEETINGS.DETAIL(newParticipant.meeting_id));
              const meeting = meetingRes.data;
              
              console.log("Incoming call meeting details:", meeting);
              // Only show if it's an instant meeting (call) or just started
              // For now, show for all invites that are "live"
              setIncomingCall({
                ...newParticipant,
                meetingTitle: meeting.title,
                hostId: meeting.host_id
              });
            } catch (err) {
              console.error("Failed to fetch meeting details for call", err);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log("Incoming call subscription status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    if (incomingCall) {
      // Play ringtone
      audioRef.current = new Audio('/ringtone.wav');
      audioRef.current.loop = true;
      audioRef.current.play().catch(e => console.error("Audio play failed", e));

      // Auto reject after 1 minute
      const timeout = setTimeout(() => {
        handleReject();
      }, 60000);

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        clearTimeout(timeout);
      };
    }
  }, [incomingCall]);

  const handleAccept = () => {
    if (!incomingCall) return;
    
    // Stop ringtone
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    // Navigate to meeting
    navigate(`/meeting/${incomingCall.meeting_id}`);
    setIncomingCall(null);
  };

  const handleReject = async () => {
    if (!incomingCall) return;

    // Stop ringtone
    if (audioRef.current) {
      audioRef.current.pause();
    }

    setIncomingCall(null);
    
    // Ideally update status to declined in DB, but for now just close overlay
    // We can add an API endpoint for updating participant status later
  };

  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-8 max-w-sm w-full border border-slate-700">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center animate-pulse">
            <Video size={40} className="text-white" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-slate-900"></div>
        </div>
        
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-white">Incoming Call...</h3>
          <p className="text-slate-400">{incomingCall.meetingTitle}</p>
        </div>

        <div className="flex items-center gap-8 w-full justify-center">
          <button
            onClick={handleReject}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-16 h-16 rounded-full bg-red-500/20 group-hover:bg-red-500 flex items-center justify-center transition-all border-2 border-red-500">
              <PhoneOff size={28} className="text-red-500 group-hover:text-white" />
            </div>
            <span className="text-sm text-slate-400 group-hover:text-white">Decline</span>
          </button>

          <button
            onClick={handleAccept}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-16 h-16 rounded-full bg-green-500/20 group-hover:bg-green-500 flex items-center justify-center transition-all border-2 border-green-500 animate-bounce">
              <Phone size={28} className="text-green-500 group-hover:text-white" />
            </div>
            <span className="text-sm text-slate-400 group-hover:text-white">Accept</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallOverlay;
