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

import MySwitch from "../Switch";
import IntInput from "./IntInput";

const colours = ["#9966FF", "#39add0", "#3CAEA3", "#F6D55C", "#ED553B"];

const MAX_LIMIT = 8;

const Node = (type, id) => ({
  type,
  label: type + " Step",
  id: `${type}-${id}`,
  loops: 1,
  colour: colours[+id % colours.length],

  MAX_LIMIT,
  isMax: false,

  apply() {
    throw new Error("apply() not overriden");
  },

  view(setNode, onDel) {
    return (
      <div key={id} className="treeNode" style={{ backgroundColor: this.colour }}>
        <div className="nodeHeader">
          <div className="nodeHeaderLeft">
            {this.label}
          </div>
          <div className="nodeHeaderMid">
            <Loop state={this} setState={setNode} />
          </div>
          <div className="nodeHeaderRight">
            {this.renderRightHeader(setNode)}
            {!this.isRoot
              ? <button type="button" className="delButton" onClick={onDel}>x</button>
              : <button type="button" className="delButton" style={{ opacity: 0 }}>x</button>}
          </div>
        </div>
        <div className="nodeBody">
          {this.renderChildren(setNode)}
        </div>
      </div>
    )
  },

  renderRightHeader(setNode) {
    return null;
  },

  renderChildren(setNode) {
    throw new Error("renderChildren() not overriden");
  },

});

export default Node;

const Loop = ({ state, setState }) => {

  const { loops, isMax } = state;

  const setLoops = (n) => setState({ ...state, loops: n });
  const toggleIsMax = () => setState({ ...state, isMax: !state.isMax });

  const idfun = x => x;

  return (
    <div className="loops">
      <label htmlFor="lps">Loops: </label>
      <IntInput id="lps" value={loops} min={1} max={MAX_LIMIT}
        format={{ fRead: idfun, fEdit: idfun, uFEdit: idfun }}
        className="loopsNumInput"
        setValue={setLoops}
        disabled={isMax ? "disabled" : ""} />
      {state.canMax()
        ? <>
          <div style={{ margin: "0px 5px" }} >
            <MySwitch checked={isMax} onChange={toggleIsMax} />
          </div>
          <label htmlFor="cb"><font size={1}>Max</font></label>
        </>
        // hack to align buttons
        : <>
          <div style={{ margin: "0px 5px", opacity: 0 }} >
            <MySwitch checked={isMax} onChange={() => { }} />
          </div>
          <label style={{ opacity: 0 }} htmlFor="cb">Max</label>

        </>
      }
    </div>
  )
}