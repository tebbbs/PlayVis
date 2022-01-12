import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Cookies from 'js-cookie';
import { getFeatures, getAllUserTracks, SpotifyLogin } from './Spotify';
import { ForceGraph2D } from 'react-force-graph';
import { genGraph2, spreadLinks } from './GraphGen';
import { Groups, defaultTree } from './Group';
import './index.css';

document.title = "playvis"

export default function App() {
  const [token, setToken] = useState(Cookies.get("spotifyAuthToken"));
  const [songs, setSongs] = useState();
  const [tree, setTree] = useState(defaultTree);
  const [graphData, setGraphData] = useState();


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
                  <button type="button" onClick={() => setGraphData(spreadLinks(genGraph2(tree, songs)))}>Generate graph</button>
                </div>}
              {graphData && <Graph data={graphData} />}
          </div>
        } />
      </Routes>
    </Router>

  );
}

const Graph = ({ data }) => {
  const fgRef = useRef();
  return <ForceGraph2D
    graphData={data}
    nodeLabel={node => node.isMid ? "" : `${node.name} - ${node.attributes.artist}`}
    nodeAutoColorBy={node => node.attributes.genre}
    linkWidth={1.5}
    linkDirectionalArrowLength={4}
    width={1000}
    height={800}
    ref={fgRef}
    cooldownTicks={100}
    onEngineStop={() => fgRef.current.zoomToFit(400)}
    nodeCanvasObject={({ img, x, y }, ctx) => {
      const size = 12;
      ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
    }}
    
  />;
};






