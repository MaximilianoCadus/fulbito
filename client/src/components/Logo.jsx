import React from "react";

/**
 * Logo component that displays the Fulbito logo
 * @param {Object} props - Component props
 * @param {string} [props.size="24"] - Size of the logo in pixels
 * @param {string} [props.className=""] - Additional CSS classes
 * @param {string} [props.alt="Fulbito Logo"] - Alt text for the logo
 * @returns {JSX.Element} Logo component
 */
const Logo = ({ size = "24", className = "", alt = "Fulbito Logo" }) => {
  return (
    <img
      src="/Fulbito Ya! - Logo.png"
      alt={alt}
      width={size}
      height={size}
      className={`fulbito-logo ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: "contain",
      }}
    />
  );
};

export default Logo;
