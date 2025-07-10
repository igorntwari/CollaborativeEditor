"use client"

import { useState, useRef, useEffect } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { SimpleRichEditor } from "@/components/simple-rich-editor"
import { VideoCall } from "@/components/video-call"
import { Mic, MicOff, Users, Volume2, VolumeX, Video, VideoOff, Sun, Moon, Monitor } from "lucide-react"

interface User {
  id: string
  name: string
  color: string
  isOnline: boolean
  isInAudio: boolean
  isInVideo: boolean
}

const COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
]

export default function CollaborativeEditor() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [text, setText] = useState("")
  const [isJoined, setIsJoined] = useState(false)
  const [userName, setUserName] = useState("")

  // Audio/Video states
  const [isMuted, setIsMuted] = useState(false)
  const [isDeafened, setIsDeafened] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [videoEnabled, setVideoEnabled] = useState(false)
  const [isInVideoCall, setIsInVideoCall] = useState(false)

  // WebRTC refs
  const localStreamRef = useRef<MediaStream | null>(null)
  const [remoteStreams] = useState<Map<string, MediaStream>>(new Map())

  useEffect(() => {
    setMounted(true)
  }, [])

  const joinRoom = () => {
    if (!userName.trim()) return

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: userName,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      isOnline: true,
      isInAudio: false,
      isInVideo: false,
    }

    setCurrentUser(newUser)
    setUsers([newUser])
    setIsJoined(true)
  }

  const stopAllTracks = (stream: MediaStream) => {
    stream.getTracks().forEach((track) => {
      track.stop()
    })
  }

  const toggleAudio = async () => {
    if (!audioEnabled) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: videoEnabled,
        })

        if (localStreamRef.current) {
          stopAllTracks(localStreamRef.current)
        }

        localStreamRef.current = stream
        setAudioEnabled(true)

        if (currentUser) {
          const updatedUser = { ...currentUser, isInAudio: true }
          setCurrentUser(updatedUser)
          setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)))
        }
      } catch (error) {
        console.error("Error accessing microphone:", error)
        alert("Could not access microphone. Please check permissions.")
      }
    } else {
      if (localStreamRef.current) {
        const audioTracks = localStreamRef.current.getAudioTracks()
        audioTracks.forEach((track) => track.stop())

        if (!videoEnabled) {
          localStreamRef.current = null
        }
      }
      setAudioEnabled(false)
      setIsMuted(false)

      if (currentUser) {
        const updatedUser = { ...currentUser, isInAudio: false }
        setCurrentUser(updatedUser)
        setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)))
      }
    }
  }

  const toggleVideo = async () => {
    if (!videoEnabled) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: audioEnabled,
          video: true,
        })

        if (localStreamRef.current) {
          stopAllTracks(localStreamRef.current)
        }

        localStreamRef.current = stream
        setVideoEnabled(true)

        if (currentUser) {
          const updatedUser = { ...currentUser, isInVideo: true }
          setCurrentUser(updatedUser)
          setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)))
        }
      } catch (error) {
        console.error("Error accessing camera:", error)
        alert("Could not access camera. Please check permissions.")
      }
    } else {
      if (localStreamRef.current) {
        const videoTracks = localStreamRef.current.getVideoTracks()
        videoTracks.forEach((track) => track.stop())

        if (!audioEnabled) {
          localStreamRef.current = null
        }
      }
      setVideoEnabled(false)
      setIsInVideoCall(false)

      if (currentUser) {
        const updatedUser = { ...currentUser, isInVideo: false }
        setCurrentUser(updatedUser)
        setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)))
      }
    }
  }

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMuted(!audioTrack.enabled)
      }
    }
  }

  const toggleDeafen = () => {
    setIsDeafened(!isDeafened)
  }

  const startVideoCall = () => {
    if (videoEnabled) {
      setIsInVideoCall(true)
    }
  }

  const leaveVideoCall = () => {
    setIsInVideoCall(false)
  }

  const getThemeIcon = () => {
    if (!mounted) return <Monitor className="w-4 h-4" />

    switch (theme) {
      case "light":
        return <Sun className="w-4 h-4" />
      case "dark":
        return <Moon className="w-4 h-4" />
      default:
        return <Monitor className="w-4 h-4" />
    }
  }

  const cycleTheme = () => {
    if (!mounted) return

    if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("system")
    } else {
      setTheme("light")
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        stopAllTracks(localStreamRef.current)
      }
    }
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isJoined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-center flex-1">Join Collaborative Editor</CardTitle>
              <Button variant="ghost" size="sm" onClick={cycleTheme}>
                {getThemeIcon()}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && joinRoom()}
            />
            <Button onClick={joinRoom} className="w-full" disabled={!userName.trim()}>
              Join Room
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">Collaborative Editor</h1>
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>{users.length}/10</span>
            </Badge>
          </div>

          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <Button variant="ghost" size="sm" onClick={cycleTheme}>
              {getThemeIcon()}
            </Button>

            {/* Audio Controls */}
            <Button
              variant={audioEnabled ? "default" : "outline"}
              size="sm"
              onClick={toggleAudio}
              className="flex items-center space-x-1"
            >
              {audioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              <span>{audioEnabled ? "Leave Audio" : "Join Audio"}</span>
            </Button>

            {/* Video Controls */}
            <Button
              variant={videoEnabled ? "default" : "outline"}
              size="sm"
              onClick={toggleVideo}
              className="flex items-center space-x-1"
            >
              {videoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              <span>{videoEnabled ? "Stop Video" : "Start Video"}</span>
            </Button>

            {videoEnabled && (
              <Button variant="secondary" size="sm" onClick={startVideoCall} className="flex items-center space-x-1">
                <Video className="w-4 h-4" />
                <span>Video Call</span>
              </Button>
            )}

            {audioEnabled && (
              <>
                <Button variant={isMuted ? "destructive" : "outline"} size="sm" onClick={toggleMute}>
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>

                <Button variant={isDeafened ? "destructive" : "outline"} size="sm" onClick={toggleDeafen}>
                  {isDeafened ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar - Users */}
        <div className="w-64 bg-card border-r p-4">
          <h2 className="font-semibold mb-4">Online Users</h2>
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-white text-xs font-medium" style={{ backgroundColor: user.color }}>
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{user.name}</span>
                    {user.id === currentUser?.id && (
                      <Badge variant="secondary" className="text-xs">
                        You
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${user.isOnline ? "bg-green-500" : "bg-gray-400"}`} />
                    <span className="text-xs text-muted-foreground">{user.isOnline ? "Online" : "Offline"}</span>
                    {user.isInAudio && <Mic className="w-3 h-3 text-green-500" />}
                    {user.isInVideo && <Video className="w-3 h-3 text-blue-500" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Editor */}
        <div className="flex-1 p-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Shared Rich Text Notes</CardTitle>
            </CardHeader>
            <CardContent className="h-full">
              <SimpleRichEditor
                value={text}
                onChange={setText}
                placeholder="Start typing your rich text notes here... Use **bold**, *italic*, __underline__ for formatting!"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-card border-t px-6 py-2 text-sm text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>
            {users.filter((u) => u.isInAudio).length} users in audio • {users.filter((u) => u.isInVideo).length} users
            in video • {text.length} characters
          </span>
          <span>Connected as {currentUser?.name}</span>
        </div>
      </div>

      {/* Video Call Overlay */}
      <VideoCall
        isInCall={isInVideoCall}
        onToggleVideo={toggleVideo}
        onToggleAudio={toggleMute}
        onLeaveCall={leaveVideoCall}
        localStream={localStreamRef.current}
        remoteStreams={remoteStreams}
        isVideoEnabled={videoEnabled}
        isAudioEnabled={audioEnabled && !isMuted}
      />
    </div>
  )
}
