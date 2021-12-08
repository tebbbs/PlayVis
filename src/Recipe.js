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

// App component has access to whole state with this approach but causes re-render with every change in every child

const defaultStepState = {
  bpm: { checked: true, min: -20, max: 20 },
  acous: { checked: true, min: -20, max: 20 },
  dance: { checked: true, min: -20, max: 20 },
  nSongs: 2
};

export const colours = ["#9b5de5", "#f15bb5", "#fee440", "#00bbf9", "#00f5d4"]

const RecipeStep = ({ id, state = defaultStepState, setState, onDel }) => {

  const { bpm, acous, dance, nSongs } = state;

  return (
    <div className="step" style={{ backgroundColor: colours[id % colours.length] }}>
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

  const handleSaveAs = () => {
    fetch('http://localhost:8000/recipes')
      .then(res => res.json())
      .then((recipes) => {
        if (recipes.map(r => r.name).includes(text)) {
          setPlaceholder(name + " in use");
          return;
        }
      }
    )
    handleSave();
  }

  const handleSave = () => {
    if (text === "") {
      setPlaceholder("Name required");
      return;
    }
    if (!id || text !== name) {
      fetch("http://localhost:8000/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: text, steps })
      })
    }
    else {
      fetch(`http://localhost:8000/recipes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: text, steps })
      })
    }
  }

  return (
    <>
      <input type="text" placeholder={placeholder} className="recNameInput" onChange={e => setText(e.target.value)} />
      <button type="button" onClick={handleSave}>Save</button>
      <button type="button" onClick={handleSaveAs}>Save as</button>
    </>
  )

}


export const RecipeStepList = ({ recipe, setRecipe }) => {

  const { id, name, steps } = recipe;

  const setSteps = f => setRecipe(({ id, name, steps }) => ({ id, name, steps: f(steps) }));

  const addStep = () => setSteps(
    steps => [...steps, { id: Math.max(0, ...steps.map((item) => item.id)) + 1, state: defaultStepState }]);
  const delStep = (id) => setSteps(
    steps => steps.filter((item) => item.id !== id));
  const updateStep = (id, newVal) => setSteps(
    steps => steps.map((item) => item.id === id ? { id, state: { ...item.state, ...newVal } } : item));

  return (
    <>
      {steps.map(({ id, state }) => <RecipeStep key={id} id={id} state={state} setState={val => updateStep(id, val)} onDel={delStep} />)}
      <div>
        <button onClick={addStep}>Add step</button>
        <RecipeSaveButton steps={steps} id={id} name={name} />
      </div>
    </>
  )
}