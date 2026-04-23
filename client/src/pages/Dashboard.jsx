import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearToken } from "../services/auth";

const Dashboard = () => {
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const createRoomId = () => {
    const id = Math.random().toString(36).slice(2, 10).toUpperCase();
    navigate(`/room/${id}`);
  };

  const joinRoom = () => {
    const trimmedRoomId = roomId.trim().toUpperCase();
    if (!trimmedRoomId) return;
    navigate(`/room/${trimmedRoomId}`);
  };

  const handleLogout = () => {
    clearToken();
    navigate("/login");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>MockSync Dashboard</h1>

      <div style={{ marginTop: "16px" }}>
        <input
          type="text"
          placeholder="Enter room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />

        <button onClick={createRoomId} style={{ marginLeft: "8px" }}>
          Create Room
        </button>

        <button
          onClick={joinRoom}
          style={{ marginLeft: "8px" }}
          disabled={!roomId.trim()}
        >
          Join Room
        </button>

        <button onClick={handleLogout} style={{ marginLeft: "8px" }}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
