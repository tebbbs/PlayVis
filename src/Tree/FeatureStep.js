import { useContext } from "react";
import { SongContext } from "../Spec";

import React from "react";
import Step from "./Step";

import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

const FeatureStep = (type, id) => ({
  ...Step(type, id),

  checkedFeatures() {
    return Object.entries(this.state)
      .filter(([_, featState]) => featState.checked);
  },

  renderChildren(setNode) {
    return <StepBody step={this} setStep={setNode} />
  },

  renderMidHeader(setNode) {
    return <StepConfig step={this} setStep={setNode} />
  },

  renderRightHeader(setNode) {
    return <StepConfig step={this} setStep={setNode} />
  }

});

export default FeatureStep;

const StepConfig = ({ step, setStep }) => {

  //⚙️
  return <Popup
    arrow={true}
    trigger={<button className="configButton">...</button>}
    position="right center"
    offsetX={40}
    contentStyle={{ height: "auto", width: "auto" }}
  >
    <div style={{ height: "400px", width: "600px", overflow: "scroll" }}>
      {Object.entries(step.state).map(([featname, feat], i) => {

        const { name, desc } = feat;

        const upateChecked = () =>
          setStep({
            ...step,
            state: {
              ...step.state,
              [featname]: { ...feat, checked: !feat.checked }
            }
          });

        return (
          <div key={i}>
            <p><input type="checkbox" checked={feat.checked} onChange={upateChecked} /><strong>{name}</strong></p>
            <p>{desc}</p>
          </div>
        )
      })}
    </div>
  </Popup>

}

const StepBody = ({ step, setStep }) => {

  // change the value of one feature e.g. BPM
  const updateState = feat => setStep({ ...step, state: { ...step.state, ...feat } });

  // change the value of *one value* of one feature e.g. min, max, checked
  const updateFeat = feat => val => updateState({ [feat]: val })

  const songs = useContext(SongContext);

  return (
    <div className="stepBody">
      {
        step.checkedFeatures().length
          ? step.checkedFeatures()
            .map(([featName, feat]) => feat.view(songs, updateFeat(featName)))
            .map((e, i) => React.cloneElement(e, { key: i }))
          : <span style={{ textAlign: "center", padding: "20px 0" }}> [any song] </span>
      }
    </div>);

}

