import React, { useState, useEffect, useRef } from "react";
import { Send, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../utils/api";
import { API_ENDPOINTS } from "../config";
import { format } from "date-fns";
import { useRoomContext } from "@livekit/components-react";
import { RoomEvent, DataPacket_Kind } from "livekit-client";

interface MeetingChatProps {
  meetingId: string;
  onClose: () => void;
}

interface Message {
  id: string;
  meeting_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
}

const MeetingChat: React.FC<MeetingChatProps> = ({ meetingId, onClose }) => {
  const { user } = useAuth();
  const room = useRoomContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const handlerRef = useRef<
    | ((payload: Uint8Array, participant: any, kind: DataPacket_Kind) => void)
    | null
  >(null);
  const connectedHandlerRef = useRef<(() => void) | null>(null);
  const isSetupRef = useRef(false);
  const roomRef = useRef(room);

  // Keep room ref updated
  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  // Set up listener once when component mounts and room is available
  useEffect(() => {
    const currentRoom = roomRef.current;
    if (!currentRoom) {
      console.log("MeetingChat: Room not available yet");
      return;
    }

    // Prevent multiple setups
    if (isSetupRef.current) {
      console.log("MeetingChat: Listener already set up, skipping");
      return;
    }

    // Fetch initial messages
    fetchMessages();
    console.log(
      "MeetingChat: Setting up listener for meeting:",
      meetingId,
      "room:",
      currentRoom.name,
      "state:",
      currentRoom.state
    );

    // Create handler function - DataReceived event signature: (payload, participant, kind)
    const handleDataReceived = (
      payload: Uint8Array,
      participant: any,
      kind: DataPacket_Kind
    ) => {
      console.log("MeetingChat: Data received event triggered:", {
        participant: participant?.identity || participant?.sid || "unknown",
        participantSid: participant?.sid,
        kind,
        payloadLength: payload.length,
        payloadBytes: Array.from(payload.slice(0, 50)), // First 50 bytes for debugging
      });

      const decoder = new TextDecoder();
      let strData: string;
      try {
        strData = decoder.decode(payload);
        console.log("MeetingChat: Decoded data string:", strData);
      } catch (e) {
        console.error("MeetingChat: Failed to decode payload:", e);
        return;
      }

      try {
        const message = JSON.parse(strData);
        console.log("MeetingChat: Parsed JSON message:", message);

        // Verify it's a chat message (has required fields and matches our meeting)
        if (message && message.id && message.content && message.sender_id) {
          // Check meeting_id match
          if (message.meeting_id === meetingId) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === message.id)) {
                console.log(
                  "MeetingChat: Message already exists, skipping:",
                  message.id
                );
                return prev;
              }
              console.log(
                "MeetingChat: ✅ Adding new message to state:",
                message.id,
                message.content
              );
              return [...prev, message];
            });
          } else {
            console.log("MeetingChat: Message filtered - meeting_id mismatch", {
              receivedMeetingId: message.meeting_id,
              expectedMeetingId: meetingId,
            });
          }
        } else {
          console.log(
            "MeetingChat: Message filtered - missing required fields",
            {
              hasId: !!message?.id,
              hasContent: !!message?.content,
              hasSenderId: !!message?.sender_id,
              messageKeys: message ? Object.keys(message) : "null",
            }
          );
        }
      } catch (e) {
        console.error(
          "MeetingChat: Failed to parse as JSON, raw data:",
          strData.substring(0, 100),
          e
        );
      }
    };

    // Store handler in ref for cleanup
    handlerRef.current = handleDataReceived;

    // Set up listener - always add it, LiveKit will queue events if not connected yet
    console.log(
      "MeetingChat: Adding DataReceived listener (room state:",
      currentRoom.state,
      ")"
    );
    currentRoom.on(RoomEvent.DataReceived, handleDataReceived);
    isSetupRef.current = true;

    // Also listen for connection to log when ready
    const handleConnected = () => {
      console.log("MeetingChat: Room connected, listener is active");
    };
    connectedHandlerRef.current = handleConnected;
    currentRoom.on(RoomEvent.Connected, handleConnected);

    return () => {
      console.log(
        "MeetingChat: Cleaning up event listeners for meeting:",
        meetingId
      );
      const cleanupRoom = roomRef.current;
      if (handlerRef.current && cleanupRoom) {
        cleanupRoom.off(RoomEvent.DataReceived, handlerRef.current);
      }
      if (connectedHandlerRef.current && cleanupRoom) {
        cleanupRoom.off(RoomEvent.Connected, connectedHandlerRef.current);
      }
      handlerRef.current = null;
      connectedHandlerRef.current = null;
      isSetupRef.current = false;
    };
  }, [meetingId]); // Only depend on meetingId

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await api.get(
        `${API_ENDPOINTS.MEETINGS.DETAIL(meetingId)}/chat`
      );
      setMessages(res.data || []);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !room) return;

    const messageContent = newMessage.trim();
    setNewMessage(""); // Clear input immediately for better UX

    try {
      // Save to backend first
      const res = await api.post(
        `${API_ENDPOINTS.MEETINGS.DETAIL(meetingId)}/chat`,
        {
          content: messageContent,
        }
      );

      const sentMessage = res.data;
      console.log("MeetingChat: Message saved to backend:", sentMessage.id);

      // Publish via LiveKit client-side (required for E2EE rooms)
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(JSON.stringify(sentMessage));

        await room.localParticipant.publishData(data, {
          reliable: true,
          topic: "chat",
        });
        console.log("MeetingChat: Message published via LiveKit");
      } catch (livekitError) {
        console.error(
          "MeetingChat: Failed to publish via LiveKit:",
          livekitError
        );
        // Still add to UI even if LiveKit publish fails
      }

      // Optimistically add to UI (will also be added via DataReceived event)
      setMessages((prev) => {
        if (prev.some((m) => m.id === sentMessage.id)) return prev;
        return [...prev, sentMessage];
      });
    } catch (err) {
      console.error("Error sending message:", err);
      setNewMessage(messageContent); // Restore message on error
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-700 w-80">
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <h3 className="text-white font-semibold">In-Meeting Chat</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.sender_id === user?.id;
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
            >
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-xs text-slate-400 font-medium">
                  {isMe ? "You" : msg.sender_name}
                </span>
                <span className="text-[10px] text-slate-500">
                  {format(new Date(msg.created_at), "h:mm a")}
                </span>
              </div>
              <div
                className={`px-3 py-2 rounded-lg max-w-[85%] text-sm ${
                  isMe
                    ? "bg-indigo-600 text-white rounded-tr-none"
                    : "bg-slate-800 text-slate-200 rounded-tl-none"
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t border-slate-700"
      >
        <div className="relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="w-full bg-slate-800 text-white rounded-full pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-slate-700"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 rounded-full text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default React.memo(MeetingChat);
