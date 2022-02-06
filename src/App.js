import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Cookies from 'js-cookie';
import { SpotifyLogin, useSpotify } from './Spotify';
import { genDAG2 } from './GraphGen';
import { Groups, defaultTree } from './Group';
import { DAGView } from './DAGView'
import './index.css';
import Playlist from './Playlist'
import { useHistory } from './useHistory'
import HowTo from './HowTo';

document.title = "playvis"

export default function App() {
  const [token, setToken] = useState(Cookies.get("spotifyAuthToken"));
  const songs = useSpotify(token);
  const [tree, setTree] = useState(defaultTree);
  const [dagData, setDagData, undo, redo, reset] = useHistory();

  return (
    <Router>
      <h1 style={{ textAlign: "center" }}>playvis</h1>
      <Routes>
        {/* // TODO: actually use routes here for login */}
        <Route path="/" element={
          !token
            ? <div style={{ display: "flex", justifyContent: "center" }}>
              <SpotifyLogin setToken={setToken} />
            </div>
            : <>
              <div className="gridcontainer">
                <div className="gengraphdiv">
                  <h3>Specification</h3>
                  {songs
                    ? <button type="button" onClick={() => {
                      const dd = genDAG2(tree, songs);
                      reset(dd);
                    }}>Generate Map</button>
                    : <button>Loading...</button>
                  }
                </div>
                <div className="abovedag">
                  <h3>Map</h3>
                  <button type="button" onClick={
                    _ => {
                      console.clear();
                      reset();
                      setTree(defaultTree);
                    }
                  }>Reset</button>
                </div>
                <div className="aboveplaylist">
                  <h3>Playlist</h3>
                </div>
                <div className="recipediv">
                  <Groups tree={tree} setTree={setTree} />
                </div>

                <div className="dagdiv">
                  <button type="button" onClick={undo}>Undo</button>
                  <button type="button" onClick={redo}>Redo</button>
                  {dagData && <DAGView data={dagData} setData={setDagData} />}
                </div>

                <div className="playlistdiv">
                  {dagData && <Playlist dag={dagData} />}
                </div>
              </div>
              <HowTo />
            </>
        } />
      </Routes>
    </Router>
  );
}