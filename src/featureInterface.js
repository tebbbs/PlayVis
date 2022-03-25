const feature = {
  name: "The name of the feature e.g. Tempo",
  short: "An abbreviation of the name e.g. Acous.",
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