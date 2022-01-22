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
  const [dagData, setDagData] = useState();
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
          <>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <SpotifyLogin token={token} setToken={setToken} />
              {songs
                && <button type="button" onClick={() => {
                  setDagData((genDAG2(tree, songs)));
                  setPlaylist([]);
                }}>Generate Graph</button>
              }
            </div>
            <div className="gridcontainer">

              <div className="recipediv">
                <Groups tree={tree} setTree={setTree} />
              </div>

              <div className="dagdiv">
                {dagData && <DAGView data={dagData} setPlaylist={setPlaylist} />}
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







