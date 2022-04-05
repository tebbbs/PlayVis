import _uniqueId from 'lodash/uniqueId';
import Node from "./Node";
import AbsStep from "./AbsStep";
import RelStep from "./RelStep";

const Group = (id) => ({
  ...Node("Group", id),
  children: [],
  collapsed: false,
  label: "Group",

  canMax() { return this.children.length > 0 },

  apply(dag, songs, allowReps) {
    return this.isMax 
      ? this.applyMax(dag, songs, allowReps)
      : this.applyLoop(dag, songs, allowReps);
  },

  applyMax(dag, songs, allowReps) {
    let nextDag = dag;
    let hasResult = true;
    for (let i = 0; i < this.MAX_LIMIT && hasResult; i++) {
      // Loop over children, see if they can be applied
      for (let j = 0; j < this.children.length && hasResult; j++) {
        nextDag = this.children[j].apply(nextDag, songs, allowReps);
        if (!nextDag) {
          hasResult = false;
          break;
        }
      }
      // If all children can be expanded, update dag
      if (hasResult) dag = nextDag;
    }
    return dag;
  },

  applyLoop(dag, songs, allowReps) {
    for (let i = 0; i < this.loops; i++)
      for (let j = 0; j < this.children.length; j++)
        dag = this.children[j].apply(dag, songs, allowReps);
    return dag;
  },

  renderChildren(setNode) {

    const { children, collapsed } = this;

    const delChild = (delid) =>
      setNode({ ...this, children: children.filter(child => child.id !== delid) });

    const addChild = (newc) =>
      setNode({ ...this, children: [...children, newc] });

    return (
      <div style={{ padding: "0px 2px", textAlign: "center" }}>
        {!collapsed &&
          <>
            {children.map(child => child.view(setNode, () => delChild(child.id)))}
            <div className="groupButtonDiv">
              <button className="rectButton" type="button" onClick={() => addChild(RelStep(_uniqueId()))}>Add Relative Step</button>
              <button className="rectButton" type="button" onClick={() => addChild(AbsStep(_uniqueId()))}>Add Absolute Step</button>
              <button className="rectButton" type="button" onClick={() => addChild(Group(_uniqueId()))}>Add Step Group</button>
            </div>
          </>}
      </div>
    )
  },

  renderRightHeader(setNode) {
    return this.isRoot ? null :
      <button className="delButton" type="button"
        onClick={() => setNode({ ...this, collapsed: !this.collapsed })}
        style={{ margin: "0px 5px 0px 0px" }}>
        {this.collapsed ? "+" : "-"}
      </button>
  }

});

export default Group;