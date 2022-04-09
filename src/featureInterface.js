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

// Step feature object structure - would be an interface in a language like Java

const feature = {
  name: "The name of the feature e.g. Tempo",
  desc: "A description of the feature, shown in the step configuration popup",
  filter(songs, current) {
    /* 
    A function that filters songs based on the this feature component's
    state. A step runs all its components 'filter' functions in sequence
    for each song in last layer of the graph to produce the next layer.
    */
  },
  view(songs, setState) {
    /*
    Returns a React Component that allows this comonent to be configured. No
    constraints are imposed other than that it should be small enough to fit
    in a step. Songs are provideed as an argument to enable things like 
    finding the min/max value for a feature in a user's library
    */
  },
  checked: false, // Whether the feature is selected for a step

  ...state // the state of the feature e.g. { min : 120, max: 150}

}