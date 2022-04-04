import { useState, useEffect } from "react";
import { Slider } from "@mui/material";

const RangedStepElem = ({ label, format, range, state, setState }) => {

  const [rmin, rmax] = range;
  const [slide, setSlide] = useState({ min: state.min, max: state.max });

  useEffect(() => setSlide(state), [state]);


  return (
    <div className="stepElem">

      <button id="x" onClick={() => setState({ ...state, checked: false })}
        className="smallDelButton"> - </button>

      <div className="stepElemBody">
        <div className="stepElemValsAndLabel">
          <font size={1} className="stepElemTexts">{format(slide.min)}</font>
          <span className="stepElemTexts">{label}</span>
          <font size={1} className="stepElemTexts">{format(slide.max)}</font>
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
          step={(rmax - rmin) / 100}
          min={rmin} max={rmax} size="small"
          />
      </div>
    </div>
  )
}

export default RangedStepElem;