import MySwitch from "../Switch";
import IntInput from "./IntInput";

const colours = ["#9966FF", "#20639B", "#3CAEA3", "#F6D55C", "#ED553B"];

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
              : <button type="button" className="delButton" style={{ opacity: 0 }}></button>}
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

  return (
    <div className="loops">
      <label htmlFor="lps">Loops: </label>
      <IntInput id="lps" value={loops} min={1} max={MAX_LIMIT}
        style={{ margin: "0 0 0 8px" }}
        setValue={setLoops}
        disabled={isMax ? "disabled" : ""} />
      {state.canMax()
        ? <>
          <div style={{ margin: "0px 5px 0 5px" }} >
            <MySwitch checked={isMax} onChange={toggleIsMax} />
          </div>
          <label htmlFor="cb"><font size={1}>Max</font></label>
        </>
        // hack to align buttons
        : <>
          <div style={{ margin: "0px 5px 0 5px", opacity: 0 }} >
            <MySwitch checked={isMax} onChange={() => { }} />
          </div>
          <label style={{ opacity: 0 }} htmlFor="cb">Max</label>

        </>
      }
    </div>
  )
}