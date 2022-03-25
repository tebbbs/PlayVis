import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Cookies from "js-cookie";
import { SpotifyLogin, fetchSongs } from "./Spotify";
import { genDAG3 } from "./DAGGen";
import { Spec, defaultTree } from "./Spec";
import { DAGView } from "./DAGView";
import "./index.css";
import Playlist from "./Playlist";
import MySwitch from "./Switch";
import { useHistory } from "./useHistory";

document.title = "playvis"

export default function App() {
  const [token, setToken] = useState(Cookies.get("spotifyAuthToken"));
  const [songs, setSongs] = useState();

  const [muted, setMuted] = useState(true);

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
      return { tree: newTree, dag: newDag }
    })
  }

  useEffect(() => {
    if (!songs && token) {
      fetchSongs(token)
        .then(songs => {
          setSongs(songs);
          setState({ tree: defaultTree, dag: genDAG3(defaultTree, songs) });
        });
    }
  });

  return (
    <Router>
      <h1 style={{ textAlign: "center" }}>playvis</h1>
      <Routes>
        {/* TODO: actually use routes here for login */}
        <Route path="/" element={
          !token
            ? <div style={{ textAlign: "center" }} >
              <div style={{ display: "flex", justifyContent: "center" }}>
                <SpotifyLogin setToken={setToken} />
              </div>
              <br></br>
              <button className="rectButton" onClick={() => setToken("DEMO0")}>Demo</button>
              <button className="rectButton" onClick={() => setToken("DEMO1")}>Demo 1</button>
              <button className="rectButton" onClick={() => setToken("DEMO2")}>Demo 2</button>
            </div>
            : <>
              <div className="gridcontainer">
                <div className="abovespec">
                  <h3>Specification</h3>
                  {songs && <button className="rectButton" type="button" onClick={
                      () => reset({ tree: defaultTree, dag: genDAG3(defaultTree, songs) })}>
                      Reset
                    </button>
                  }
                </div>
                <div className="abovedagouter">
                  <div className="abovedaginner">
                    <h3>Map</h3>
                    <button className="rectButton" type="button" onClick={undo}>Undo</button>
                    <button className="rectButton" type="button" onClick={redo}>Redo</button>
                    <MySwitch checked={!muted} onChange={() => setMuted(m => !m)} label="Play preview on mouseover" />
                    <label htmlFor="muted" style={{ margin: "0 0 0 5px" }}>Play preview on mouseover</label>
                  </div>
                  <span>Click on songs to add them to the playlist!</span>
                </div>
                <div className="aboveplaylist">
                  <h3>Playlist</h3>
                  <button className="rectButton" type="button" onClick={
                    () => setDagData(genDAG3(state.tree, songs))}>
                    Clear
                  </button>
                  <button className="rectButton" type="button"
                    style={{ backgroundColor: "green" }}
                    onClick={() => {/* TODO */ }} >
                    Export to Spotify
                  </button>
                </div>
                <div className="recipediv">
                  {state.tree && <Spec tree={state.tree} setTree={setTree} songs={songs} />}
                </div>

                <div className="dagdiv">
                  {state.dag
                    ? <DAGView data={state.dag} setData={setDagData} muted={muted} />
                    : <h4 style={{ textAlign: "center", margin: "10% 20% " }}>
                      {songs
                        ? "No maps can be generated from your library with this specification, try relaxing some parameters!"
                        : "Fetching music data..." } 
                    </h4>
                  }
                </div>

                <div className="playlistdiv">
                  {state.dag && <Playlist dag={state.dag} />}
                </div>
              </div>
            </>
        } />
      </Routes>
    </Router>
  );
}