import React from "react";
import "./FormField.css";

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
