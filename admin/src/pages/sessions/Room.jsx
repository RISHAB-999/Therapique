// src/pages/sessions/Room.jsx
import React, { useState, useEffect, useCallback } from "react";
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
    myStream.getAudioTracks().forEach(track => (track.enabled = !micEnabled));
    setMicEnabled(!micEnabled);
  };

  useEffect(() => {
    if (email && roomId) socket.emit("room:join", { email, room: roomId });
  }, [socket, email, roomId]);

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

  const toggleChat = () => setChatOpen((s) => !s);

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
          className="mt-2 sm:mt-0 p-3 rounded-full bg-teal-600 hover:bg-teal-500 transition"
          aria-label={chatOpen ? "Close chat" : "Open chat"}
        >
          💬
        </button>
      </header>

      {/* Main area */}
      <main className="flex flex-col lg:flex-row flex-1 p-4 gap-4">
        {/* Video area */}
        <section className="flex-1 relative bg-gray-800 rounded-lg p-4 flex flex-col justify-between min-h-[60vh]">
          <div className="relative flex justify-center items-center flex-1">
            {/* Remote video */}
            <div className="w-full max-w-5xl h-[60vh] bg-gray-900 rounded-lg overflow-hidden shadow-lg border border-white/5 flex justify-center items-center">
              {!remoteStream && <div className="text-gray-400">Waiting for participant...</div>}
              {remoteStream && (
                <video
                  playsInline
                  autoPlay
                  ref={(video) => { if (video) video.srcObject = remoteStream; }}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute left-3 bottom-3 bg-black/50 px-3 py-1 rounded text-xs">Participant</div>
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
              <div className="absolute left-2 top-2 bg-black/25 px-2 py-1 rounded text-xs">You</div>
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
            <button className="px-5 py-2 rounded-full bg-gradient-to-b from-red-500 to-red-800 text-white">End Call</button>
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

        {/* Right panel */}
        <aside className="w-80 flex-shrink-0 space-y-4">
          <div className="bg-gray-800 p-4 rounded-lg border border-white/5 space-y-2">
            <h4 className="text-sm font-semibold">Session Info</h4>
            <p><strong>Doctor:</strong> {doctorEmail || "-"}</p>
            <p><strong>Patient:</strong> {userEmail || "-"}</p>
            <p><strong>Room:</strong> {roomId}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <button className="px-3 py-1 bg-gray-700 rounded text-xs hover:bg-gray-600">Share Screen</button>
              <button className="px-3 py-1 bg-gray-700 rounded text-xs hover:bg-gray-600">Recording</button>
            </div>
          </div>
        </aside>
      </main>

      <ChatBox open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
};

export default Room;
