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

import Node from "./Node";
import { cloneDeep } from "lodash";

const Step = (type, id) => ({
  ...Node(type, id),

  applyCommon(dag, songs, allowReps) {

    if (!dag) return null;

    let { nodes, links, unions } = cloneDeep(dag);
    const result = this.expand(songs, nodes, allowReps);
    
    if (result.frontier.length === 0) return null;

    links.push(result.links);
    nodes.push(result.frontier);
    if (result.union) unions.push(result.union);

    return { nodes, links, unions };

  },

  expand() {
    throw new Error("expand() not overridden");
  },

  find(songs, curr) {
    let results = songs;
    this.checkedFeatures().forEach(([name, feat]) => {
        results = feat.filter(results, curr);
    });
    return results;
  },

  renderChildren(setNode) {
    throw new Error("renderChildren() not overridden");
  }

});

export default Step;

