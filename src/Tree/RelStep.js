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

import FeatureStep from "./FeatureStep";
import { defaultRelStepState } from "./Features";

const RelStep = (id) => ({
  ...FeatureStep("Relative", id),
  
  state: defaultRelStepState,
  canMax() { return true },

  apply(dag, songs, allowReps) {
    if (this.isMax) {
      let nextDag = this._applyOnce(dag, songs, allowReps);
      for (let i = 0; i < this.MAX_LIMIT && nextDag; i++) {
        dag = nextDag;
        nextDag = this._applyOnce(nextDag, songs, allowReps);
      }
    }
    else for (let i = 0; i < this.loops; i++)
      dag = this._applyOnce(dag, songs, allowReps);
    return dag;
  },

  _applyOnce(dag, songs, allowReps) {
    const next = this.applyCommon(dag, songs, allowReps)
    if (!next) return null;
    const { nodes, links, unions } = next;
    prune(nodes, links);
    return { nodes, links, unions };

  },

  expand(songs, nodes, allowReps) {

    const stepNum = nodes.length;
    const frontier = nodes[stepNum - 1];
    const allNodeIDs = nodes.flat().map(n => n.track.id);

    let links = [];
    //#region format
    const nextFront = frontier.flatMap(curr => {
      const next = this.find(songs, curr, this.state)
        .filter(song =>
          song.track.fullArtist.name !== curr.track.fullArtist.name
          && song.track.name !== curr.track.name // check that song doesn't link to itself
          && (allowReps || !allNodeIDs.includes(song.track.id)) // if reps aren't allowed, check for song in dag
        );
      links.push(...next.map(nxt =>
      ({
        source: curr.id + (stepNum - 1),
        target: nxt.id + stepNum,
        stepid: this.id,
        colour: this.colour,
        // need a better way to do this
        isLHalf: false,
        isRHalf: false,
      })));
      return next;
    });
    //#endregion format
    const nFront = Array.from(new Set(nextFront))
      .map(node => ({ 
        ...node, 
        stepNum, 
        stepCol: this.colour, 
        stepFeats: this.checkedFeatures().map(([fname, _]) => fname)
      }));

    return { frontier: nFront, links };

  },

});

export default RelStep;

// might be able to extend this to prune at differnt depths for alt steps

// Should be called after the frontier has been pushed to nodes
const prune = (nodes, links) => {

  for (let j = nodes.length - 2; j >= 0; j--) {
    // find nodes to remove, i.e. nodes with no links coming from them
    const srcs = links[j].map(l => l.source);
    const idsToRemove = nodes[j]
      .map(node => node.id + j)
      .filter(id => !srcs.includes(id));
    // remove links to nodes that are to be removed
    if (j > 0)
      links[j - 1] = links[j - 1].filter(l => !idsToRemove.includes(l.target));
    // remove nodes
    nodes[j] = nodes[j].filter(n => !idsToRemove.includes(n.id + j));

    // remove all links to a row if all its nodes have been removed
    // this happens if a failed rel step follows an abs step
    if (j > 0 && nodes[j].length === 0)
      links[j - 1] = [];
  }
}