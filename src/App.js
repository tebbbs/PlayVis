import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Cookies from 'js-cookie';
import { getFeatures, getAllUserTracks, SpotifyLogin } from './Spotify';
import { genDAG2 } from './GraphGen';
import { Groups, defaultTree } from './Group';
import { DAGView } from './DAGView'
import './index.css';
import Playlist from './Playlist'

document.title = "playvis"

export default function App() {
  const [token, setToken] = useState(Cookies.get("spotifyAuthToken"));
  const [songs, setSongs] = useState();
  const [tree, setTree] = useState(defaultTree);
  const [dagData, _setDagData] = useState();
  const setDagData = (newDD) => {
    // causes any useEffects depending on dagData to trigger every time setDagData is called
    _setDagData(prev => {
      if (prev) newDD.reload = !prev.reload;
      return newDD
    })
  };
  const [playlist, setPlaylist] = useState([]);

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
      <h1 style={{ textAlign: "center" }}>playvis</h1>
      <Routes>
        <Route path="/" element={
          !token
            ? <div style={{ display: "flex", justifyContent: "center" }}>
              <SpotifyLogin setToken={setToken} />
            </div>
            : <>
              <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>

                {songs
                  ? <button type="button" onClick={() => {
                    const dd = genDAG2(tree, songs);
                    setDagData(dd);
                    setPlaylist(Array(dd.nodes.length).fill(false));
                  }}>Generate Graph</button>
                  : <button>Loading...</button>
                }
              </div>
              <div className="gridcontainer">

                <div className="recipediv">
                  <Groups tree={tree} setTree={setTree} />
                </div>

                <div className="dagdiv">
                  {dagData && <DAGView data={dagData} setData={setDagData} setPlaylist={setPlaylist} />}
                </div>

                <div className="playlistdiv">
                  <Playlist tracks={playlist} />
                </div>
              </div>
            </>
        } />
      </Routes>
    </Router>
  );
}







