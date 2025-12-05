import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  useParticipants,
  useTracks,
  useRoomContext,
  TrackToggle,
  VideoTrack,
  type TrackReference,
} from '@livekit/components-react';
import { Track, Participant, RemoteTrackPublication, TrackPublication } from 'livekit-client';
import { ChevronLeft, ChevronRight, Pin, PinOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { Button } from './ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { cn } from '@/lib/utils';

interface CustomVideoConferenceProps {
  meeting: any;
  isWebinar?: boolean;
}

const PARTICIPANTS_PER_PAGE = 9;
const PARTICIPANTS_PER_ROW = 8; // For bottom row when screen sharing/pinning

export const CustomVideoConference: React.FC<CustomVideoConferenceProps> = ({
  meeting,
  isWebinar = false,
}) => {
  const room = useRoomContext();
  const participants = useParticipants();
  const [currentPage, setCurrentPage] = useState(0);
  const [pinnedParticipant, setPinnedParticipant] = useState<Participant | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenShareParticipant, setScreenShareParticipant] = useState<Participant | null>(null);

  // Get all video and screen share tracks
  const allTracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );

  // Detect screen sharing
  useEffect(() => {
    const screenShareTracks = allTracks.filter(
      (track) => track.source === Track.Source.ScreenShare && track.participant
    );

    if (screenShareTracks.length > 0) {
      setIsScreenSharing(true);
      setScreenShareParticipant(screenShareTracks[0].participant || null);
    } else {
      setIsScreenSharing(false);
      setScreenShareParticipant(null);
    }
  }, [allTracks]);

  // Include all participants (we'll show placeholders for those without video)
  const allParticipants = useMemo(() => {
    return participants;
  }, [participants]);

  // Sort participants: active speakers first, then by name
  const sortedParticipants = useMemo(() => {
    const sorted = [...allParticipants];
    
    // Sort by speaking status (active speakers first)
    sorted.sort((a, b) => {
      const aIsSpeaking = a.isSpeaking;
      const bIsSpeaking = b.isSpeaking;
      
      if (aIsSpeaking && !bIsSpeaking) return -1;
      if (!aIsSpeaking && bIsSpeaking) return 1;
      
      // If both speaking or both not speaking, sort by name
      const aName = a.name || a.identity || '';
      const bName = b.name || b.identity || '';
      return aName.localeCompare(bName);
    });

    return sorted;
  }, [allParticipants]);

  // Get participants for current page (excluding pinned and screen share participant)
  const getPageParticipants = useCallback(
    (page: number) => {
      const excludeIds = new Set<string>();
      if (pinnedParticipant) excludeIds.add(pinnedParticipant.identity);
      if (screenShareParticipant) excludeIds.add(screenShareParticipant.identity);

      const filtered = sortedParticipants.filter((p) => !excludeIds.has(p.identity));
      const start = page * PARTICIPANTS_PER_PAGE;
      const end = start + PARTICIPANTS_PER_PAGE;
      return filtered.slice(start, end);
    },
    [sortedParticipants, pinnedParticipant, screenShareParticipant]
  );

  const currentPageParticipants = getPageParticipants(currentPage);
  const totalPages = Math.max(
    1,
    Math.ceil(
      sortedParticipants.filter(
        (p) =>
          (!pinnedParticipant || p.identity !== pinnedParticipant.identity) &&
          (!screenShareParticipant || p.identity !== screenShareParticipant.identity)
      ).length / PARTICIPANTS_PER_PAGE
    )
  );

  // Get participants for bottom row (when screen sharing or pinned)
  const getBottomRowParticipants = useCallback(
    (page: number) => {
      const excludeIds = new Set<string>();
      if (pinnedParticipant) excludeIds.add(pinnedParticipant.identity);
      if (screenShareParticipant) excludeIds.add(screenShareParticipant.identity);

      const filtered = sortedParticipants.filter((p) => !excludeIds.has(p.identity));
      const start = page * PARTICIPANTS_PER_ROW;
      const end = start + PARTICIPANTS_PER_ROW;
      return filtered.slice(start, end);
    },
    [sortedParticipants, pinnedParticipant, screenShareParticipant]
  );

  const [bottomRowPage, setBottomRowPage] = useState(0);
  const bottomRowParticipants = getBottomRowParticipants(bottomRowPage);
  const bottomRowTotalPages = Math.max(
    1,
    Math.ceil(
      sortedParticipants.filter(
        (p) =>
          (!pinnedParticipant || p.identity !== pinnedParticipant.identity) &&
          (!screenShareParticipant || p.identity !== screenShareParticipant.identity)
      ).length / PARTICIPANTS_PER_ROW
    )
  );

  // Reset to first page if current page is out of bounds
  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(0);
    }
  }, [currentPage, totalPages]);

  // Reset bottom row page if out of bounds
  useEffect(() => {
    if (bottomRowPage >= bottomRowTotalPages && bottomRowTotalPages > 0) {
      setBottomRowPage(0);
    }
  }, [bottomRowPage, bottomRowTotalPages]);

  // Calculate grid dimensions for current page
  const getGridDimensions = (count: number) => {
    if (count === 0) return { cols: 0, rows: 0 };
    if (count === 1) return { cols: 1, rows: 1 };
    if (count === 2) return { cols: 2, rows: 1 };
    if (count <= 4) return { cols: 2, rows: 2 };
    if (count <= 6) return { cols: 3, rows: 2 };
    if (count <= 9) return { cols: 3, rows: 3 };
    return { cols: 3, rows: 3 };
  };

  const gridDims = getGridDimensions(currentPageParticipants.length);

  // Subscribe only to visible participants' video tracks
  useEffect(() => {
    const visibleParticipantIds = new Set<string>();
    
    // Add pinned participant
    if (pinnedParticipant) {
      visibleParticipantIds.add(pinnedParticipant.identity);
    }
    
    // Add screen share participant
    if (screenShareParticipant) {
      visibleParticipantIds.add(screenShareParticipant.identity);
    }
    
    // Add current page participants
    currentPageParticipants.forEach((p) => {
      visibleParticipantIds.add(p.identity);
    });

    // Subscribe to video tracks for visible participants only
    participants.forEach((participant) => {
      // Skip local participant - we always want to see our own video
      if (participant.isLocal) return;
      
      const isVisible = visibleParticipantIds.has(participant.identity);
      const videoPublications: TrackPublication[] = [];
      participant.videoTrackPublications.forEach((pub) => {
        videoPublications.push(pub);
      });

      videoPublications.forEach((publication) => {
        // Only manage subscriptions for remote tracks (not local participant)
        // Check if publication has setSubscribed method (RemoteTrackPublication)
        if (
          !participant.isLocal &&
          publication &&
          'setSubscribed' in publication &&
          typeof (publication as any).setSubscribed === 'function'
        ) {
          if (isVisible && !publication.isMuted && publication.source === Track.Source.Camera) {
            // Subscribe to track
            (publication as any).setSubscribed(true);
          } else if (!isVisible && publication.source === Track.Source.Camera) {
            // Unsubscribe from track to save bandwidth (but keep screen share subscribed)
            (publication as any).setSubscribed(false);
          }
        }
      });
    });
  }, [participants, currentPageParticipants, pinnedParticipant, screenShareParticipant]);

  const handlePin = (participant: Participant) => {
    if (pinnedParticipant?.identity === participant.identity) {
      setPinnedParticipant(null);
    } else {
      setPinnedParticipant(participant);
    }
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  // Get screen share track
  const screenShareTrack = useMemo(() => {
    if (!screenShareParticipant) return null;
    const screenPub = Array.from(screenShareParticipant.videoTrackPublications.values()).find(
      (pub) => pub.source === Track.Source.ScreenShare && pub.track
    );
    return screenPub?.track || null;
  }, [screenShareParticipant]);

  // Render participant tile
  const renderParticipantTile = (participant: Participant, isPinned = false) => {
    const videoPublication = Array.from(participant.videoTrackPublications.values()).find(
      (pub) => pub.source === Track.Source.Camera
    );
    const audioTrack = Array.from(participant.audioTrackPublications.values()).find(
      (pub) => pub.track && !pub.isMuted
    );
    const isLocal = participant.isLocal;
    const isSpeaking = participant.isSpeaking;
    const hasVideo = videoPublication?.track !== undefined && !videoPublication.isMuted;

    const trackReference: TrackReference = {
      participant,
      publication: videoPublication || undefined,
      source: Track.Source.Camera,
    };

    return (
      <div
        key={participant.identity}
        className={cn(
          'relative group bg-slate-800 rounded-lg overflow-hidden',
          isPinned && 'ring-2 ring-indigo-500',
          isSpeaking && 'ring-2 ring-green-500',
          !hasVideo && 'bg-slate-700'
        )}
      >
        {hasVideo ? (
          <VideoTrack trackRef={trackReference} className="w-full h-full" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-slate-600 flex items-center justify-center text-white text-2xl font-bold">
              {(participant.name || participant.identity || 'U').charAt(0).toUpperCase()}
            </div>
          </div>
        )}
        
        {/* Participant info overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-white text-sm font-medium truncate">
                {participant.name || participant.identity || 'Unknown'}
              </span>
              {isLocal && (
                <span className="text-xs text-slate-400">(You)</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {audioTrack ? (
                <Mic className="w-4 h-4 text-white" />
              ) : (
                <MicOff className="w-4 h-4 text-red-500" />
              )}
              {hasVideo ? (
                <Video className="w-4 h-4 text-white" />
              ) : (
                <VideoOff className="w-4 h-4 text-red-500" />
              )}
            </div>
          </div>
        </div>

        {/* Pin button */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white"
            onClick={() => handlePin(participant)}
            title={isPinned ? 'Unpin' : 'Pin'}
          >
            {isPinned ? (
              <Pin className="w-4 h-4 fill-current" />
            ) : (
              <PinOff className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    );
  };

  // Webinar mode: speakers on top, participants at bottom
  if (isWebinar) {
    const speakers = sortedParticipants.filter((p) => p.isSpeaking || pinnedParticipant?.identity === p.identity);
    const regularParticipants = sortedParticipants.filter(
      (p) => !p.isSpeaking && pinnedParticipant?.identity !== p.identity
    );

    return (
      <div className="w-full h-full flex flex-col bg-slate-900">
        {/* Speakers section (full view) */}
        {speakers.length > 0 && (
          <div className="flex-1 p-4">
            <div
              className="w-full h-full grid gap-4"
              style={{
                gridTemplateColumns:
                  speakers.length === 1
                    ? '1fr'
                    : speakers.length === 2
                    ? 'repeat(2, 1fr)'
                    : speakers.length <= 4
                    ? 'repeat(2, 1fr)'
                    : 'repeat(3, 1fr)',
                gridTemplateRows:
                  speakers.length === 1
                    ? '1fr'
                    : speakers.length === 2
                    ? '1fr'
                    : speakers.length <= 4
                    ? 'repeat(2, 1fr)'
                    : 'repeat(2, 1fr)',
              }}
            >
              {speakers.map((participant) =>
                renderParticipantTile(participant, pinnedParticipant?.identity === participant.identity)
              )}
            </div>
          </div>
        )}

        {/* Participants section (bottom grid) */}
        {regularParticipants.length > 0 && (
          <div className="h-48 p-4 border-t border-slate-700">
            <div className="w-full h-full grid grid-cols-9 gap-2 overflow-x-auto">
              {regularParticipants.map((participant) => renderParticipantTile(participant))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Regular meeting mode
  return (
    <div className="w-full h-full flex flex-col bg-slate-900 overflow-hidden">
      {/* Screen share or pinned participant (top section) */}
      {(isScreenSharing || pinnedParticipant) && (
        <div className="flex-1 min-h-0 p-4 pb-2">
          {isScreenSharing && screenShareTrack && screenShareParticipant && (
            <div className="w-full h-full bg-black rounded-lg overflow-hidden relative">
              <VideoTrack
                trackRef={{
                  participant: screenShareParticipant,
                  publication: Array.from(screenShareParticipant.videoTrackPublications.values()).find(
                    (pub) => pub.source === Track.Source.ScreenShare
                  ),
                  source: Track.Source.ScreenShare,
                }}
                className="w-full h-full"
              />
              <div className="absolute top-2 left-2 bg-black/70 text-white px-3 py-1 rounded text-sm">
                {screenShareParticipant.name || screenShareParticipant.identity}'s screen
              </div>
            </div>
          )}
          {!isScreenSharing && pinnedParticipant && (
            <div className="w-full h-full">
              {renderParticipantTile(pinnedParticipant, true)}
            </div>
          )}
        </div>
      )}

      {/* Participants grid (bottom section) */}
      <div
        className={cn(
          'border-t border-slate-700 flex-shrink-0',
          isScreenSharing || pinnedParticipant ? 'h-48 flex flex-col overflow-hidden' : 'flex-1 p-4 min-h-0'
        )}
        style={isScreenSharing || pinnedParticipant ? { minHeight: '192px', maxHeight: '192px' } : undefined}
      >
        {isScreenSharing || pinnedParticipant ? (
          // Bottom row layout for screen sharing/pinned mode
          <div className="flex-1 flex flex-col min-h-0">
            {bottomRowTotalPages > 1 ? (
              <Tabs
                value={bottomRowPage.toString()}
                onValueChange={(value) => setBottomRowPage(parseInt(value))}
                className="flex-1 flex flex-col"
              >
                <div className="px-4 pt-2 pb-1">
                  <TabsList className="bg-slate-800/50 h-8">
                    {Array.from({ length: bottomRowTotalPages }).map((_, index) => (
                      <TabsTrigger
                        key={index}
                        value={index.toString()}
                        className="px-3 py-1 text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
                      >
                        Page {index + 1}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
                {Array.from({ length: bottomRowTotalPages }).map((_, index) => (
                  <TabsContent
                    key={index}
                    value={index.toString()}
                    className="flex-1 m-0 p-4 pt-2 overflow-x-auto"
                  >
                    {getBottomRowParticipants(index).length > 0 ? (
                      <div className="flex gap-3 h-full min-w-max">
                        {getBottomRowParticipants(index).map((participant) => (
                          <div key={participant.identity} className="flex-shrink-0" style={{ width: '180px', height: '100%' }}>
                            {renderParticipantTile(participant)}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                        No participants
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              // Single row without tabs
              <div className="flex-1 p-4 overflow-x-auto">
                {bottomRowParticipants.length > 0 ? (
                  <div className="flex gap-3 h-full min-w-max">
                    {bottomRowParticipants.map((participant) => (
                      <div key={participant.identity} className="flex-shrink-0" style={{ width: '180px', height: '100%' }}>
                        {renderParticipantTile(participant)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                    No participants
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          // Regular grid layout
          <div className="w-full h-full p-4">
            {currentPageParticipants.length > 0 ? (
              <div className="relative w-full h-full">
                <div
                  className="w-full h-full grid gap-4"
                  style={{
                    gridTemplateColumns: `repeat(${gridDims.cols}, 1fr)`,
                    gridTemplateRows: `repeat(${gridDims.rows}, 1fr)`,
                  }}
                >
                  {currentPageParticipants.map((participant) => renderParticipantTile(participant))}
                </div>

                {/* Pagination controls */}
                {totalPages > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black/70 rounded-lg px-4 py-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white hover:bg-white/20"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 0}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-white text-sm px-2">
                      Page {currentPage + 1} of {totalPages}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white hover:bg-white/20"
                      onClick={handleNextPage}
                      disabled={currentPage >= totalPages - 1}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                No participants
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

