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
    // console.log("returning empty dag on line 58, result of expandAbs is empty");
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
  // not sure when this would happen but prevents crashes for now
  if (!frontier) {
    // console.log("returning empty dag on line 127, nodes[stepNum - 1] is undefined");
   return { nodes: [], links: [], unions: [] };
  }
  const result = step.isRel ?
    expandRel(songs, frontier, step, stepNum)
    : expandAbs(songs, frontier, step, stepNum);

  if (result.frontier.length === 0) {
    // console.log("returning empty dag on line 133, result of expandRel/Abs is empty");
    return { nodes: [], links: [], unions: [] };
  }

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

const isEmpty = ({ nodes, links, unions }) =>
  nodes.flat().length === 0
  && links.flat().length === 0
  && unions.length === 0

/**
 * Sets up an initial DAG before traversing the recipe tree to compute
 * the final DAG.
 * @param {*} node 
 * @param {*} songs 
 * @returns 
 */
export const genDAG3 = (node, songs) => {

  // Remove first step from tree to be used to find initial nodes 
  const step1 = node.children[0];
  const tree = { ...node, children: node.children.slice(1) };

  // Set up initial DAG
  const initNodes = findAbs(songs, step1.state)
    .map(song => ({ ...song, stepNum: 0, stepCol: step1.colour }));
  let dag = { nodes: [initNodes], links: [], unions: [] };

  // Expand initial step
  for (let i = 1; i < step1.loops; i++)
    dag = expandStep(songs, step1, dag);
  
  // Expand the rest of the children of the root once
  dag = treeTraverse(dag, { ...tree, loops: 1 }, songs);

  // Restore the initial step and generate the dag the remaining number of times
  // This works because 'dag' is now non-empty
  if (tree.loops > 1) {
    tree.children = [step1, ...tree.children];
    tree.loops -= 1;
    dag = treeTraverse(dag, tree, songs);
  }

  const { nodes, links, unions } = dag;

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
