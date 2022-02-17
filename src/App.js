import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Cookies from 'js-cookie';
import { SpotifyLogin, fetchSongs } from './Spotify';
import { genDAG3 } from './DAGGen';
import { Spec, defaultTree } from './Spec';
import { DAGView } from './DAGView'
import './index.css';
import Playlist from './Playlist'
import { useHistory } from './useHistory'
// import HowTo from './HowTo';

document.title = "playvis"

export default function App() {
  const [token, setToken] = useState(Cookies.get("spotifyAuthToken"));
  const [songs, setSongs] = useState();
  const [state, setState, undo, redo, reset] = useHistory({ tree: undefined, dag: undefined });

  const setDagData = (action) => {
    setState(({ dag, tree }) => {
      const newDag = typeof action === "function" ? action(dag) : action;
      return { dag: newDag, tree }
    })
  };

  const setTree = (action) => {
    setState(({ tree }) => {
      const newTree = typeof action === "function" ? action(tree) : action;
      const newDag = genDAG3(newTree, songs);
      // const newDag = tree.dag;
      return { tree: newTree, dag: newDag }
    })
  }

  useEffect(() => {
    if (!songs && token)
      fetchSongs(token)
        .then(songs => {
          setSongs(songs);
          setState({ tree: defaultTree, dag: genDAG3(defaultTree, songs) });
        });
  });

  return (
    <Router>
      <h1 style={{ textAlign: "center" }}>playvis</h1>
      <Routes>
        {/* TODO: actually use routes here for login */}
        <Route path="/" element={
          !token
            ? <div style={{ display: "flex", justifyContent: "center" }}>
              <SpotifyLogin setToken={setToken} />
            </div>
            : <>
              <div className="gridcontainer">
                <div className="gengraphdiv">
                  <h3>Specification</h3>
                  {/* TODO: make a better loading indicator */}
                  {songs ? <div> </div> : <button>Loading...</button>}
                </div>
                <div className="abovedag">
                  <h3>Map</h3>
                  <button type="button" onClick={
                    _ => {
                      console.clear();
                      reset({ tree: defaultTree, dag: genDAG3(defaultTree, songs) });
                    }
                  }>Reset</button>
                  <button type="button" onClick={undo}>Undo</button>
                  <button type="button" onClick={redo}>Redo</button>
                </div>
                <div className="aboveplaylist">
                  <h3>Playlist</h3>
                </div>
                <div className="recipediv">
                  {state.tree && <Spec tree={state.tree} setTree={setTree} songs={songs} />}
                </div>

                <div className="dagdiv">
                  {state.dag ?
                    <DAGView data={state.dag} setData={setDagData} />
                    : <span> {/* TODO: Make this look nicer  */}
                      <br></br>
                      No maps found for this configuration! Try changing it to be less restrictive
                    </span>
                  }
                </div>

                <div className="playlistdiv">
                  {state.dag && <Playlist dag={state.dag} />}
                </div>
              </div>
              {/* <HowTo /> */}
            </>
        } />
      </Routes>
    </Router>
  );
}