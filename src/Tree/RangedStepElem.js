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