import React from "react";

// besoin : -name
//           -label
//          - value
//           -onChange
//          -placeholder
//          -type
//          -error

const Field = ({id, name, label, value, onChange, placeholder, type = "text", error = ""}) => {
  return (
    <div className="form-group">
        <label htmlFor={name}>{label}</label>
      <input
        id={id ? id : name}
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        name={name}
        className={"form-control" + (error && " is-invalid")}
      />
      {error && <p className="invalid-feedback">{error}</p>}
    </div>
  );
};

export default Field;
