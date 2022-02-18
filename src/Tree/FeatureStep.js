import { useState, useEffect, useContext } from "react";
import { Slider } from "@mui/material";
import { SongContext } from "../Spec"; // bit hacky
import Step from "./Step";

const FeatureStep = (type, id) => ({
  ...Step(type, id), 

  format() {
    throw new Error("format() not overridden");
  },

  ranges(songs) {
    throw new Error("ranges() not overriden");
  },

  renderChildren(setNode) {
    return <StepBody step={this} setStep={setNode} format={this.format} ranges={this.ranges} />
  }

});

export default FeatureStep;

const StepBody = ({ step, setStep, format, ranges }) => {

  const { bpm, acous, dance } = step.state;

  const updateState = (val) => setStep({ ...step, state: { ...step.state, ...val } });

  const songs = useContext(SongContext);
  const rs = ranges(songs);

  return (
    <div>
      <StepElem feature="BPM   " format={format} range={rs.bpm} state={bpm} setState={bpm => updateState({ bpm })} />
      <StepElem feature="Acous." format={format} range={rs.acous} state={acous} setState={acous => updateState({ acous })} />
      <StepElem feature="Dance." format={format} range={rs.dance} state={dance} setState={dance => updateState({ dance })} />
    </div>
  )
}

const StepElem = ({ feature, format, range, state, setState }) => {

  const [rmin, rmax] = range;
  const [slide, setSlide] = useState({ min: state.min, max: state.max });

  useEffect(() => setSlide(state), [state]);

  return (
    <div className="stepelem">
      <div style={{ textAlign: "center" }}>
        <input type="checkbox" checked={state.checked} onChange={e =>
          setState({ ...state, checked: !state.checked })
        } />
        {feature}
      </div>
      <div>
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
          min={rmin}
          max={rmax}
          size="small"
        />
      </div>
    </div>
  )
}