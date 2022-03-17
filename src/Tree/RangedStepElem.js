import { useState, useEffect } from "react";
import { Slider } from "@mui/material";

const RangedStepElem = ({ label, format, range, state, setState }) => {

  const [rmin, rmax] = range;
  const [slide, setSlide] = useState({ min: state.min, max: state.max });

  useEffect(() => setSlide(state), [state]);

  return (
    <div className="stepelem">
      <div style={{ textAlign: "center" }}>
        <input type="checkbox" checked={state.checked} onChange={e =>
          setState({ ...state, checked: !state.checked })
        } />
        {label}
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
          valueLabelDisplay="auto"
          valueLabelFormat={format}
          step={ (rmax - rmin) / 100 }
          min={rmin}
          max={rmax}
          size="small"
        />
    </div>
  )
}

export default RangedStepElem;