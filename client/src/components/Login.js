import React, { useState } from "react";
import "../styles/Login.css";

export default function Login({ setUsername, setRoom }) {
  const [name, setName] = useState("");
  const [roomInput, setRoomInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && roomInput) {
      setUsername(name);
      setRoom(roomInput);
    }
  };

  return (
    <div className="login-container">
      <h1>Join a Video Call</h1>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Enter room name"
          value={roomInput}
          onChange={(e) => setRoomInput(e.target.value)}
        />
        <button type="submit">Join</button>
      </form>
    </div>
  );
}
