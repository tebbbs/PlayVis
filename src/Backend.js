// Essentially a module for non-UI code

import { colours } from "./App";

const formatTree = ({ val, children }) => (
  {
    name: val.track.name,
    id: val.track.id,
    attributes: {
      artist: val.track.artists[0].name,
      genre: val.track.fullArtist.genres[0],
      linkColor: colours[val.stepid % colours.length],
      bpm: val.bpm,
      acous: val.acous,
      dance: val.dance,
      strrep: `bpm: ${val.bpm} acous: ${val.acous} dance: ${val.dance}`,
    },
    children: children.map(formatTree)
  }
)

// const shuffleArray = (array) => {
//   for (let i = array.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1));
//       [array[i], array[j]] = [array[j], array[i]];
//   }
// }

export const tree2graph = (tnode, links = [], nodes = []) => {
  const { name, id, attributes, children } = tnode;
  if (!nodes.map(node => node.id).includes(id))
    nodes.push({ name, id, attributes });
  if (children.length !== 0) {
    children.map(child => links.push(
      {
        source: id,
        target: child.id,
        debugstr: `${tnode.name} -> ${child.name}`,
        color: child.attributes.linkColor
      }
    ));
    children.map(child => tree2graph(child, links, nodes));
  }
  return { nodes, links }
}

export const genPL = (songs, features, recipeSteps) => {
  // expand recipe out such that a step applied for n songs becomes n steps
  const oneSteps = recipeSteps.flatMap(step => {
    const { id, state } = step
    const { bpm, acous, dance, nSongs } = state;
    return Array(nSongs).fill(({ id, params: { bpm, acous, dance } }))
  });

  let fsongs = songs.map((song, i) =>
  ({
    track: song.track,
    bpm:   features[i].tempo,
    acous: features[i].acousticness,
    dance: features[i].danceability
  }));

  // Will allow this to be selected later
  const seed = fsongs[0];

  // track already chosen track ids
  let played = [seed.track.id];

  const genChildren = (parent, step, n) => {

    // Prevents the same tracks from being considered too often, but with the
    // side effect of alternating recentently added/old tracks as fsongs is sorted by
    // date added 
    // Shuffling is an alternative but obviously isn't deterministic
    fsongs.reverse(); 


    let children = [];
    const { bpm, acous, dance } = step.params;

    for (let i = 0; i < fsongs.length && children.length < n; i++) {

      const cand = fsongs[i];
      const bpmdiff  = 100 * (cand.bpm - parent.bpm) / parent.bpm;
      const acousdif = 100 * (cand.acous - parent.acous) / parent.acous;
      const dancedif = 100 * (cand.dance - parent.dance) / parent.dance;

      if ( (!bpm.checked || (bpm.min <= bpmdiff && bpmdiff <= bpm.max))
        && (!acous.checked || (acous.min <= acousdif && acousdif <= acous.max))
        && (!dance.checked || (dance.min <= dancedif && dancedif <= dance.max))
        // will need a better check to impose min length on cycles
        //&& cand.track.id !== parent.track.id) {
        && !played.slice(-20).includes(cand.track.id)) {
        // && !played.includes(cand.track.id)) {

        children.push({ ...cand, stepid: step.id });
        played.push(cand.track.id);
      }
    }
    return children;
  }

  const treeGen = (val, f, depth) => (
    {
      val: val,
      children: f(val, depth).map(child => treeGen(child, f, depth - 1))
    });

  const maxDepth = oneSteps.length;

  return tree2graph(formatTree(treeGen(
    { ...seed, stepid: recipeSteps.length ? recipeSteps[0].id : 0 },
    ((song, d) => d ? genChildren(song, oneSteps[maxDepth - d], d / 2) : []),
    maxDepth
  )));
}
