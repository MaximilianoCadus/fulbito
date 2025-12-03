import React from "react";
import "./FloorTypeSelect.css";

const FloorTypeSelect = ({
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = "",
}) => {
  // Floor type options based on Cancha model enum
  const floorTypes = [
    { value: "", label: "Cualquier tipo de piso" },
    { value: "sintetico", label: "Sintético" },
    { value: "cesped", label: "Césped" },
    { value: "salon", label: "Salón" },
  ];

  const handleChange = (e) => {
    if (onChange) {
      // Create synthetic event that matches FormField pattern
      const syntheticEvent = {
        target: {
          name: "tipoPiso",
          value: e.target.value,
        },
      };
      onChange(syntheticEvent);
    }
  };

  return (
    <div
      className={`floor-type-select ${className} ${error ? "has-error" : ""}`}>
      <label className="floor-type-label">
        Tipo de piso
        {required && <span className="required-indicator"> *</span>}
      </label>

      <div className="floor-type-input-container">
        <select
          name="tipoPiso"
          value={value || ""}
          onChange={handleChange}
          disabled={disabled}
          className="floor-type-input"
          aria-describedby={error ? "floor-type-error" : undefined}
          required={required}>
          {floorTypes.map((floor) => (
            <option key={floor.value} value={floor.value}>
              {floor.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p id="floor-type-error" className="error-message" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default FloorTypeSelect;
