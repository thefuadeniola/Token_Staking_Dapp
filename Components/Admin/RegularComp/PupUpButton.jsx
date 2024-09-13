import React from "react";

const PupUpButton = ({title, handleClick}) => {
  return (
    <button onClick={handleClick} className="form__btn" type="button">{title}</button>
  );
};

export default PupUpButton;
