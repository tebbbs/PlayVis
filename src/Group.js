import { createContext, useContext } from "react"
import _uniqueId from 'lodash/uniqueId'

const colours = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
  '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
  '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
  '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
  '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC',
  '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
  '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680',
  '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
  '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
  '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];

const defaultTree = {
  id: "group-" + _uniqueId(),
  isStep: false,
  loops: 1,
  children: []
}

const TreeContext = createContext({
    tree: defaultTree,
    setTree: (tree) => { } 
  })

export const Groups = ({ tree, setTree }) => {

  const tUpdate = (node, newnode) => {
    if (node.id === newnode.id) return newnode;
    if (!node.isStep && node.children.length !== 0) {
      return {
        ...node,
        children: node.children.map(child => tUpdate(child, newnode))
      }
    }
    return node;
  }

  return (
    <TreeContext.Provider value={{ tree, setTree }}>
      <Group setNode={(newNode) => setTree(prev => tUpdate(prev, newNode))} id={tree.id} onDel={() => setTree(defaultTree)} />
    </TreeContext.Provider>
  )
}

const tSearch = (root, sid) => {
  let stack = [root], node
  stack.push(root);
  while (stack.length > 0) {
    node = stack.pop()
    if (node.id === sid) return node
    else if (node.children && node.children.length) {
      stack.push(...node.children)
    }
  }
  return null;
}

const Node = ({ node, onDel, setNode }) => {
  const { id, isStep } = node;
  return (
    <div>
      {isStep ?
        <Step isRel={node.isRel} id={id} setNode={setNode} onDel={onDel} />
        : <Group id={id} setNode={setNode} onDel={onDel} />}
    </div>)
}

const Group = ({ id, setNode, onDel }) => {

  const { tree } = useContext(TreeContext);
  const node = tSearch(tree, id);

  const children = node.children;
  const idn = parseInt(id.slice(6));

  const delChild = (delid) =>
    setNode({ ...node, children: children.filter(child => child.id !== delid) });

  const addChild = (newc) =>
    setNode({ ...node, children: [...children, newc] });

  return (
    <div style={{ backgroundColor: colours[idn % colours.length] }}>
      <button type="button" style={{ padding: "5px 10px", verticalAlign: "top", backgroundColor: "red" }}
        onClick={onDel}>X</button>
      {children.map(child =>
        <Node node={child} setNode={setNode} key={child.id} onDel={() => delChild(child.id)} />)}
      <AddChild addChild={addChild} />
    </div>
  )
}

const defaultRelStepState = {
  bpm: { checked: true, min: 0, max: 20 },
  acous: { checked: true, min: 0, max: 30 },
  dance: { checked: true, min: 0, max: 20 },
  nSongs: 2
};

const defaultAbsStepState = {
  bpm:   { checked: true, min: 150, max: 180 },
  acous: { checked: true, min: 0, max: 30 },
  dance: { checked: true, min: 0, max: 100 },
  nSongs: 1
};

const defaultRelStep = (id) => ({
  isStep: true,
  isRel: true,
  id: "step-" + id,
  loops: 1,
  state: defaultRelStepState
});

const defaultAbsStep = (id) => ({
  isStep: true,
  isRel: false,
  id: "step-" + id,
  loops: 1,
  state: defaultAbsStepState
})

const defaultGroup = (id) => ({
  isStep: false,
  id: "group-" + id,
  loops: 1,
  children: []
});

const AddChild = ({ addChild }) => {

  const addRelStep = () => addChild(defaultRelStep(_uniqueId()));
  const addAbsStep = () => addChild(defaultAbsStep(_uniqueId()));
  const addGroup   = () => addChild(defaultGroup(_uniqueId()));

  return (
    <div className="arrange-horizontally">
      <button type="button" onClick={addRelStep}>Add Relative Step</button>
      <button type="button" onClick={addAbsStep}>Add Absolute Step</button>
      <button type="button" onClick={addGroup}>Add Group</button>
    </div>
  )
}

export const Step = ({ isRel, id, setNode, onDel }) => {

  const { tree } = useContext(TreeContext);
  const node = tSearch(tree, id);
  const idn = parseInt(id.slice(5));

  const { bpm, acous, dance, nSongs } = node.state;

  const updateNode = (val) => setNode({ ...node, state: { ...node.state, ...val } });

  return (
    <div className="step" style={{ backgroundColor: colours[idn % colours.length] }}>
      {isRel ? "Relative change values: " : "Absolute values:"}
      <form>
        <StepElem feature="BPM" state={bpm} setState={bpm => updateNode({ bpm })
        } />
        <StepElem feature="Acousticness" state={acous} setState={acous => updateNode({ acous })} />
        <StepElem feature="Danceability" state={dance} setState={dance => updateNode({ dance })} />
        <label className="stepelem">
          <div style={{ textAlign: "center" }} >Num. Songs</div>
          <div><input type="number" className="valInput" value={nSongs} min="1" onChange={(e) => updateNode({ nSongs: +e.target.value })} /></div>
        </label>
        <button type="button" style={{ padding: "5px 10px", verticalAlign: "top", backgroundColor: "red" }}
          onClick={onDel}>X</button>
      </form>
    </div>
  )
}

const StepElem = ({ feature, state, setState }) => {
  return (
    <label className="stepelem">
      <div style={{ textAlign: "center" }}>
        <input type="checkbox" defaultChecked={state.checked} onChange={(e) => setState(
          { ...state, checked: !state.checked })} />
        {feature}
      </div>
      <div>
        <input type="number" className="valInput" value={state.min} max={state.max} onChange={(e) => setState(
          ({ ...state, min: +e.target.value })
        )} />
        <input type="number" className="valInput" value={state.max} min={state.min} onChange={(e) => setState(
          ({ ...state, max: +e.target.value })
        )} />
      </div>
    </label>
  )
}