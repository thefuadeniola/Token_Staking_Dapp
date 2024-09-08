import React from "react";

const InputField = ({ size, type, title, name, placeholder, handleChange, value, disabled }) => {
  return (
  <div className={`col-12 col-xl-${size}`}>
    <div className="form__group">
      <label htmlFor={name} className="form__label">{title}</label>
      <input type={type} id={name} name={name} className="form__input" onChange={handleChange} placeholder={placeholder} value={value} disabled={disabled}/>
    </div>
  </div>
);
};

export default InputField;
