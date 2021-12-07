import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { getFeatures, getAllUserTracks, SpotifyLogin } from './Spotify';
import { RecipeStepList } from './Recipe';
import { RecipeList } from './RecipeList';
import { ForceGraph2D } from 'react-force-graph';
import { genGraph } from './GraphGen';
import './index.css';

export default function App() {
  const [token, setToken] = useState(Cookies.get("spotifyAuthToken"));
  const [songs, setSongs] = useState();
  const [recipeSteps, setSteps] = useState([]);
  const [graphData, setGraphData] = useState();

  useEffect(() => {
    if (token) {
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
    }
  }, [token]);

  return (
    <Router>
      <h1 style={{ textAlign: 'center' }}>playvis</h1>
      <Routes>
        <Route path="/" element={
          <div className="maindiv">
            <Link to="/recipes">
              <button type="button">Load recipe from databse</button>
            </Link>
            <SpotifyLogin token={token} setToken={setToken} />
            {songs &&
              <span>Starting from <span className="songText">{songs[0].track.name} </span>
                by <span className="songText">{songs[0].track.artists[0].name}</span>:
              </span>
            }
            <RecipeStepList steps={recipeSteps} setSteps={setSteps} />
            {songs &&
              <button type="button" onClick={() => setGraphData(genGraph(songs[0], songs, recipeSteps))}>Generate graph</button>}
            {graphData &&
              <div id="treeWrapper" style={{ width: "1000px", height: "800px" }} >
                <ForceGraph2D
                  graphData={graphData}
                  nodeLabel={node => `${node.name} - ${node.attributes.artist} - ${node.attributes.strrep}`}
                  nodeAutoColorBy={node => node.attributes.genre}
                  linkWidth={1.5}
                  linkDirectionalArrowLength={4} />
              </div>
            }
          </div>
        } />
        <Route path="recipes" element={
          <RecipeList setSteps={setSteps} />
        } />
      </Routes>


    </Router>

  );
}





