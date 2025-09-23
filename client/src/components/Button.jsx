import React from "react";
import "./Button.css";

/**
 * Reusable Button component with different variants and sizes
 * @param {Object} props - Button props
 * @param {string} props.children - Button text content
 * @param {string} props.variant - Button variant: 'primary', 'secondary', 'outline'
 * @param {string} props.size - Button size: 'small', 'medium', 'large'
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {function} props.onClick - Click handler function
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.type - Button type: 'button', 'submit', 'reset'
 * @returns {JSX.Element} Button component
 */
const Button = ({
  children,
  variant = "primary",
  size = "medium",
  disabled = false,
  onClick,
  className = "",
  type = "button",
  ...props
}) => {
  const buttonClasses = [
    "btn",
    `btn--${variant}`,
    `btn--${size}`,
    disabled && "btn--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      {...props}>
      {children}
    </button>
  );
};

export default Button;
