import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { getFeatures, getAllUserTracks, SpotifyLogin } from './Spotify';
import { RecipeStepList } from './Recipe';
import { RecipeList } from './RecipeDBView';
import { RecipeList as RCRList } from './RecipeCombinerView';
import { ForceGraph2D } from 'react-force-graph';
import { genGraph } from './GraphGen';
import { GraphConfig } from './GraphConfig';
import './index.css';

export default function App() {
  const [token, setToken] = useState(Cookies.get("spotifyAuthToken"));
  const [songs, setSongs] = useState();
  const [recipe, setRecipe] = useState();
  const [graphData, setGraphData] = useState();
  const [graphConfig, setGraphConfig] = useState({ algoidx: 0, maxCycLen: 20 });

  useEffect(() => {
    document.title = "playvis"

    fetch("http://localhost:8000/recipes")
      .then(res => res.json())
      .then(recipes => {
        const id = 1 + Math.max(...recipes.map(rec => rec.id), 0);
        setRecipe({ id, steps: [] });
      })

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
        <Route path="/combine" element={
          <div className="outerdiv">
            <RCRList />
          </div>
        }/>
        <Route path="/" element={
          <div className="outerdiv">
            <div className="leftdiv">
            <Link to="/combine">
                <button type="button">Combine recipes</button>
              </Link>
              <Link to="/recipes">
                <button type="button">Load recipe from database</button>
              </Link>
              <SpotifyLogin token={token} setToken={setToken} />
              {songs &&
                <span>Starting from <span className="songText">{songs[0].track.name} </span>
                  by <span className="songText">{songs[0].track.artists[0].name}</span>:
                </span>
              }
              <div className="stepsdiv">
                {recipe && <RecipeStepList recipe={recipe} setRecipe={setRecipe} />}
              </div>
              {songs &&
                <div>
                  <GraphConfig config={graphConfig} setGraphConfig={setGraphConfig} />
                  <button type="button" onClick={() => setGraphData(genGraph(songs[0], songs, recipe.steps, graphConfig))}>Generate graph</button>
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
            <RecipeList setRecipe={setRecipe} />
          </div>
        } />
      </Routes>
    </Router>

  );
}






