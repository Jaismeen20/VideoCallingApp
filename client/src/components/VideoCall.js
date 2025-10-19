import React, { useRef, useEffect, useState } from "react";
import { io } from "socket.io-client";
import "../styles/VideoCall.css";

const socket = io("http://localhost:5000");

export default function VideoCall({ username, room }) {
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const pcRef = useRef();
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  let otherUserId;

  useEffect(() => {
    const pc = new RTCPeerConnection();
    pcRef.current = pc;

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localVideoRef.current.srcObject = stream;
        stream.getTracks().forEach(track => pc.addTrack(track, stream));
      });

    pc.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && otherUserId) {
        socket.emit("ice-candidate", { target: otherUserId, candidate: event.candidate });
      }
    };

    socket.emit("join-room", room);

    socket.on("user-joined", (id) => {
      otherUserId = id;
      pc.createOffer()
        .then(offer => pc.setLocalDescription(offer))
        .then(() => {
          socket.emit("offer", { sdp: pc.localDescription, target: id, caller: socket.id });
        });
    });

    socket.on("offer", async (data) => {
      otherUserId = data.caller;
      await pc.setRemoteDescription(data.sdp);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", { sdp: answer, target: data.caller });
    });

    socket.on("answer", async (data) => {
      await pc.setRemoteDescription(data.sdp);
    });

    socket.on("ice-candidate", async (candidate) => {
      await pc.addIceCandidate(candidate);
    });

  }, [room]);

  const toggleMic = () => {
    const stream = localVideoRef.current.srcObject;
    stream.getAudioTracks()[0].enabled = !micOn;
    setMicOn(!micOn);
  };

  const toggleVideo = () => {
    const stream = localVideoRef.current.srcObject;
    stream.getVideoTracks()[0].enabled = !videoOn;
    setVideoOn(!videoOn);
  };

  return (
    <div className="video-call-container">
      <h2>Room: {room} | User: {username}</h2>
      <div className="video-container">
        <video ref={localVideoRef} autoPlay muted />
        <video ref={remoteVideoRef} autoPlay />
      </div>
      <div className="controls">
        <button onClick={toggleMic}>{micOn ? "Mute" : "Unmute"}</button>
        <button onClick={toggleVideo}>{videoOn ? "Video Off" : "Video On"}</button>
        <button onClick={() => window.location.reload()}>Leave</button>
      </div>
    </div>
  );
}
