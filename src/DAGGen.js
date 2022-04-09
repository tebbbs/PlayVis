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

import DAG from './DAG'

const formatNodes = (nodes) => nodes.map(narr => narr.map(node => ({

  name: node.track.name,
  id: node.id + node.stepNum,
  trackid: node.track.id,
  imgurl: node.track.album.images[1].url,

  audio: node.audio,

  stepNum: node.stepNum,
  stepCol: node.stepCol,
  stepFeats: node.stepFeats,

  isUnion: false,

  inPlaylist: false,
  isHighlighted: false,
  isDarkened: false,
  highlightCol: "clear",

  attributes: {
    artist: node.track.artists[0].name,
    genre: node.track.fullArtist.genres[0],
    features: node.features
  }

})

))

/**
 * Sets up an initial DAG before traversing the recipe tree to compute
 * the final DAG.
 * @param {*} node 
 * @param {*} songs 
 * @returns 
 */
export const genDAG = (node, songs, allowReps) => {


  // Remove first step from tree to be used to find initial nodes 
  const step1 = node.children[0];
  const tree = { ...node, children: node.children.slice(1) };

  // Set up initial DAG
  const initNodes = step1.find(songs)
    .map(song => ({ ...song, stepNum: 0, stepCol: step1.colour, stepFeats: step1.checkedFeatures().map(([fname, _]) => fname) }));
  let dag = { nodes: [initNodes], links: [], unions: [] };

  // Expand initial step
  dag = { ...step1, loops: step1.loops - 1 }.apply(dag, songs, allowReps)

  // Expand the rest of the children of the root once
  dag = { ...tree, loops: 1 }.apply(dag, songs, allowReps);

  // Restore the initial step and generate the dag the remaining number of times
  // This works because 'dag' is now non-empty
  if (tree.loops > 1) {
    tree.children = [step1, ...tree.children];
    tree.loops -= 1;
    dag = tree.apply(dag, songs, allowReps);
  }

  // Check for failed graph generation
  if (!dag) return null;

  const { nodes, links, unions } = dag;

  return new DAG(formatNodes(nodes), links, unions);

}
