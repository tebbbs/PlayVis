import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { getFeatures, getAllUserTracks, SpotifyLogin } from './Spotify.js';
import './index.css'

export default function App() {
  const [token, setToken] = useState(Cookies.get("spotifyAuthToken"));
  const [songs, setSongs] = useState();
  const [features, setFeatures] = useState();
  const [recipeSteps, setSteps] = useState([]);

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

  const addStep = () => {
    setSteps(steps => [...steps, { id: Math.max(0, ...steps.map((item) => item.id)) + 1, state: defaultStepState }]);
  }

  const delStep = (id) => {
    setSteps(steps => steps.filter((item) => item.id !== id));
  }

  const updateStep = (id, newVal) => {
    setSteps(steps => steps.map(
      (item) => item.id === id ? { id, state: { ...item.state, ...newVal } } : item)
    )
  }

  const genPL = () => {
    // expand recipe out such that a step applied for n songs becomes n steps
    const oneSteps = recipeSteps.flatMap(step => {
      const { id, state } = step
      const { bpm, acous, dance, nSongs } = state;
      return Array(nSongs).fill(({ id, params: { bpm, acous, dance } }))
    });

    const fsongs = songs.map((song, i) =>
    ({
      track: song.track,
      bpm: features[i].tempo,
      acous: features[i].acousticness,
      dance: features[i].danceability
    }));

    const genChildren = (parent, step, n) => {
      let children = [];
      const { bpm, acous, dance } = step.params;
      for (let i = 0; i < fsongs.length && children.length < n; i++) {
        const cand = fsongs[i];

        // % change should work for bpm
        const bpmdiff = 100 * (cand.bpm - parent.bpm) / parent.bpm;

        // acous mean = 0.096, std dev = 0.18 for 1000 of MY songs
        // baring in mind I'm biased towards non-acoustic songs

        const acousdif = 100 * (cand.acous - parent.acous) / parent.acous;

        // dance mean = 0.66, std dev = 0.133
        // again, most of my music is dnb

        const dancedif = 100 * (cand.dance - parent.dance) / parent.dance;

        if (bpm.min <= bpmdiff && bpmdiff <= bpm.max
          && acous.min <= acousdif && acousdif <= acous.max
          && dance.min <= dancedif && dancedif <= dance.max
          // will need a better check to impose min length on cycles
          && cand.track.id !== parent.track.id) {
          children.push({ ...cand, stepid: step.id });
        }
      }
      return children;
    }
    
    const treeGen = (val, f, depth) => (
      {
        val: val,
        children: f(val, depth).map(child => treeGen(child, f, depth - 1))
      }
    )

    const maxDepth = oneSteps.length;
    const childNum = 2;
    const graph = treeGen(
      fsongs[0],
      ((song, d) => d === 0 ? [] : genChildren(song, oneSteps[maxDepth - d], childNum)),
      maxDepth
    )

    console.log(graph)

  }

  // const ppSteps = () => {
  //   return recipeSteps.map(step =>
  //     {
  //       const { id, state } = step;
  //       const { bpm, acous, dance, nSongs } = state;
  //       const strings = [bpm, acous, dance].map(item => `${Object.keys({item})[0]} Min: ${item.min}, Max: ${item.max}`) + 'nSongs: ' + nSongs;
  //       return `${id}: ${strings}`
  //     }
  //   )
  // }

  return (
    <>
      <h1 style={{ textAlign: 'center' }}>playvis</h1>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <SpotifyLogin token={token} setToken={setToken} />
        {recipeSteps.map(({ id, state }) => <RecipeStep key={id} id={id} state={state} setState={updateStep} onDel={delStep} />)}
        <button onClick={addStep}>Add step</button>
        {songs && <button type="button" onClick={genPL}>Generate playlist</button>}
      </div>
    </>
  );
}

const StepElem = ({ feature, vals, updateVals }) => {
  return (
    <label className="stepelem">
      <div style={{ textAlign: "center" }}>
        {feature}
      </div>
      <div>
        <input type="number" className="valInput" value={vals.min} max={vals.max} onChange={(e) => updateVals(
          ({ min: +e.target.value, max: vals.max })
        )} />
        <input type="number" className="valInput" value={vals.max} min={vals.min} onChange={(e) => updateVals(
          ({ min: vals.min, max: +e.target.value })
        )} />
      </div>
    </label>
  )
}

// App component has access to whole state with this approach but causes re-render with every change in every child

const defaultStepState = { bpm: { min: -10, max: 10 }, acous: { min: -50, max: 50 }, dance: { min: -10, max: 10 }, nSongs: 2 };

const colours = ["#984447", "#ADD9F4", "#476C9B", "#468C98"]

const RecipeStep = ({ id, state = defaultStepState, setState, onDel }) => {

  const { bpm, acous, dance, nSongs } = state;

  return (
    <div className="step" style={{ backgroundColor: colours[id % colours.length] }}>
      <form>
        <StepElem feature="BPM" vals={bpm} updateVals={bpm => setState(id, { bpm })} />
        <StepElem feature="Acousticness" vals={acous} updateVals={acous => setState(id, { acous })} />
        <StepElem feature="Danceability" vals={dance} updateVals={dance => setState(id, { dance })} />
        <label className="stepelem">
          <div style={{ textAlign: "center" }} >Num. Songs</div>
          <div><input type="number" className="valInput" value={nSongs} min="1" onChange={(e) => setState(id, { nSongs: +e.target.value })} /></div>
        </label>
        <button type="button" style={{ verticalAlign: "top", backgroundColor: "red" }}
          onClick={() => onDel(id)}>X</button>
      </form>
    </div>
  );
}






