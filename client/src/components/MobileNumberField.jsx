import React, { useState, useEffect } from "react";
import "./MobileNumberField.css";

/**
 * Argentina mobile number field with automatic +54 prefix and formatting
 * Displays Argentine flag and +54 prefix, user only enters area code and number
 * @param {Object} props - Component props
 * @param {string} props.value - Current phone number value
 * @param {function} props.onChange - Change handler
 * @param {string} props.error - Error message
 * @param {boolean} props.required - Required field indicator
 * @param {boolean} props.disabled - Disabled state
 * @returns {JSX.Element} MobileNumberField component
 */
const MobileNumberField = ({
  value,
  onChange,
  error,
  required = false,
  disabled = false,
}) => {
  const [displayValue, setDisplayValue] = useState("");

  // Format phone number for display (area code + number format: XXX XXX-XXXX)
  const formatPhoneForDisplay = (phone) => {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, "");

    // Remove +54 and 9 prefixes if present
    let cleanDigits = digits;
    if (digits.startsWith("549")) {
      cleanDigits = digits.substring(3);
    } else if (digits.startsWith("54")) {
      cleanDigits = digits.substring(2);
      if (cleanDigits.startsWith("9")) {
        cleanDigits = cleanDigits.substring(1);
      }
    } else if (cleanDigits.startsWith("9")) {
      cleanDigits = cleanDigits.substring(1);
    }

    // Format as: XXX XXX-XXXX
    if (cleanDigits.length === 0) return "";
    if (cleanDigits.length <= 3) return cleanDigits;
    if (cleanDigits.length <= 6)
      return `${cleanDigits.slice(0, 3)} ${cleanDigits.slice(3)}`;
    return `${cleanDigits.slice(0, 3)} ${cleanDigits.slice(
      3,
      6
    )}-${cleanDigits.slice(6, 10)}`;
  };

  // Get raw phone number for API (with +54 prefix)
  const getRawPhoneNumber = (phone) => {
    const digits = phone.replace(/\D/g, "");
    let cleanDigits = digits;

    // Remove +54 prefix if present
    if (digits.startsWith("54")) {
      cleanDigits = digits.substring(2);
    }

    // Remove leading 9 if present
    if (cleanDigits.startsWith("9")) {
      cleanDigits = cleanDigits.substring(1);
    }

    // Return in format: +549XXXXXXXXX (E.164 format for Argentina mobiles)
    // Ensure exactly 10 digits after +549
    if (cleanDigits.length >= 10) {
      return `+549${cleanDigits.substring(0, 10)}`;
    }

    return cleanDigits.length > 0 ? `+549${cleanDigits}` : "";
  };

  // Update display value when prop value changes
  useEffect(() => {
    setDisplayValue(formatPhoneForDisplay(value || ""));
  }, [value]);

  const handleInputChange = (e) => {
    const inputValue = e.target.value;

    // Allow only digits, spaces, dashes, and plus
    const sanitized = inputValue.replace(/[^\d\s\-+]/g, "");

    // Extract digits only for processing
    const digits = sanitized.replace(/\D/g, "");

    // Limit to 10 digits (Argentina mobile without country code and 9 prefix)
    let limitedDigits = digits;
    if (digits.startsWith("54")) {
      limitedDigits = digits.substring(2);
    }
    if (limitedDigits.startsWith("9")) {
      limitedDigits = limitedDigits.substring(1);
    }
    limitedDigits = limitedDigits.substring(0, 10);

    // Update display value
    const formatted = formatPhoneForDisplay(limitedDigits);
    setDisplayValue(formatted);

    // Send raw value to parent
    const rawValue = getRawPhoneNumber(limitedDigits);
    onChange({
      target: {
        name: "nroCelular",
        value: rawValue,
      },
    });
  };

  const handleFocus = () => {
    // No need to add prefix in display, just focus
  };

  const handleBlur = () => {
    // Clean up any incomplete formatting
  };

  const handleKeyDown = (e) => {
    // Allow backspace, delete, arrow keys, and tab
    if (
      e.key === "Backspace" ||
      e.key === "Delete" ||
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "Tab"
    ) {
      return;
    }

    // Only allow digits
    if (!/\d/.test(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div
      className={`mobile-number-field ${
        error ? "mobile-number-field--error" : ""
      }`}>
      <label className="mobile-number-field__label">
        Número de celular{" "}
        {required && <span className="mobile-number-field__required">*</span>}
      </label>
      <div className="mobile-number-field__input-wrapper">
        <div className="mobile-number-field__prefix">
          <span className="mobile-number-field__flag" title="Argentina">
            🇦🇷
          </span>
          <span className="mobile-number-field__code">+54</span>
        </div>
        <input
          type="tel"
          className="mobile-number-field__input"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="285 467-1923"
          maxLength={12} // XXX XXX-XXXX
          disabled={disabled}
          autoComplete="tel"
        />
      </div>
      {error && <span className="mobile-number-field__error">{error}</span>}
    </div>
  );
};

export default MobileNumberField;
