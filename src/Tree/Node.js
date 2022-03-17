const colours = ["#173F5F", "#20639B", "#3CAEA3", "#F6D55C", "#ED553B"];

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
        <div key={id} className="treenode" style={{ backgroundColor: this.colour }}>
          <div style={{ display: "flex", justifyContent: "space-between", align: "center" }}>
            {this.label}
            <Loop state={this} setState={setNode} />
            {this.renderMidHeader(setNode)}
            {!this.isRoot ? 
              <button type="button" style={{ backgroundColor: "red" }} onClick={onDel}>x</button>
              :  <button type="button" style={{ backgroundColor: "#00000000" }} onClick={_ => {}}></button>}
          </div>
          {this.renderChildren(setNode)}
        </div >
      )
  },

  renderMidHeader(setNode) {
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
    <div>
      Loops:
      <input type="number" className="valInput" value={loops} min="1" onChange={(e) => setLoops(+e.target.value)}
        disabled={isMax ? "disabled" : ""} />
      {canMax &&
        <>
          <input type="checkbox" checked={isMax} onChange={toggleIsMax} />
          Max
        </>}
    </div>
  )
}