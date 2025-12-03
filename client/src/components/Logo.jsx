import React from "react";

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
