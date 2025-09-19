// src/pages/sessions/Room.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useSocket } from "../../shared/sessions/providers/Socket";
import peer from "../../shared/sessions/providers/Peer";
import ChatBox from "./ChatBox";
import "./Room.css";

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

  const email = role === "doctor" ? doctorEmail : userEmail;

  // Attach local stream tracks to connection
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

  // When someone else joins the room (we are the newcomer)
  const handleUserJoined = useCallback(
    async ({ email, id }) => {
      console.log("User joined:", email, id);
      setRemoteSocketId(id);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setMyStream(stream);

        for (const track of stream.getTracks()) {
          peer.peer.addTrack(track, stream);
        }

        const offer = await peer.getOffer();
        socket.emit("user:call", { to: id, offer });
        console.log("Offer sent to:", id);
      } catch (err) {
        console.error("Error accessing media devices:", err);
        setConnectionError("Failed to access camera/microphone.");
      }
    },
    [socket]
  );

  // Incoming call handler (we are the first, answering)
  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      console.log("Incoming call from:", from);
      setRemoteSocketId(from);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setMyStream(stream);

        for (const track of stream.getTracks()) {
          peer.peer.addTrack(track, stream);
        }

        const answer = await peer.getAnswer(offer);
        socket.emit("call:accepted", { to: from, ans: answer });
        console.log("Sent answer back to:", from);
      } catch (err) {
        console.error("Error answering call:", err);
        setConnectionError("Failed to start video session.");
      }
    },
    [socket]
  );

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      console.log("Call accepted by:", from);
      peer.setRemoteDescription(ans);
      sendStreams();
    },
    [sendStreams]
  );

  // Join the room (signal server)
  useEffect(() => {
    if (email && roomId) {
      socket.emit("room:join", { email, room: roomId });
      console.log("Joined room:", roomId, "as", email);
    }
  }, [socket, email, roomId]);

  // Setup socket + peer listeners
  useEffect(() => {
    peer.peer.onicecandidate = (event) => {
      if (event.candidate && remoteSocketId) {
        socket.emit("ice:candidate", {
          to: remoteSocketId,
          candidate: event.candidate,
        });
      }
    };

    peer.peer.ontrack = (event) => {
      console.log("Remote stream received");
      setRemoteStream(event.streams[0]);
    };

    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("ice:candidate", async ({ candidate }) => {
      await peer.addIceCandidate(candidate);
    });

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("ice:candidate");
    };
  }, [socket, handleUserJoined, handleIncommingCall, handleCallAccepted, remoteSocketId]);

  // UI helpers
  const toggleChat = () => setChatOpen((s) => !s);

  return (
    <div className={`room-root ${chatOpen ? "chat-open" : ""}`}>
      <header className="room-header">
        <div className="room-title">
          <div className="room-title-left">
            <h2>Video Session</h2>
            <div className="session-meta">
              <span className="meta-pill">Room: {roomId}</span>
              <span className="meta-pill">You: {email || "Anonymous"}</span>
            </div>
          </div>

          <div className="room-actions">
            <button
              className="chat-toggle-btn"
              aria-label={chatOpen ? "Close chat" : "Open chat"}
              onClick={toggleChat}
            >
              <span className="chat-icon">💬</span>
            </button>
          </div>
        </div>
      </header>

      <main className="room-main">
        <section className="video-area">
          <div className="video-stage">
            {/* Remote large video */}
            <div className="remote-video-card">
              {!remoteStream && (
                <div className="placeholder large">Waiting for participant...</div>
              )}
              {remoteStream && (
                <video
                  playsInline
                  autoPlay
                  ref={(video) => {
                    if (video) video.srcObject = remoteStream;
                  }}
                  className="remote-video"
                />
              )}

              <div className="remote-label">Participant</div>
            </div>

            {/* Local smaller preview (floats bottom-right of remote) */}
            <div className="local-preview-card">
              {!myStream && <div className="placeholder small">No camera</div>}
              {myStream && (
                <video
                  playsInline
                  muted
                  autoPlay
                  ref={(video) => {
                    if (video) video.srcObject = myStream;
                  }}
                  className="local-video"
                />
              )}

              <div className="local-label">You</div>
            </div>
          </div>

          {/* bottom controls */}
          <div className="video-controls">
            <div className="controls-left">
              <button className="control-btn">🎥 Toggle Video</button>
              <button className="control-btn">🔈 Toggle Mic</button>
            </div>

            <div className="controls-center">
              {/* If you want add end-call etc */}
              <button className="end-call-btn">End Call</button>
            </div>

            <div className="controls-right">
              <div className="status-badge">
                {connectionError ? (
                  <span className="status-error">{connectionError}</span>
                ) : remoteStream ? (
                  <span className="status-ok">Connected</span>
                ) : (
                  <span className="status-wait">Waiting...</span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Right sidebar placeholder for extra widgets */}
        <aside className="right-panel">
          <div className="right-box">
            <h4>Session Info</h4>
            <p><strong>Doctor:</strong> {doctorEmail || "-"}</p>
            <p><strong>Patient:</strong> {userEmail || "-"}</p>
            <p><strong>Room:</strong> {roomId}</p>
            <div className="right-actions">
              <button className="small-btn">Share Screen</button>
              <button className="small-btn">Recording</button>
            </div>
          </div>
        </aside>
      </main>

      {/* Chat box (component controls its own open/close animation) */}
      <ChatBox open={chatOpen} onClose={() => setChatOpen(false)} />

    </div>
  );
};

export default Room;
