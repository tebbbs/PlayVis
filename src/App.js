/*
 * Created on Sat Apr 09 2022
 *
 * The MIT License (MIT)
 * Copyright (c) 2022 Joseph Tebbett, University of Birmingham
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software
 * and associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial
 * portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { SpotifyLogin, fetchSongs, exportPlaylist } from "./Spotify";
import { genDAG } from "./DAGGen";
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
  const [allowReps, setAllowReps] = useState(true);

  const [realTime, setRealTime] = useState(true)
  // intermediate tree used to store tree state updates before commiting them with "Update graph" button
  const [incTree, setIncTree] = useState(defaultTree);

  const [state, setState, undo, redo, reset] = useHistory({ tree: undefined, dag: undefined });

  const setDagData = (action) => {
    setState(({ dag, tree }) => {
      const newDag = typeof action === "function" ? action(dag) : action;
      return { dag: newDag, tree }
    })
  };

  const setTree = (action) => {
    if (realTime)
      setState(({ tree }) => {
        const newTree = typeof action === "function" ? action(tree) : action;
        const newDag = genDAG(newTree, songs, allowReps);
        return { tree: newTree, dag: newDag }
      })
    setIncTree(tree => typeof action === "function" ? action(tree) : action);
  }

  useEffect(() => state.tree && setIncTree(state.tree), [state.tree]);


  useEffect(() => {
    if (!songs && token) {
      fetchSongs(token)
        .then(songs => {
          const audioSongs = songs.map(song => ({ ...song, audio: song.track.preview_url ? new Audio(song.track.preview_url) : null }));
          setSongs(audioSongs);
          setState({ tree: defaultTree, dag: genDAG(defaultTree, audioSongs, allowReps) });
        });
    }
  });

  const Login = () => {
    return (
      <div style={{ textAlign: "center" }} >
        <div style={{ display: "flex", justifyContent: "center" }}>
          <SpotifyLogin setToken={setToken} />
        </div>
        <br></br>
        <button className="rectButton" onClick={() => setToken("DEMO0")}>Demo [Tracks   0-500]</button>
        <button className="rectButton" onClick={() => setToken("DEMO1")}>Demo [Tracks   0-250]</button>
        <button className="rectButton" onClick={() => setToken("DEMO2")}>Demo [Tracks 250-500]</button>
      </div>)
  }

  return (
    <>
      <h1 style={{ textAlign: "center", margin: "10px" }}>playvis</h1>
      {!token
        ? <Login />
        : <>
          <div className="gridcontainer">

            <div className="abovespec">
              <span className="columnTitle">Specification</span>
              {songs &&
                <>
                  <button className="rectButton" type="button" onClick={() => {
                    setIncTree(defaultTree);
                    reset({ tree: defaultTree, dag: genDAG(defaultTree, songs, allowReps) });
                  }}>
                    Reset
                  </button>

                  <MySwitch checked={realTime}
                    onChange={() => {
                      reset({ tree: incTree, dag: genDAG(incTree, songs, allowReps) });
                      setRealTime(rt => !rt);
                    }}
                    label="update graph with every change"
                  />
                  {!realTime && <button className="rectButton" type="button" onClick={
                    () => reset({ tree: incTree, dag: genDAG(incTree, songs, allowReps) })
                  }> Update Graph </button>
                  }
                </>
              }
            </div>

            <div className="abovedagouter">

              <span className="columnTitle">Graph</span>
              <div style={{ display: "flex" }}>
                <button className="rectButton" type="button" onClick={undo}>Undo</button>
                <button className="rectButton" type="button" onClick={redo}>Redo</button>
              </div>
              <div style={{ display: "flex" }}>
                <MySwitch checked={!muted} onChange={() => setMuted(m => !m)} label="play preview on mouseover" />
                <MySwitch id={"reps"} checked={allowReps} label="allow repeated songs in graph" onChange={
                  () => {
                    setAllowReps(r => !r);
                    if (realTime) setDagData(genDAG(state.tree, songs, !allowReps));
                  }
                } />
              </div>
              <span style={{ textAlign: "center" }}>Click on songs to add them to the playlist!</span>
            </div>

            <div className="aboveplaylist">
              <span className="columnTitle">Playlist</span>
              <button className="rectButton" type="button" onClick={
                () => setDagData(genDAG(state.tree, songs, allowReps))}>
                Clear
              </button>
              {token && !["DEMO0", "DEMO1", "DEMO2"].includes(token) && <button className="rectButton" type="button"
                  style={{ backgroundColor: "green" }}
                  onClick={() => {
                    if (token && state.dag) {
                      const songs = state.dag.nodes
                        .filter(layer => layer.length === 1)
                        .flat();
                      exportPlaylist(songs, token);
                    }
                  }} >
                  Export to Spotify
                </button>}
            </div>

            <div className="specdiv">
              {state.tree && <Spec tree={incTree} setTree={setTree} songs={songs} />}
            </div>

            <div className="dagdiv">
              {state.dag
                ? state.dag.links.flat().length < 10000
                  ? <DAGView data={state.dag} setData={setDagData} muted={muted} />
                  : <h4 style={{ textAlign: "center", margin: "10% 20% " }}>
                    Graph too large to render! Try making your constraints more specific
                  </h4>
                : <h4 style={{ textAlign: "center", margin: "10% 20% " }}>
                  {songs
                    ? "No graphs can be generated from your library with this specification, try relaxing some parameters!"
                    : "Fetching music data..."}
                </h4>
              }
            </div>

            <div className="playlistdiv">
              {state.dag && state.dag.links.flat().length < 10000 && <Playlist dag={state.dag} />}
            </div>

          </div>
        </>
      }
    </>

  );
}