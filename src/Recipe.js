import { useState } from 'react';

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

const defaultStepState = {
  bpm: { checked: true, min: 0, max: 30 },
  acous: { checked: true, min: 0, max: 30 },
  dance: { checked: true, min: 0, max: 20 },
  nSongs: 2
};

export const getColour = ({ rid, sid }) => {
  const colourset = [["#9b5de5", "#f15bb5", "#fee440", "#00bbf9", "#00f5d4"],
  ["#845EC2", "#D65DB1", "#FF6F91", "#FF9671", "#FFC75F"],
  ["#BEEF02", "#4AD75D", "#00B686", "#009292", "#006C81"]];
  const nSets = colourset.length;
  const nCols = colourset[rid % nSets].length;
  return colourset[rid % nSets][sid % nCols];
}

const RecipeStep = ({ id, state = defaultStepState, setState, onDel }) => {
  const { bpm, acous, dance, nSongs } = state;

  return (
    <div className="step" style={{ backgroundColor: getColour(id) }}>
      <form>
        <StepElem feature="BPM" state={bpm} setState={bpm => setState({ bpm })} />
        <StepElem feature="Acousticness" state={acous} setState={acous => setState({ acous })} />
        <StepElem feature="Danceability" state={dance} setState={dance => setState({ dance })} />
        <label className="stepelem">
          <div style={{ textAlign: "center" }} >Num. Songs</div>
          <div><input type="number" className="valInput" value={nSongs} min="1" onChange={(e) => setState({ nSongs: +e.target.value })} /></div>
        </label>
        <button type="button" style={{ padding: "5px 10px", verticalAlign: "top", backgroundColor: "red" }}
          onClick={() => onDel(id)}>X</button>
      </form>
    </div>
  );
}

const RecipeSaveButton = ({ name, id, steps }) => {
  const [text, setText] = useState(name ? name : "");
  const [placeholder, setPlaceholder] = useState(name ? name : "Recipe name");

  const showMsg = (msg) => {
    setText("");
    setPlaceholder(msg);
  }

  const handleSaveAs = () => {
    if (text === "") {
      setPlaceholder("Name required");
      return;
    }
    fetch("http://localhost:8000/recipes")
      .then(res => res.json())
      .then((recipes) => {
        if (recipes.map(r => r.name).includes(text)) 
          throw new Error("name in use");
      }).then(() => {
        fetch("http://localhost:8000/recipes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: text, steps })
        })
      }).then(() =>
        showMsg(`'${text}' saved`)
      )
      .catch(err => {
        showMsg(text + " in use");
      });
  }

  // BUG: Allows for saving with the same name as another recipe
  const handleSave = () => {
    fetch(`http://localhost:8000/recipes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: text, steps })
    }).then(res => {
      if (res.status !== 200) {
        throw new Error("resource not present");
      }

    }).then(() => 
      showMsg(`'${text}'' updated`))
    .catch(err => {
      showMsg("'Save as' first");
  });
  }

  return (
    <>
      <input type="text" placeholder={placeholder} className="recNameInput" value={text} onChange={e => setText(e.target.value)} />
      <button type="button" onClick={handleSave}>Save</button>
      <button type="button" onClick={handleSaveAs}>Save as</button>
    </>
  )

}

export const RecipeStepList = ({ recipe, setRecipe }) => {

  const { id: rid, name, steps } = recipe;

  const setSteps = f => setRecipe(({ id, name, steps }) => ({ id, name, steps: f(steps) }));

  const addStep = () => setSteps(
    steps => [...steps, { id: { rid, sid: Math.max(0, ...steps.map((item) => item.id.sid)) + 1 }, state: defaultStepState }]);
  // Note: checking ids for equality only works because JS object equality checks if 
  // two object names **refer to the same space in memory**
  const delStep = (id) => setSteps(
    steps => steps.filter((item) => item.id !== id));
  const updateStep = (id, newVal) => setSteps(
    steps => steps.map((item) => item.id === id ? { id, state: { ...item.state, ...newVal } } : item));

  return (
    <>
      {steps.map(({ id, state }, i) => <RecipeStep key={id.rid + "_" + id.sid + "_" + i} id={id} state={state} setState={val => updateStep(id, val)} onDel={delStep} />)}
      <div>
        <button onClick={addStep}>Add step</button>
        <RecipeSaveButton steps={steps} id={rid} name={name} />
      </div>
    </>
  )
}
