import React from 'react'
import { Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, MessageSquare, MoreVertical, Maximize, Minimize } from 'lucide-react'

const CallControls = ({
  isAudioMuted,
  isVideoMuted,
  isFullscreen,
  isSidebarOpen,
  onToggleAudio,
  onToggleVideo,
  onToggleFullscreen,
  onToggleSidebar,
  onEndCall
}) => {
  return (
    <div className="bg-[#161B26]/95 backdrop-blur-2xl border border-slate-700/60 px-3 sm:px-5 py-2 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.8)] flex items-center justify-center gap-2 sm:gap-3 transition-all select-none">
      {/* Microphone Toggle */}
      <button
        onClick={onToggleAudio}
        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md active:scale-95 ${
          isAudioMuted
            ? 'bg-[#FF3B30] text-white hover:bg-red-600 ring-2 ring-red-500/40'
            : 'bg-[#1F2633] text-slate-200 hover:bg-slate-700 border border-slate-600/50 hover:border-slate-400'
        }`}
        title={isAudioMuted ? 'Unmute Microphone' : 'Mute Microphone'}
      >
        {isAudioMuted ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
      </button>

      {/* Video Camera Toggle */}
      <button
        onClick={onToggleVideo}
        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md active:scale-95 ${
          isVideoMuted
            ? 'bg-[#FF3B30] text-white hover:bg-red-600 ring-2 ring-red-500/40'
            : 'bg-[#1F2633] text-slate-200 hover:bg-slate-700 border border-slate-600/50 hover:border-slate-400'
        }`}
        title={isVideoMuted ? 'Turn Camera On' : 'Turn Camera Off'}
      >
        {isVideoMuted ? <VideoOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Video className="w-4 h-4 sm:w-5 sm:h-5" />}
      </button>

      {/* Screen Share (Visual / Fullscreen helper) */}
      <button
        onClick={onToggleFullscreen}
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#1F2633] text-slate-200 hover:bg-slate-700 border border-slate-600/50 hover:border-slate-400 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md active:scale-95"
        title="Screen Share / Fullscreen"
      >
        <Monitor className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Details / Chat Drawer Toggle */}
      <button
        onClick={onToggleSidebar}
        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-slate-600/50 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md active:scale-95 relative ${
          isSidebarOpen
            ? 'bg-teal-600/80 text-white border-teal-400'
            : 'bg-[#1F2633] text-slate-200 hover:bg-slate-700'
        }`}
        title="Patient Consultation Details"
      >
        <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-teal-500 text-slate-950 font-bold text-[9px] rounded-full flex items-center justify-center border border-[#161B26]">
          1
        </span>
      </button>

      {/* Fullscreen / Options */}
      <button
        onClick={onToggleFullscreen}
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#1F2633] text-slate-200 hover:bg-slate-700 border border-slate-600/50 hover:border-slate-400 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md active:scale-95"
        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
      >
        {isFullscreen ? <Minimize className="w-4 h-4 sm:w-5 sm:h-5" /> : <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />}
      </button>

      {/* End Call Button (Exact Figma Red Pill) */}
      <button
        onClick={onEndCall}
        className="w-12 sm:w-14 h-10 sm:h-11 rounded-2xl bg-[#FF3B30] hover:bg-red-600 text-white flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg shadow-red-500/30 hover:scale-105 active:scale-95"
        title="End Consultation"
      >
        <PhoneOff className="w-5 h-5" />
      </button>
    </div>
  )
}

export default CallControls
