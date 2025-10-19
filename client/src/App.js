import React, { useState } from "react";
import Login from "./components/Login";
import VideoCall from "./components/VideoCall";

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");

  if (!username || !room) {
    return <Login setUsername={setUsername} setRoom={setRoom} />;
  }

  return <VideoCall username={username} room={room} />;
}

export default App;
