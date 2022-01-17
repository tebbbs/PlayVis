import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Cookies from 'js-cookie';
import { getFeatures, getAllUserTracks, SpotifyLogin } from './Spotify';
import { genDAG2 } from './GraphGen';
import { Groups, defaultTree } from './Group';
import DAG from './DAG'
import './index.css';

document.title = "playvis"

export default function App() {
  const [token, setToken] = useState(Cookies.get("spotifyAuthToken"));
  const [songs, setSongs] = useState();
  const [tree, setTree] = useState(defaultTree);
  const [dagData, setDagData] = useState();

  useEffect(() => {
    async function fetchData() {
      const tracks = await getAllUserTracks(token);
      const features = await getFeatures(tracks, token);
      const songs = tracks.map((track, i) =>
      ({
        id: track.track.id,
        track: track.track,
        bpm: features[i].tempo,
        acous: features[i].acousticness,
        dance: features[i].danceability
      }));
      setSongs(songs);
    }
    fetchData();

  }, [token]);

  return (
    <Router>
      <h1 style={{ textAlign: 'center' }}>playvis</h1>
      <Routes>
        <Route path="/" element={
          <div className="outerdiv">
              <SpotifyLogin token={token} setToken={setToken} />
              <div className="stepsdiv">
                <Groups tree={tree} setTree={setTree} />
              </div>
              {songs &&
                <div>
                  <button type="button" onClick={() => setDagData((genDAG2(tree, songs)))}>Generate DAG</button>
                </div>}
              {dagData && <DAG data={dagData}/>}
          </div>
        } />
      </Routes>
    </Router>

  );
}







