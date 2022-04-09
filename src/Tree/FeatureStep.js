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

  renderRightHeader(setNode) {
    return <StepConfig step={this} setStep={setNode} position={ this.isRoot ? "right top" : "right center"} />
  }

});

export default FeatureStep;

const StepConfig = ({ step, setStep, position }) => {

  //⚙️
  return <Popup
    arrow={true}
    trigger={<button className="configButton">...</button>}
    position={position}
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

