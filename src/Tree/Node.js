const colours = ["#9966FF", "#20639B", "#3CAEA3", "#F6D55C", "#ED553B"];


const Node = (type, id) => ({
  type,
  label: type + " Step",
  id: `${type}-${id}`,
  loops: 1,
  colour: colours[+id % colours.length],
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
              : <button type="button" className="delButton" style={{ backgroundColor: "#00000000" }}></button>}
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

  const { loops, isMax, type, isRoot } = state;
  const setLoops = (n) => setState({ ...state, loops: n });
  const toggleIsMax = () => setState({ ...state, isMax: !state.isMax });
  const canMax = type === "Relative" || (type === "Group" && !isRoot);

  return (
    <div className="loops">
      <label htmlFor="lps">Loops: </label>
      {/* below is a hack to get space between label and input */}
      <div style={{ width: "8px"}} > </div> 
      <input id="lps" type="number" className="valInput" value={loops} min="1" onChange={(e) => setLoops(+e.target.value)}
        disabled={isMax ? "disabled" : ""} />
      {canMax
        ? <>
          <input id="cb" type="checkbox" checked={isMax} onChange={toggleIsMax} />
          <label htmlFor="cb"><font size={1}>Max</font></label>
        </>
        // hack to align buttons
        : <> 
          <input style={{ opacity: 0 }} id="cb" type="checkbox" />
          <label style={{ opacity: 0 }} htmlFor="cb">Max</label>

        </>
      }
    </div>
  )
}