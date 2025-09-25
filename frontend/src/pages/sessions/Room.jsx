// src/pages/sessions/Room.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useSocket } from "./providers/Socket";
import peer from "./providers/Peer";
import ChatBox from "./ChatBox";

const Room = () => {
  const socket = useSocket();
  const { roomId } = useParams();
  const location = useLocation();
  const { doctorEmail, userEmail, role } = location.state || {};

  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [remoteMicEnabled, setRemoteMicEnabled] = useState(true);


  const [videoEnabled, setVideoEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);

  const email = role === "doctor" ? doctorEmail : userEmail;

  // Attach local tracks
  const sendStreams = useCallback(() => {
    if (!myStream) return;
    try {
      for (const track of myStream.getTracks()) {
        peer.peer.addTrack(track, myStream);
      }
    } catch (err) {
      console.warn("sendStreams error:", err);
    }
  }, [myStream]);

  const handleUserJoined = useCallback(
    async ({ email, id }) => {
      setRemoteSocketId(id);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setMyStream(stream);
        for (const track of stream.getTracks()) peer.peer.addTrack(track, stream);
        const offer = await peer.getOffer();
        socket.emit("user:call", { to: id, offer });
      } catch (err) {
        console.error(err);
        setConnectionError("Failed to access camera/microphone.");
      }
    },
    [socket]
  );

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setMyStream(stream);
        for (const track of stream.getTracks()) peer.peer.addTrack(track, stream);
        const answer = await peer.getAnswer(offer);
        socket.emit("call:accepted", { to: from, ans: answer });
      } catch (err) {
        console.error(err);
        setConnectionError("Failed to start video session.");
      }
    },
    [socket]
  );

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setRemoteDescription(ans);
      sendStreams();
    },
    [sendStreams]
  );

  const toggleVideo = () => {
    if (!myStream) return;
    myStream.getVideoTracks().forEach(track => (track.enabled = !videoEnabled));
    setVideoEnabled(!videoEnabled);
  };

  const toggleMic = () => {
    if (!myStream) return;
    const newState = !micEnabled;
    myStream.getAudioTracks().forEach(track => (track.enabled = newState));
    setMicEnabled(newState);

    // Only notify the remote peer
    if (remoteSocketId) {
      socket.emit("mic:status", { to: remoteSocketId, enabled: newState });
    }
  };

  // New message handler
  const handleNewMessage = () => {
    if (!chatOpen) setUnreadMessages(prev => prev + 1);
  };

  const toggleChat = () => {
    setChatOpen(prev => !prev);
    if (!chatOpen) setUnreadMessages(0);
  };

  useEffect(() => {
    socket.on("mic:status", ({ enabled }) => setRemoteMicEnabled(enabled));
    return () => socket.off("mic:status");
  }, [socket]);

  useEffect(() => {
    if (email && roomId) socket.emit("room:join", { email, room: roomId });
  }, [socket, email, roomId]);

  useEffect(() => {
    socket.on("call:ended", () => {
      alert("The call has ended.");
      if (myStream) myStream.getTracks().forEach(track => track.stop());
      window.location.href = "/";
    });

    return () => socket.off("call:ended");
  }, [socket, myStream]);


  useEffect(() => {
    peer.peer.onicecandidate = (event) => {
      if (event.candidate && remoteSocketId) {
        socket.emit("ice:candidate", { to: remoteSocketId, candidate: event.candidate });
      }
    };

    peer.peer.ontrack = (event) => setRemoteStream(event.streams[0]);

    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("ice:candidate", async ({ candidate }) => { await peer.addIceCandidate(candidate); });

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("ice:candidate");
    };
  }, [socket, handleUserJoined, handleIncommingCall, handleCallAccepted, remoteSocketId]);


  return (
    <div className="flex flex-col min-h-screen font-inter bg-gray-900 text-white">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 border-b border-white/5 bg-gradient-to-b from-white/2 to-white/1">
        <div>
          <h2 className="text-lg font-semibold">Video Session</h2>
          <div className="flex gap-2 mt-1 text-xs text-gray-300">
            <span className="px-2 py-1 bg-white/5 rounded-full">Room: {roomId}</span>
            <span className="px-2 py-1 bg-white/5 rounded-full">You: {email || "Anonymous"}</span>
          </div>
        </div>
        <button
          onClick={toggleChat}
          className="mt-2 sm:mt-0 p-3 rounded-full bg-teal-600 hover:bg-teal-500 relative transition"
          aria-label={chatOpen ? "Close chat" : "Open chat"}
        >
          💬
          {unreadMessages > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
              {unreadMessages}
            </span>
          )}
        </button>

      </header>

      {/* Main area */}
      <main className="flex flex-col lg:flex-row flex-1 p-4 gap-4">
        {/* Video area */}
        <section className="flex-1 relative bg-gray-800 rounded-lg p-4 flex flex-col justify-between min-h-[60vh]">
          <div className="relative flex justify-center items-center flex-1">
            {/* Remote video */}
            <div className="w-full max-w-5xl h-[60vh] bg-gray-900 rounded-lg overflow-hidden shadow-lg border border-white/5 flex justify-center items-center relative">
              {!remoteStream && <div className="text-gray-400">Waiting for participant...</div>}
              {remoteStream && (
                <video
                  playsInline
                  autoPlay
                  ref={(video) => { if (video) video.srcObject = remoteStream; }}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute left-3 bottom-3 bg-black/50 px-3 py-1 rounded text-xs flex items-center gap-1">
                Participant
                {!remoteMicEnabled && <span className="text-red-400 text-xs">🔇</span>}
              </div>
            </div>

            {/* Local preview */}
            <div className="absolute bottom-4 right-4 w-60 h-40 bg-gray-900 rounded-lg overflow-hidden shadow-lg flex justify-center items-center">
              {!myStream && <div className="text-gray-400 text-sm">No camera</div>}
              {myStream && (
                <video
                  playsInline
                  muted
                  autoPlay
                  ref={(video) => { if (video) video.srcObject = myStream; }}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute left-2 top-2 bg-black/25 px-2 py-1 rounded text-xs">You {!micEnabled && <span className="text-red-400 text-xs">🔇</span>}</div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center mt-4 gap-2 flex-wrap">
            <div className="flex gap-2">
              <button
                onClick={toggleVideo}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition ${videoEnabled ? "bg-white/10 hover:bg-white/20" : "bg-red-600 hover:bg-red-700 text-white"}`}
              >
                {videoEnabled ? "🎥 On" : "🎥 Off"}
              </button>
              <button
                onClick={toggleMic}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition ${micEnabled ? "bg-white/10 hover:bg-white/20" : "bg-red-600 hover:bg-red-700 text-white"}`}
              >
                {micEnabled ? "🔈 On" : "🔈 Off"}
              </button>
            </div>
            <button
              onClick={() => {
                if (myStream) myStream.getTracks().forEach(track => track.stop());
                if (roomId) socket.emit("call:ended", { room: roomId });
                window.location.href = "/";
              }}
              className="px-5 py-2 rounded-full bg-gradient-to-b from-red-500 to-red-800 text-white"
            >
              End Call
            </button>

            <div className="text-sm">
              {connectionError ? (
                <span className="text-red-400">{connectionError}</span>
              ) : remoteStream ? (
                <span className="text-green-400">Connected</span>
              ) : (
                <span className="text-yellow-400">Waiting...</span>
              )}
            </div>
          </div>
        </section>
      </main>

      <ChatBox
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        roomId={roomId}
        user={email}
        onNewMessage={handleNewMessage}
      />
    </div>
  );
};

export default Room;
