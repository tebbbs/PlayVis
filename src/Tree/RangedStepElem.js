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

import { useState, useEffect } from "react";
import { Slider } from "@mui/material";
import IntInput from "./IntInput";

const RangedStepElem = ({ label, format, range, state, setState }) => {

  const [rmin, rmax] = range;
  const [slide, setSlide] = useState({ min: state.min, max: state.max });

  useEffect(() => setSlide(state), [state]);

  return (
    <div className="stepElem">

      <button id="x" onClick={() => setState({ ...state, checked: false })}
        className="smallDelButton"> - </button>

      <span className="stepElemLabel">{label}</span>
      <div className="stepElemBody">
        <div className="stepElemVals">
          <IntInput
            format={format}
            min={rmin} 
            max={slide.max}
            value={slide.min}
            setValue={val => setState({ ...state, min: val })}
          />
          <IntInput
            format={format}
            min={slide.min}
            max={rmax}
            value={slide.max}
            setValue={val => setState({ ...state, max: val })}
          />
        </div>
        <Slider
          value={[slide.min, slide.max]}
          onChange={e => {
            const [min, max] = e.target.value;
            setSlide({ min, max });
          }}
          onChangeCommitted={e => {
            setState(({ ...state, ...slide }));
          }}
          step={format.step}
          min={rmin} max={rmax} size="small"
        />
      </div>
    </div>
  )
}

export default RangedStepElem;