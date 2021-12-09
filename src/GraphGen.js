import { getColour } from "./Recipe";

const formatTree = ({ val, children }) => (
  {
    name: val.track.name,
    id: val.track.id,
    attributes: {
      artist: val.track.artists[0].name,
      genre: val.track.fullArtist.genres[0],
      linkColor: getColour(val.stepid),
      bpm: val.bpm,
      acous: val.acous,
      dance: val.dance,
      strrep: `bpm: ${val.bpm} acous: ${val.acous} dance: ${val.dance}`,
    },
    children: children.map(formatTree)
  }
)

const tree2graph = (tnode, links = [], nodes = []) => {
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

const treeGen = (val, f, depth) => (
  {
    val: val,
    children: f(val, depth).map(child => treeGen(child, f, depth - 1))
  });

const genChildren = (parent, fsongs, played, step, n = 2, maxCycLen = 20) => {

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
      // && cand.track.id !== parent.track.id) {
      && !played.slice(-maxCycLen).includes(cand.track.id)) {
      // && !played.includes(cand.track.id)) {
      // ) {
        children.push({ ...cand, stepid: step.id });
        played.push(cand.track.id);
    }
  }
  return children;
}

// TODO: add branching algo as an argument


// branch less for each step away from the root node, starting from 5
const decreaseBranch = maxBranches => maxDepth => height => Math.max(maxBranches - (maxDepth - height), 1) 
// always make n branches
const alwaysN = n => _ => _ => n

export const bAlgos = [
  {
    desc: "Decrease branch count for each step away from root node, starting from 5",
    fun: decreaseBranch(5)
  },
  {
    desc: "Always 2",
    fun: alwaysN(2)
  }];


export const genGraph = (seed, fsongs, recipeSteps, config) => {

  // copy fsongs to stop orginal fsongs from being reversed repeatedly
  const songs = fsongs.slice(0);

  // expand recipe out such that a step applied for n songs becomes n steps
  const oneSteps = recipeSteps.flatMap(step => {
    const { id, state } = step
    const { bpm, acous, dance, nSongs } = state;
    return Array(nSongs).fill(({ id, params: { bpm, acous, dance } }))
  });

  const { algoidx, maxCycLen } = config;

  // record already chosen track ids
  let played = [seed.track.id];
  const maxDepth = oneSteps.length;

  const branches = bAlgos[algoidx].fun(maxDepth);

  const tree = treeGen(
    { ...seed, stepid: recipeSteps.length ? recipeSteps[0].id : 0 },
    ((song, d) => d ? genChildren(song, songs, played, oneSteps[maxDepth - d], branches(d), maxCycLen) : []),
    maxDepth
  );
  const fTree = formatTree(tree);
  return tree2graph(fTree);

}
