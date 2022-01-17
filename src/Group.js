import { useState } from "react"
import { defaultRelStep, defaultAbsStep, defaultGroup } from "./GroupDefaults"
import _uniqueId from 'lodash/uniqueId'
import { Slider } from "@mui/material"

export const defaultTree = { ...defaultGroup(_uniqueId()), 
  children: [
    defaultAbsStep(_uniqueId()),
    defaultRelStep(_uniqueId()),
    defaultRelStep(_uniqueId())] };

export const Groups = ({ tree, setTree }) => {

  const tUpdate = (node, newnode) => {
    if (node.id === newnode.id) return newnode;
    return node.isStep || !node.children.length ? 
        node
      : { ...node, children: node.children.map(child => tUpdate(child, newnode)) };
  }

  return (
    <Group node={tree} setNode={(newNode) => setTree(prev => tUpdate(prev, newNode))} onDel={() => setTree(defaultTree)} />
  )
}

const Node = ({ node, onDel, setNode }) => {
  return (
    <div>
      {node.isStep ?
        <Step node={node} setNode={setNode} onDel={onDel} />
        : <Group node={node} setNode={setNode} onDel={onDel} />}
    </div>)
}

const Group = ({ node, setNode, onDel }) => {

  const [collapsed, setCollapsed] = useState(false);

  const { children, colour, loops } = node;

  const delChild = (delid) =>
    setNode({ ...node, children: children.filter(child => child.id !== delid) });

  const addChild = (newc) =>
    setNode({ ...node, children: [...children, newc] });

  return (
    <div style={{ backgroundColor: colour }}>
      <button type="button" style={{ padding: "5px 10px", verticalAlign: "top", backgroundColor: "red" }} onClick={onDel}>X</button>
      <label className="stepelem">
        <div style={{ textAlign: "center" }}>Loops</div>
        <div><input type="number" className="valInput" value={loops} min="1" onChange={(e) => setNode({ ...node, loops: +e.target.value })} /></div>
      </label>
      <button type="button" onClick={() => setCollapsed(curr => !curr)} >{collapsed ? "Expand" : "Collapse"}</button>
      {!collapsed &&
        <>
          {children.map(child =>
            <Node node={child} setNode={setNode} key={child.id} onDel={() => delChild(child.id)} />)}
          <AddChild addChild={addChild} />
        </>}
    </div>
  )
}

const AddChild = ({ addChild }) => {

  const addRelStep = () => addChild(defaultRelStep(_uniqueId()));
  const addAbsStep = () => addChild(defaultAbsStep(_uniqueId()));
  const addGroup = () => addChild(defaultGroup(_uniqueId()));

  return (
    <div className="arrange-horizontally">
      <button type="button" onClick={addRelStep}>Add Relative Step</button>
      <button type="button" onClick={addAbsStep}>Add Absolute Step</button>
      <button type="button" onClick={addGroup}>Add Group</button>
    </div>
  )
}

const Step = ({ node, setNode, onDel }) => {

  const { bpm, acous, dance } = node.state;

  const updateState = (val) => setNode({ ...node, state: { ...node.state, ...val } });

  const ranges = node.isRel ?
    {
      bpm: [-50, 50],
      acous: [-50, 50],
      dance: [-50, 50]
    } :
    {
      bpm: [0, 200],
      acous: [0, 100],
      dance: [0, 100]
    }

  return (
    <div className="step" style={{ backgroundColor: node.colour }}>
      {node.isRel ? "Relative change values: " : "Absolute values: "}
      <div>
        <StepElem feature="BPM         " range={ranges.bpm} state={bpm} setState={bpm => updateState({ bpm })} />
        <StepElem feature="Acousticness" range={ranges.acous} state={acous} setState={acous => updateState({ acous })} />
        <StepElem feature="Danceability" range={ranges.dance} state={dance} setState={dance => updateState({ dance })} />
        <label className="stepelem">
          <div style={{ textAlign: "center" }}>Loops</div>
          <div><input type="number" className="valInput" value={node.loops} min="1" onChange={(e) => setNode({ ...node, loops: +e.target.value })} /></div>
        </label>
        <button type="button" style={{ padding: "5px 10px", verticalAlign: "top", backgroundColor: "red" }}
          onClick={onDel}>X</button>
      </div>
    </div>
  )
}

const StepElem = ({ feature, range, state, setState }) => {
  const [rmin, rmax] = range

  return (
    <div className="stepelem">
      <div style={{ textAlign: "center" }}>
        <input type="checkbox" defaultChecked={state.checked} onChange={e => 
          setState({ ...state, checked: !state.checked })
        } />
        {feature}
      </div>
      <div>
        <Slider
          value={[state.min, state.max]}
          onChange={e => {
            const [min, max] = e.target.value;
            setState({ ...state, min: min, max: max })
          }}
          valueLabelDisplay="auto"
          min={rmin}
          max={rmax} />
      </div>
      </div>
  )
}

