import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { getFeatures, getAllUserTracks, SpotifyLogin, getPlaylistByID } from './Spotify.js';
import './index.css'


export default function App() {
  const [token, setToken] = useState(Cookies.get("spotifyAuthToken"));
  const [songs, setSongs] = useState();
  const [features, setFeatures] = useState();
  const [recipeSteps, setSteps] = useState([{ id: 0}, {id: 1}, {id: 2}]);

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
    setSteps(steps => [...steps, { id: Math.max(0, ...steps.map((item) => item.id)) + 1 }]);
  }

  const delStep = (id) => {
    setSteps(steps => steps.filter((item) => item.id !== id));
  }

  const genPL = () => {
      // TODO
  }

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
        {recipeSteps.map(({ id }) => <RecipeStep id={id} key={id} onDel={delStep} />)}
        <button onClick={addStep}>Add step</button>
        {songs && <button onClick={genPL}>Generate playlist</button>}
      </div>
    </>
  );
}

const StepElem = ({ feature, val, setVal }) => {
  return (
    <label className="stepelem">
      <div style={{ textAlign: "center" }}>
        {feature}
      </div>
      <div>
        <input type="number" className="valInput" value={val.min} max={val.max} onChange={(e) => setVal(
          (prev) => { return { min: +e.target.value, max: prev.max } }
          )}/>
        <input type="number" className="valInput" value={val.max} min={val.min} onChange={(e) => setVal(
          (prev) => { return { min: prev.min,  max: +e.target.value } }
          )}/>
      </div>
    </label>
  )
}

const RecipeStep = ({id, onDel}) => {

  const [bpm, setBPM] = useState({ min: 0, max: 0 });
  const [acous, setAcous] = useState({ min: 0, max: 0 });
  const [dance, setDance] = useState({ min: 0, max: 0 });
  const [nSongs, setNSongs] = useState(0);

  const colours = ["#984447", "#ADD9F4", "#476C9B", "#468C98"]
  
  return (
    <div className="step" style={{ backgroundColor: colours[id % colours.length] }}>
      <form>
        <StepElem feature="BPM" val={bpm} setVal={setBPM} />
        <StepElem feature="Acousticness" val={acous} setVal={setAcous}/>
        <StepElem feature="Danceability" val={dance} setVal={setDance}/>
        <label className="stepelem">
          <div style={{ textAlign: "center" }} >Num. Songs</div>
          <div><input type="number" className="valInput" value={nSongs} onChange={(e) => setNSongs(+e.target.value)}/></div>
        </label>
        <button type="button" style={{ verticalAlign: "top", backgroundColor: "red" }} 
          onClick={() => onDel(id)}>X</button>
      </form>
    </div>
  );
}






