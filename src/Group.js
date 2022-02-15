import { useState, createContext, useContext, useEffect } from "react"
import * as defaults from "./GroupDefaults"
import _uniqueId from 'lodash/uniqueId'
import { Slider } from "@mui/material"

export const defaultTree = {
  ...defaults.group(_uniqueId()),
  isRoot: true,
  children: [
    defaults.stepOne(_uniqueId()),
    defaults.relStep(_uniqueId()),
    defaults.relStep(_uniqueId())
  ]
};

const RangeContext = createContext();

export const Groups = ({ tree, setTree, songs }) => {

  const tUpdate = (node, newnode) => {
    if (node.id === newnode.id) return newnode;
    return node.isStep || !node.children.length ?
      node
      : { ...node, children: node.children.map(child => tUpdate(child, newnode)) };
  }

  return (
    <RangeContext.Provider value={defaults.ranges(songs)} >
      <Group node={tree} setNode={(newNode) => setTree(prev => tUpdate(prev, newNode))} onDel={() => setTree(defaultTree)} />
    </RangeContext.Provider>
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

  const { children, colour } = node;

  const delChild = (delid) =>
    setNode({ ...node, children: children.filter(child => child.id !== delid) });

  const addChild = (newc) =>
    setNode({ ...node, children: [...children, newc] });

  return (
    <div className="groupdiv" style={{ backgroundColor: colour }}>
      <div style={{ display: "flex", justifyContent: "space-between", align: "center" }}>
        <Loop state={node} setState={setNode} />
        <div>
          <button type="button" onClick={() => setCollapsed(curr => !curr)} >{collapsed ? "Expand" : "Collapse"}</button>
          <DelButton onDel={onDel} />
        </div>
      </div>
      <div style={{ padding: "0px 5px" }}>
        {!collapsed &&
          <>
            {children.map(child =>
              <Node node={child} setNode={setNode} key={child.id} onDel={() => delChild(child.id)} />)}
            <AddChild addChild={addChild} />
          </>}
      </div>
    </div>
  )
}

const Loop = ({ state, setState }) => {

  const { loops, isMax, isRel, isStep, isRoot } = state;
  const setLoops = (n) => setState({ ...state, loops: n });
  const toggleIsMax = () => setState({ ...state, isMax: !state.isMax });
  const canMax = isRel || (!isStep && !isRoot);

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

const AddChild = ({ addChild }) => {

  const addRelStep = () => addChild(defaults.relStep(_uniqueId()));
  const addAbsStep = () => addChild(defaults.absStep(_uniqueId()));
  const addGroup = () => addChild(defaults.group(_uniqueId()));

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

  const ranges = useContext(RangeContext)[node.isRel ? "rel" : "abs"];
  const format = x => x.toFixed(0) + (node.isRel ? "%" : "")

  return (
    <div className="step" style={{ backgroundColor: node.colour }}>
      <div style={{ display: "flex", justifyContent: "space-between", align: "center" }}>
        {node.isRel ? "Relative" : "Absolute"} step
        <Loop state={node} setState={setNode} />
        {!node.isRoot && <DelButton onDel={onDel} />}
      </div>
      <div>
        <StepElem feature="BPM   " format={format} range={ranges.bpm} state={bpm} setState={bpm => updateState({ bpm })} />
        <StepElem feature="Acous." format={format} range={ranges.acous} state={acous} setState={acous => updateState({ acous })} />
        <StepElem feature="Dance." format={format} range={ranges.dance} state={dance} setState={dance => updateState({ dance })} />
      </div>
    </div>
  )
}

const DelButton = ({ onDel }) => {
  return (
    <button type="button" style={
      {
        backgroundColor: "red",
      }}
      onClick={onDel}>x</button>
  )
}

const StepElem = ({ feature, format, range, state, setState }) => {
  const [rmin, rmax] = range

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

