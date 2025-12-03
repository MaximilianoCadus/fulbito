import React, { useState, useEffect } from "react";
import { locationService } from "../services";
import "./LocalitySelect.css";

const LocalitySelect = ({
  value,
  onChange,
  onPostalCodeChange,
  error,
  required = false,
  disabled = false,
}) => {
  const [localities, setLocalities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const loadLocalities = async () => {
      try {
        setLoading(true);
        const data = await locationService.getAllLocalidades();
        setLocalities(data);
        setLoadError("");
      } catch (err) {
        console.error("Error loading localities:", err);
        setLoadError("Error al cargar las localidades");
      } finally {
        setLoading(false);
      }
    };

    loadLocalities();
  }, []);

  const handleSelectChange = (e) => {
    const selectedId = e.target.value;

    // Find the selected locality to extract postal code and name
    const selectedLocality = localities.find(
      (locality) => locality._id === selectedId
    );

    // Update locality value with the name (not ID) since backend expects name
    onChange({
      target: {
        name: "localidad",
        value: selectedLocality ? selectedLocality.nombre : "",
      },
    });

    // Automatically populate postal code if onPostalCodeChange is provided
    if (onPostalCodeChange && selectedLocality) {
      onPostalCodeChange({
        target: {
          name: "codigoPostal",
          value: selectedLocality.cp,
        },
      });
    }
  };

  if (loading) {
    return (
      <div className="locality-select">
        <label className="locality-select__label">
          Localidad {required && <span className="required">*</span>}
        </label>
        <div className="locality-select__loading">Cargando localidades...</div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="locality-select">
        <label className="locality-select__label">
          Localidad {required && <span className="required">*</span>}
        </label>
        <div className="locality-select__error">{loadError}</div>
      </div>
    );
  }

  return (
    <div className="locality-select">
      <label className="locality-select__label">
        Localidad {required && <span className="required">*</span>}
      </label>
      <select
        className={`locality-select__input ${error ? "error" : ""}`}
        value={localities.find((loc) => loc.nombre === value)?._id || ""}
        onChange={handleSelectChange}
        disabled={disabled}
        required={required}>
        <option value="">Seleccionar localidad...</option>
        {localities.map((locality) => (
          <option key={locality._id} value={locality._id}>
            {locality.nombre} ({locality.cp})
          </option>
        ))}
      </select>
      {error && <span className="locality-select__error">{error}</span>}
    </div>
  );
};

export default LocalitySelect;
