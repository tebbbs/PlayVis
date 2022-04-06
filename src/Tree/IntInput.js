// HTML Number Input field with validation for values entered by keyboard
import { useEffect, useState } from 'react';

const IntInput = (props) => {

  const { value, min, max, setValue, format, ...htmlProps } = props;
  const { fRead, fEdit, uFEdit } = format;

  const [isEditing, setIsEditing] = useState(false);
  const toggleEditing = () => setIsEditing(e => !e);
  
  const [tempVal, setTempVal] = useState(value);
  useEffect(() => setTempVal(value), [value]);

  const isValid = (val) => min <= val && val <= max;

  return isEditing
    ? <input
    className="featNumInput"
    {...htmlProps}
    min={fEdit(min)}
    max={fEdit(max)}
    type="number"
    value={fEdit(tempVal)}
    onChange={e => {
      const val = uFEdit(e.target.value);
      // limit num. digits
      if (val < 1000 && val > -100)
      setTempVal(val);
    }}
    onKeyDown={e => e.key === '.' && e.preventDefault()}
    onKeyPress={e => e.key === 'Enter' && isValid(tempVal) && setValue(tempVal)}
    onBlur={() => {
      if (isValid(tempVal)) setValue(tempVal);
      toggleEditing();
    }}
    />
    : <input
      className="featNumInput"
      {...htmlProps}
      type="text"
      value={fRead(value)}
      onFocus={() => {
        setTempVal(value);
        toggleEditing();
      }}
      readOnly
    />

}

export default IntInput;