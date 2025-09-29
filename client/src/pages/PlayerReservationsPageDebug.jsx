import React, { useState, useEffect } from "react";
import { reservaService } from "../services";

// Simplified debug version
const PlayerReservationsPageDebug = ({ onNavigate, user }) => {
  const [debugInfo, setDebugInfo] = useState("");
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const debug = async () => {
      console.log("DEBUG: Component mounted");
      console.log("DEBUG: User prop:", user);
      console.log("DEBUG: onNavigate prop:", onNavigate);

      setDebugInfo(`User: ${JSON.stringify(user, null, 2)}`);

      if (user?.jugador?._id) {
        try {
          console.log(
            "DEBUG: Fetching reservations for player:",
            user.jugador._id
          );
          const result = await reservaService.getReservasByJugador(
            user.jugador._id
          );
          console.log("DEBUG: Reservations result:", result);
          setReservations(result);
          setError("");
        } catch (err) {
          console.error("DEBUG: Error fetching reservations:", err);
          setError(`Error: ${err.message}`);
        }
      } else {
        setError("No player ID found in user object");
      }

      setIsLoading(false);
    };

    debug();
  }, [user]);

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>Debug: Player Reservations Page</h1>

      <div
        style={{
          marginBottom: "20px",
          padding: "10px",
          border: "1px solid #ccc",
        }}>
        <h3>Debug Info:</h3>
        <pre>{debugInfo}</pre>
      </div>

      <div
        style={{
          marginBottom: "20px",
          padding: "10px",
          border: "1px solid #ccc",
        }}>
        <h3>Status:</h3>
        <p>Loading: {isLoading ? "Yes" : "No"}</p>
        <p>Error: {error || "None"}</p>
        <p>Reservations count: {reservations.length}</p>
      </div>

      {reservations.length > 0 && (
        <div
          style={{
            marginBottom: "20px",
            padding: "10px",
            border: "1px solid #ccc",
          }}>
          <h3>Reservations:</h3>
          <pre>{JSON.stringify(reservations, null, 2)}</pre>
        </div>
      )}

      <button onClick={() => onNavigate && onNavigate("player-home")}>
        Back to Home
      </button>
    </div>
  );
};

export default PlayerReservationsPageDebug;
