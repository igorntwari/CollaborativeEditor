"use client"

import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Video, VideoOff, Mic, MicOff, PhoneOff } from "lucide-react"

interface VideoCallProps {
  isInCall: boolean
  onToggleVideo: () => void
  onToggleAudio: () => void
  onLeaveCall: () => void
  localStream: MediaStream | null
  remoteStreams: Map<string, MediaStream>
  isVideoEnabled: boolean
  isAudioEnabled: boolean
}

export function VideoCall({
  isInCall,
  onToggleVideo,
  onToggleAudio,
  onLeaveCall,
  localStream,
  remoteStreams,
  isVideoEnabled,
  isAudioEnabled,
}: VideoCallProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideosRef = useRef<Map<string, HTMLVideoElement>>(new Map())

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  useEffect(() => {
    remoteStreams.forEach((stream, userId) => {
      const videoElement = remoteVideosRef.current.get(userId)
      if (videoElement) {
        videoElement.srcObject = stream
      }
    })
  }, [remoteStreams])

  if (!isInCall) return null

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl h-full max-h-[80vh] bg-background rounded-lg overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Video Grid */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {/* Local Video */}
            <Card className="relative overflow-hidden bg-black">
              <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                You {!isVideoEnabled && "(Video Off)"}
              </div>
              {!isVideoEnabled && (
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                  <VideoOff className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </Card>

            {/* Remote Videos */}
            {Array.from(remoteStreams.entries()).map(([userId, stream]) => (
              <Card key={userId} className="relative overflow-hidden bg-black">
                <video
                  ref={(el) => {
                    if (el) {
                      remoteVideosRef.current.set(userId, el)
                      el.srcObject = stream
                    }
                  }}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                  User {userId.slice(0, 6)}
                </div>
              </Card>
            ))}

            {/* Placeholder for empty slots */}
            {Array.from({ length: Math.max(0, 6 - remoteStreams.size - 1) }).map((_, index) => (
              <Card key={`empty-${index}`} className="bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <div className="text-gray-400 text-center">
                  <Video className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Waiting for user...</p>
                </div>
              </Card>
            ))}
          </div>

          {/* Controls */}
          <div className="border-t p-4 flex items-center justify-center gap-4">
            <Button
              variant={isAudioEnabled ? "default" : "destructive"}
              size="lg"
              onClick={onToggleAudio}
              className="rounded-full w-12 h-12 p-0"
            >
              {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </Button>

            <Button
              variant={isVideoEnabled ? "default" : "destructive"}
              size="lg"
              onClick={onToggleVideo}
              className="rounded-full w-12 h-12 p-0"
            >
              {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </Button>

            <Button variant="destructive" size="lg" onClick={onLeaveCall} className="rounded-full w-12 h-12 p-0">
              <PhoneOff className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
