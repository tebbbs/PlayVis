import React from 'react';
import { ForceGraph2D } from 'react-force-graph';

export function makeNodesFromCSV(songs) {
  // nasty -1s and -2s to account for header and weird last row
  let nodes = new Array(songs.length - 2);
  let i;
  for (i = 1; i < songs.length - 1; i++) {
    nodes[i - 1] = {
      //id: songs[i]['data'][5],
      title: songs[i]['data'][0],
      artist: songs[i]['data'][1]
    }
  }
  return nodes;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function makeEdges(nodes) {
  let edgecount = Math.floor(nodes.length * 1);
  let edges = new Array(edgecount);
  for (let i = 0; i < edges.length; i++) {
    edges[i] = {
      // Note: nodes could be linked to themselves with this approach
      source: nodes[getRandomInt(0, nodes.length)],
      target: nodes[getRandomInt(0, nodes.length)],
      //weight: getRandomInt(0,5)
    }
  }
  return edges;
}

const Graph = (props) => {
  const nodes = props.nodes;
  const edges = makeEdges(nodes);
  return (
    <ForceGraph2D
      graphData={{ nodes: nodes, links: edges }}
      nodeLabel={(node) => (`${node.title} - ${node.artist} - ${node.genre}`)}
      nodeAutoColorBy={(node) => node.genre}
    />
  );
}
export default Graph;
