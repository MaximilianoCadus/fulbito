import React from "react";
import "./FormField.css";

/**
 * Reusable form field component with validation support
 * @param {Object} props - FormField props
 * @param {string} props.label - Field label text
 * @param {string} props.name - Field name attribute
 * @param {string} props.type - Input type (text, email, password, tel, etc.)
 * @param {string} props.value - Current field value
 * @param {function} props.onChange - Change handler function
 * @param {function} props.onBlur - Blur handler function
 * @param {string} props.error - Error message to display
 * @param {boolean} props.required - Whether field is required
 * @param {string} props.placeholder - Placeholder text
 * @param {number} props.maxLength - Maximum character length
 * @param {string} props.pattern - Regex pattern for validation
 * @param {boolean} props.disabled - Whether field is disabled
 * @returns {JSX.Element} FormField component
 */
const FormField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  required = false,
  placeholder,
  maxLength,
  pattern,
  disabled = false,
  ...props
}) => {
  const fieldId = `field-${name}`;
  const errorId = `error-${name}`;

  return (
    <div className={`form-field ${error ? "form-field--error" : ""}`}>
      <label htmlFor={fieldId} className="form-field__label">
        {label}
        {required && <span className="form-field__required">*</span>}
      </label>
      <input
        id={fieldId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        pattern={pattern}
        required={required}
        disabled={disabled}
        className="form-field__input"
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? "true" : "false"}
        {...props}
      />
      {error && (
        <span id={errorId} className="form-field__error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default FormField;
