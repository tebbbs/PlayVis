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
import { defaultAbsStepState } from "./Features";

const AbsStep = (id) => ({
  ...FeatureStep("Absolute", id),

  state: defaultAbsStepState,
  canMax() { return false },

  apply(dag, songs, allowReps) {
    for (let i = 0; i < this.loops; i++)
      dag = this.applyCommon(dag, songs, allowReps);
    return dag;
  },

  expand(songs, nodes, allowReps) {

    const stepNum = nodes.length;
    const frontier = nodes[stepNum - 1];
    const allNodeIDs = nodes.flat().map(n => n.track.id);

    const nextFront = allowReps
      ? this.find(songs)
      : this.find(songs).filter(song => !allNodeIDs.includes(song.track.id));

    if (nextFront.length === 0)
      return { links: [], frontier: [], union: null };

    // #region format
    const union = {
      id: "union-" + stepNum,
      isUnion: true,
    };

    const l1s = frontier.map(curr => ({
      source: curr.id + (stepNum - 1),
      target: union.id,
      stepid: this.id,
      colour: this.colour,
      isLHalf: true,
      isRHalf: false
    }));
    const l2s = nextFront.map(nxt => ({
      source: union.id,
      target: nxt.id + stepNum,
      stepid: this.id,
      colour: this.colour,
      isLHalf: false,
      isRHalf: true,
    }));

    // #endregion format
    const nFront = Array.from(new Set(nextFront))
      .map(node => ({
        ...node,
        stepNum,
        stepCol: this.colour,
        stepFeats: this.checkedFeatures().map(([fname, _]) => fname)
      }));
    const links = [...l1s, ...l2s];
    return { frontier: nFront, links, union };
  },
});

export default AbsStep;