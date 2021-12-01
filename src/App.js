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
    if (recipeSteps.length === 0) {
      for (let i = 0; i < 3; i++)
        recipeSteps.push({ bpm: i, acous: i, dance: i, key: i })
    }
  }, [recipeSteps]);

  useEffect(() => {
    if (token) {
      async function fetchData() {
        const asongs = await getAllUserTracks(token)
        setSongs(asongs)
        const afeatures = await getFeatures(asongs, token)
        setFeatures(afeatures)
      }
      fetchData()
    }
  }, [token]);

  const addStep = () => {
    setSteps(steps => [...steps, { bpm: 50, acous: 50, dance: 50, key: steps.length + 1 }])
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
        {recipeSteps.map((vals) => <RecipeStep vals={vals} key={vals.key} />)}
        <button onClick={addStep}>Add step</button>
      </div>
    </>
  );
}

const RecipeStep = (props) => {

  return (
    <div className="step">
      <form>
        <label className="stepelem">
          BPM
          <input type="range" />
        </label>
        <label className="stepelem">
          Acousticness
          <input type="range" />
        </label>
        <label className="stepelem">
          Danceability
          <input type="range" />
        </label>
      </form>
    </div>
  );
}






