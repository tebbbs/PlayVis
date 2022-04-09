/*
 * Created on Sat Apr 09 2022
 *
 * The MIT License (MIT)
 * Copyright (c) 2022 Joseph Tebbett, University of Birmingham
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software
 * and associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial
 * portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

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
        // limit num. chars
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