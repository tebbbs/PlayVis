import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { getFeatures, getAllUserTracks, SpotifyLogin } from './Spotify';
import Tree from 'react-d3-tree';
import { genPL } from './Backend';
import './index.css';

export default function App() {
  const [token, setToken] = useState(Cookies.get("spotifyAuthToken"));
  const [songs, setSongs] = useState();
  const [features, setFeatures] = useState();
  const [recipeSteps, setSteps] = useState([]);
  const [graphData, setGraphData] = useState();

  useEffect(() => {
    if (token) {
      async function fetchData() {
        const songs = await getAllUserTracks(token);
        setSongs(songs);
        const features = await getFeatures(songs, token);
        setFeatures(features);
      }
      fetchData()
    }
  }, [token]);

  const addStep = () => setSteps(
    steps => [...steps, { id: Math.max(0, ...steps.map((item) => item.id)) + 1, state: defaultStepState }]);  
  const delStep = (id) => setSteps(
    steps => steps.filter((item) => item.id !== id));
  const updateStep = (id, newVal) => setSteps(
    steps => steps.map((item) => item.id === id ? { id, state: { ...item.state, ...newVal } } : item));
  

  console.log("rerendered");

  return (
    <>
      <div className="maindiv">
        <h1>playvis</h1>
        <SpotifyLogin token={token} setToken={setToken} />
        {songs && 
          <span>Starting from <span className="songText">{songs[0].track.name} </span>
                by <span className="songText">{songs[0].track.artists[0].name}</span>:
          </span>
        }
        {recipeSteps.map(({ id, state }) => <RecipeStep key={id} id={id} state={state} setState={val => updateStep(id, val)} onDel={delStep} />)}
        <div>
          <button onClick={addStep}>Add step</button>
          {songs && features &&
            <button type="button" onClick={() => setGraphData(genPL(songs, features, recipeSteps))}>Generate playlist</button>}
        </div>
        {graphData &&
          <div id="treeWrapper" style={{ width: '1000px', height: '800px' }}>
            <Tree data={graphData}  />
          </div>
        }
      </div>
    </>
  );
}


const StepElem = ({ feature, vals, updateVals }) => {
  return (
    <label className="stepelem">
      <div style={{ textAlign: "center" }}>
        <input type="checkbox" defaultChecked={vals.checked} onChange={(e) => updateVals(
          { ...vals, checked: !vals.checked })}  />
        {feature}
      </div>
      <div>
        <input type="number" className="valInput" value={vals.min} max={vals.max} onChange={(e) => updateVals(
          ({ ...vals, min: +e.target.value })
        )} />
        <input type="number" className="valInput" value={vals.max} min={vals.min} onChange={(e) => updateVals(
          ({ ...vals, max: +e.target.value })
        )} />
      </div>
    </label>
  )
}

// App component has access to whole state with this approach but causes re-render with every change in every child

const defaultStepState = { 
  bpm:   { checked: true, min: -50, max: 50 }, 
  acous: { checked: true, min: -50, max: 50 }, 
  dance: { checked: true, min: -50, max: 50 }, 
  nSongs: 2 };

const colours = ["#984447", "#ADD9F4", "#476C9B", "#468C98"]

const RecipeStep = ({ id, state = defaultStepState, setState, onDel }) => {

  const { bpm, acous, dance, nSongs } = state;

  return (
    <div className="step" style={{ backgroundColor: colours[id % colours.length] }}>
      <form>
        <StepElem feature="BPM" vals={bpm} updateVals={bpm => setState({ bpm })} />
        <StepElem feature="Acousticness" vals={acous} updateVals={acous => setState({ acous })} />
        <StepElem feature="Danceability" vals={dance} updateVals={dance => setState({ dance })} />
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






