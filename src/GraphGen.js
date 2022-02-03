import DAG from './DAG'

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

const DAGexpandRel = (songs, frontier, step, stepNum) => {
  let links = [];
  const nextFront = frontier.flatMap(curr => {
    const next = findRel(songs, curr, step.state)
      .filter(song =>
        // song.id !== curr.id
        song.track.fullArtist.name !== curr.track.fullArtist.name && song.track.name !== curr.track.name
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
    .map(node => ({ ...node, stepNum, stepcol: step.colour }));
  return { frontier: nFront, links };

}

const DAGexpandAbs = (songs, frontier, step, stepNum) => {
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
    .map(node => ({ ...node, stepNum, stepcol: step.colour }));

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

export const genDAG2 = (stepTree, songs) => {
  const steps = tree2List(stepTree);

  let frontier = findAbs(songs, steps[0].state)
    .map(song => ({ ...song, stepNum: 0, stepcol: steps[0].colour }));

  let links = [];
  let nodes = [frontier];
  let unions = [];

  for (let i = 1; i < steps.length; i++) {
    const result = steps[i].isRel ?
      DAGexpandRel(songs, frontier, steps[i], i)
      : DAGexpandAbs(songs, frontier, steps[i], i);

    frontier = result.frontier;

    links.push(result.links);

    if (!steps[i].isRel) {
      unions.push(result.union);
    }

    else {
      for (let j = i - 1; j >= 0; j--) {
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
  }

  return new DAG(nodes, links, unions);
}
