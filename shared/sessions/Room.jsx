import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSocket } from "../../shared/sessions/providers/Socket";
import peer from "../../shared/sessions/providers/Peer";

const Room = ({ userEmail, roomId }) => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const sendStreams = useCallback(() => {
    if (!myStream) return;
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleUserJoined = useCallback(({ email, id }) => {
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setMyStream(stream);
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setMyStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const answer = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans: answer });
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

  useEffect(() => {
    peer.peer.addEventListener("track", (event) => {
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    });

    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);

    socket.emit("room:join", { email: userEmail, room: roomId });

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
    };
  }, [socket, handleUserJoined, handleIncommingCall, handleCallAccepted, userEmail, roomId]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Video Session</h1>

      <div className="flex gap-4">
        <div>
          <h3>Your Stream</h3>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-80 h-60 bg-black"
          />
        </div>

        <div>
          <h3>Remote Stream</h3>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-80 h-60 bg-black"
          />
        </div>
      </div>

      {remoteSocketId && (
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          onClick={handleCallUser}
        >
          Call Remote
        </button>
      )}
    </div>
  );
};

export default Room;
