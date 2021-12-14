import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { getFeatures, getAllUserTracks, SpotifyLogin } from './Spotify';

import { RecipeList } from './RecipeDBView';
import { RecipeList as RCRList } from './RecipeCombinerView';
import { ForceGraph2D } from 'react-force-graph';
import { genGraph2 } from './GraphGen';

import { Groups } from './Group';
import './index.css';

export default function App() {
  const [token, setToken] = useState(Cookies.get("spotifyAuthToken"));
  const [songs, setSongs] = useState();
  
  const defaultTree = {
    id: "root-00",
    isStep: false,
    loops: 1,
    children: []
  }

  const [tree, setTree] = useState(defaultTree);

  const [graphData, setGraphData] = useState();
  // const [graphConfig, setGraphConfig] = useState({ algoidx: 0, maxCycLen: 20 });

  useEffect(() => {
    document.title = "playvis"

    // fetch("http://localhost:8000/recipes")
    //   .then(res => res.json())
    //   .then(recipes => {
    //     const id = 1 + Math.max(...recipes.map(rec => rec.id), 0);
    //     setRecipe({ id, steps: [] });
    //   })

  }, []);

  useEffect(() => {
    async function fetchData() {
      const tracks = await getAllUserTracks(token);
      const features = await getFeatures(tracks, token);
      const songs = tracks.map((track, i) =>
      ({
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
      <Route path="/groups" element={
          <div className="outerdiv">
            <Groups />
          </div>
        }/>
        <Route path="/combine" element={
          <div className="outerdiv">
            <RCRList />
          </div>
        }/>
        <Route path="/" element={
          <div className="outerdiv">
            <div className="leftdiv">
              <Link to="/recipes">
                <button type="button">Load recipe from database</button>
              </Link>
              <SpotifyLogin token={token} setToken={setToken} />
              <div className="stepsdiv">
                {/* {recipe && <RecipeStepList recipe={recipe} setRecipe={setRecipe} />} */}
                <Groups tree={tree} setTree={setTree} />
              </div>
              {songs &&
                <div>
                  {/* <GraphConfig config={graphConfig} setGraphConfig={setGraphConfig} /> */}
                  {/* <button type="button" onClick={() => setGraphData(genGraph(songs[0], songs, recipe.steps, graphConfig))}>Generate graph</button> */}
                  <button type="button" onClick={() => setGraphData(genGraph2(tree, songs))}>Generate graph</button>
                </div>}
            </div>
            <div className="rightdiv">
              {!graphData && <div style={{ width: 600, height: 600, border: "dotted 1px grey" }}></div>}
              {graphData &&
                <ForceGraph2D
                  graphData={graphData}
                  nodeLabel={node => `${node.name} - ${node.attributes.artist} - ${node.attributes.strrep}`}
                  nodeAutoColorBy={node => node.attributes.genre}
                  linkWidth={1.5}
                  linkDirectionalArrowLength={4}
                  width={600}
                  height={600}
                />
              }
            </div>
          </div>
        } />
        <Route path="recipes" element={
          <div className="leftdiv">
            <RecipeList setRecipe={setTree} />
          </div>
        } />
      </Routes>
    </Router>

  );
}






