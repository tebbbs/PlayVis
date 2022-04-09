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

import { cloneDeep } from "lodash";

export default class DAG {

  constructor(nodes, links, unions) {
    this.nodes = nodes;
    this.links = links;
    this.unions = unions;
  }

  filterRoutesTo(trackid, stepNum) {
    const nodes = this.nodes;
    const links = this.links;

    // remove songs in this row
    nodes[stepNum] = nodes[stepNum].filter(n => n.trackid === trackid)

    // remove songs that don't go through trackid
    if (stepNum > 0) {
      // in current row, remove links that aren't to trackid
      links[stepNum - 1] = links[stepNum - 1]
        .filter(l => l.target === trackid + stepNum || l.isLHalf);
      // go back and remove all paths that don't lead to trackid
      for (let j = stepNum - 1; j >= 0; j--) {
        // find nodes to remove, i.e. nodes with no links coming from them
        const srcs = links[j].map(l => l.source);
        const idsToRemove = nodes[j]
          .map(node => node.id)
          .filter(id => !srcs.includes(id));
        // remove links to nodes that are to be removed
        if (j > 0)
          links[j - 1] = links[j - 1].filter(l => !idsToRemove.includes(l.target));
        // remove nodes
        nodes[j] = nodes[j].filter(n => !idsToRemove.includes(n.id));
      }
    }

    return new DAG(nodes, links, this.unions);
  }

  filterRoutesFrom(trackid, stepNum) {
    const nodes = this.nodes;
    const links = this.links;

    // remove songs in this row
    nodes[stepNum] = nodes[stepNum].filter(n => n.trackid === trackid)
    // remove songs that aren't reachable from trackid
    if (stepNum < nodes.length - 1) {
      // in next row, remove links that aren't reachable from trackid
      links[stepNum] = links[stepNum]
        .filter(l => l.source === trackid + stepNum || l.isRHalf);
      // go forward and remove all paths that don't start from trackid
      for (let j = stepNum + 1; j < nodes.length; j++) {
        // find nodes to remove, i.e. nodes with no links to them
        const tgts = links[j - 1].map(l => l.target);
        const idsToRemove = nodes[j]
          .map(node => node.id)
          .filter(id => !tgts.includes(id));
        // remove links from nodes that are to be removed
        if (j < nodes.length - 1)
          links[j] = links[j].filter(l => !idsToRemove.includes(l.source));
        // remove nodes
        nodes[j] = nodes[j].filter(n => !idsToRemove.includes(n.id));
      }
    }

    return new DAG(nodes, links, this.unions)
  }

  chooseSong({ trackid, stepNum, stepCol }) {
    let newDag = cloneDeep(this)
      .filterRoutesTo(trackid, stepNum)
      .filterRoutesFrom(trackid, stepNum);

    const nodes = newDag.nodes;
    const playlistIDs = nodes.flat().filter(n => n.inPlaylist).map(n => n.id);

    // find all one-node layers, add nodes to playlist 
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].length === 1) {
        const autoNode = nodes[i][0];
        autoNode.inPlaylist = true;
        playlistIDs.push(autoNode.id);
      }
    }

    // highlight all nodes that were added to the playlist in this step
    for (let i = 0; i < nodes.length; i++) {
      for (let j = 0; j < nodes[i].length; j++) {
        const node = nodes[i][j];
        if (playlistIDs.includes(node.id) && !node.isHighlighted) {
          node.highlightCol = stepCol;
          node.isHighlighted = true;
        }
        // grey-out all non-playlist nodes representing playlist songs (repeats)
        else if (playlistIDs.map(nid => nid.slice(0, trackid.length))
          .includes(node.trackid) && !node.inPlaylist) {
          node.isDarkened = true;
        }
      }
    }
    return newDag;
  }
}

