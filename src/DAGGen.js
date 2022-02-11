import { cloneDeep } from 'lodash'
import DAG from './DAG'

const formatNodes = (nodes) => nodes.map(narr => narr.map(node => (
  {
    name: node.track.name,
    id: node.id + node.stepNum,
    trackid: node.track.id,
    imgurl: node.track.album.images[1].url,

    stepNum: node.stepNum,
    stepCol: node.stepCol,

    isUnion: false,
    isClicked: false,
    isHighlighted: false,
    highlightCol: "clear",

    attributes: {
      artist: node.track.artists[0].name,
      genre: node.track.fullArtist.genres[0],
      bpm: node.bpm,
      acous: node.acous,
      dance: node.dance,
    }
  })))

// probably need to change this to something more automata 
// like to handle 'max'/'inf' loop options
// side note: would be good to follow 'max' by an absolute step to 'reset' things
const tree2List = (node) => {
  if (node.isStep)
    return Array(node.loops).fill(node)

  // unroll this step
  const unrolled = Array(node.loops).fill(node.children).flat()

  // unroll children
  return unrolled.flatMap(tree2List);

}

const expandRel = (songs, frontier, step, stepNum) => {
  let links = [];
  const nextFront = frontier.flatMap(curr => {
    const next = findRel(songs, curr, step.state)
      .filter(song =>
        song.track.fullArtist.name !== curr.track.fullArtist.name
        && song.track.name !== curr.track.name
      );
    links.push(...next.map(nxt =>
    ({
      source: curr.id + (stepNum - 1),
      target: nxt.id + stepNum,
      stepid: step.id,
      colour: step.colour,
      // need a better way to do this
      isLHalf: false,
      isRHalf: false,
    })));
    return next;
  });
  const nFront = Array.from(new Set(nextFront))
    .map(node => ({ ...node, stepNum, stepCol: step.colour }));
  return { frontier: nFront, links };

}

const expandAbs = (songs, frontier, step, stepNum) => {
  const nextFront = findAbs(songs, step.state);

  if (!nextFront.length) {
    return { frontier: [], links: [], union: null }
  }
  const union = {
    id: "union-" + stepNum,
    isUnion: true,
  };
  const l1s = frontier.map(curr => ({
    source: curr.id + (stepNum - 1),
    target: union.id,
    stepid: step.id,
    colour: step.colour,
    isLHalf: true,
    isRHalf: false
  }));
  const l2s = nextFront.map(nxt => ({
    source: union.id,
    target: nxt.id + stepNum,
    stepid: step.id,
    colour: step.colour,
    isLHalf: false,
    isRHalf: true,
  }));

  const nFront = Array.from(new Set(nextFront))
    .map(node => ({ ...node, stepNum, stepCol: step.colour }));

  const links = [...l1s, ...l2s]

  return { frontier: nFront, links, union };

}

const findRel = (songs, curr, constraints) => {
  const { bpm, acous, dance } = constraints;
  return songs.filter(song => {
    const bpmdiff = 100 * (song.bpm - curr.bpm) / curr.bpm;
    const acousdif = 100 * (song.acous - curr.acous) / curr.acous;
    const dancedif = 100 * (song.dance - curr.dance) / curr.dance;
    return ((!bpm.checked || (bpm.min <= bpmdiff && bpmdiff <= bpm.max))
      && (!acous.checked || (acous.min <= acousdif && acousdif <= acous.max))
      && (!dance.checked || (dance.min <= dancedif && dancedif <= dance.max)))
  })
}

const findAbs = (songs, constraints) => {
  const { bpm, acous, dance } = constraints;

  return songs.filter(song =>
    (!bpm.checked || (bpm.min < song.bpm && song.bpm < bpm.max)) &&
    (!acous.checked || (acous.min / 100 < song.acous && song.acous < acous.max / 100)) &&
    (!dance.checked || (dance.min / 100 < song.dance && song.dance < dance.max / 100))
  )
}

/**
 * Applies step to find the next layer of nodes for the current dag
 * Removes nodes that don't have any paths through them to the last layer
 * Returns copy of DAG
 * @param {*} songs 
 * @param {*} step 
 * @param {*} dag 
 */
const expandStep = (songs, step, dag) => {
  let { nodes, links, unions } = cloneDeep(dag);
  const stepNum = nodes.length;
  const frontier = nodes[stepNum - 1];
  const result = step.isRel ?
    expandRel(songs, frontier, step, stepNum)
    : expandAbs(songs, frontier, step, stepNum);

  if (result.frontier.length === 0)
    return { nodes: [], links: [], unions: [] }

  links.push(result.links);

  if (!step.isRel) {
    unions.push(result.union);
  }

  else {
    for (let j = stepNum - 1; j >= 0; j--) {
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
  nodes.push(result.frontier);

  return { nodes, links, unions }

}

export const genDAG = (stepTree, songs) => {
  const steps = tree2List(stepTree);

  const initialNodes = findAbs(songs, steps[0].state)
    .map(song => ({ ...song, stepNum: 0, stepCol: steps[0].colour }));

  let dag = { nodes: [initialNodes], links: [], unions: [] }

  for (let i = 1; i < steps.length; i++) {
    const step = steps[i];
    dag = expandStep(songs, step, dag);
  }
  // Add default properties for view
  dag.nodes = formatNodes(dag.nodes);

  return new DAG(dag.nodes, dag.links, dag.unions);

}

const isEmpty = ({ nodes, links, unions }) =>
  nodes.flat().length === 0
  && links.flat().length === 0
  && unions.length === 0

export const genDAG3 = (node, songs) => {
  // Find first step
  let step1 = node;
  while (!step1.isStep)
    step1 = node.children[0];

  // Set up initial DAG
  const initialNodes = findAbs(songs, step1.state)
    .map(song => ({ ...song, stepNum: 0, stepCol: step1.colour }));

  let initDag = { nodes: [initialNodes], links: [], unions: [] };

  const tree = cloneDeep(node);
  tree.id = "root";
  tree.children = tree.children.slice(1);

  const { nodes, links, unions } = treeTraverse(initDag, tree, songs);

  return new DAG(formatNodes(nodes), links, unions);

}

export const treeTraverse = (dag, node, songs) => {

  // TODO: Refactor this

  let newDag = dag;
  // Case: group
  if (!node.isStep) {
    if (node.isMax) {
      let nextDag = newDag;
      let hasResult = true;
      while (hasResult) {
        // Loop over children, see if they can be applied
        for (let i = 0; i < node.children.length; i++) {
          nextDag = treeTraverse(nextDag, node.children[i], songs)
          if (isEmpty(nextDag)) {
            hasResult = false;
            break;
          }
        }
        // If all children can be expanded, update newDag
        if (hasResult) newDag = nextDag;
      }
    }
    // Just a numerical loop
    else 
      for (let i = 0; i < node.loops; i++) 
        for (let j = 0; j < node.children.length; j++) 
          newDag = treeTraverse(newDag, node.children[j], songs);

    return newDag;
  }
  // Case: step
  else {
    const step = node;

    if (step.isRel && step.isMax) {
      let nextDag = expandStep(songs, step, newDag);
      while (!isEmpty(nextDag)) {
        newDag = nextDag;
        nextDag = expandStep(songs, step, nextDag);
      }
    }

    else {
      for (let i = 0; i < step.loops; i++) {
        newDag = expandStep(songs, step, newDag);
      }
    }
    return newDag;
  }
}
