import React from "react";
import "./PlayerCountSelect.css";

/**
 * Player count selection component for courts search
 * Supports the player count options from the Cancha model: 5, 6, 7, 8, 9, 11
 * @param {Object} props - Component props
 * @param {number|string} props.value - Selected player count value
 * @param {function} props.onChange - Change handler function
 * @param {string} [props.error] - Error message to display
 * @param {boolean} [props.required] - Whether the field is required
 * @param {boolean} [props.disabled] - Whether the field is disabled
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} PlayerCountSelect component
 */
const PlayerCountSelect = ({
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = "",
}) => {
  // Player count options based on Cancha model enum
  const playerCounts = [
    { value: "", label: "Cualquier cantidad" },
    { value: 5, label: "5 jugadores" },
    { value: 6, label: "6 jugadores" },
    { value: 7, label: "7 jugadores" },
    { value: 8, label: "8 jugadores" },
    { value: 9, label: "9 jugadores" },
    { value: 11, label: "11 jugadores" },
  ];

  const handleChange = (e) => {
    if (onChange) {
      // Create synthetic event that matches FormField pattern
      const syntheticEvent = {
        target: {
          name: "cantJugadores",
          value: e.target.value ? parseInt(e.target.value, 10) : "",
        },
      };
      onChange(syntheticEvent);
    }
  };

  return (
    <div
      className={`player-count-select ${className} ${
        error ? "has-error" : ""
      }`}>
      <label className="player-count-label">
        Cantidad de jugadores
        {required && <span className="required-indicator"> *</span>}
      </label>

      <div className="player-count-input-container">
        <select
          name="cantJugadores"
          value={value || ""}
          onChange={handleChange}
          disabled={disabled}
          className="player-count-input"
          aria-describedby={error ? "player-count-error" : undefined}
          required={required}>
          {playerCounts.map((count) => (
            <option key={count.value} value={count.value}>
              {count.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p id="player-count-error" className="error-message" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default PlayerCountSelect;
