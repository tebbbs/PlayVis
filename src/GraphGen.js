// probably need to change this to something more automata 
// like to handle 'max'/'inf' loop options
const tree2List = (node) => {
  if (node.isStep) return node;
  const unrolled = node.children.flatMap(child =>
    Array(child.loops).fill(child));
  return unrolled.flatMap(tree2List);
}

const expand = (songs, frontier, step) => {
  let links = [];
  const nextFront = frontier.flatMap(curr => {
    const next = (step.isRel ?
      findRel(songs, curr, step.state) :
      findAbs(songs, step.state))
      .filter(song => song.id !== curr.id);
    links.push(...next.map(nxt =>
    ({
      source: curr.id,
      target: nxt.id,
      stepid: step.id,
      color: step.colour
    })));
    return next;
  });
  const nFront = Array.from(new Set(nextFront));
  return { frontier: nFront, links };

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

  // TODO: make absolute step interface better

  return songs.filter(song =>
    (!bpm.checked || (bpm.min < song.bpm && song.bpm < bpm.max)) &&
    (!acous.checked || (acous.min / 100 < song.acous && song.acous < acous.max / 100)) &&
    (!dance.checked || (dance.min / 100 < song.dance && song.dance < dance.max / 100))
  )
}

export const genGraph2 = (root, songs) => {
  const steps = tree2List(root);
  if (steps[0].isRel) {
    console.log("Root is relative, cannot continue");
    return;
  }

  let frontier = findAbs(songs, steps[0].state);
  let links = []
  let nodes = new Set(frontier);
  for (let i = 1; i < steps.length; i++) {
    const result = expand(songs, frontier, steps[i]);
    frontier = result.frontier;
    links = [...links, ...result.links];
    // Remove nodes that didn't have neighbours/weren't added to the
    // frontier after 2nd step
    if (i === 1) {
      const srcs = links.map(l => l.source);
      const tgts = links.map(l => l.target);
      const conNodes = [...nodes, ...result.frontier].filter(node =>
        srcs.includes(node.id) || tgts.includes(node.id));
      nodes = new Set(conNodes);
    }
    else
      nodes = new Set([...nodes, ...result.frontier])

  }

  const lnodes = Array.from(nodes);
  const llinks = Array.from(links)

  return { nodes: lnodes.map(formatNode), links: llinks }

}

const createMidNode = (l) => ({
  name: "",
  id: l.source + l.stepid + l.target,
  img: new Image(),
  color: l.colour,
  attributes: {
    artist: "",
    genre: "",
    bpm: -1,
    acous: -1,
    dance: -1,
    strrep: "",
  },
  isMid: true
})

const splitLink = (l) => {
  const mid = createMidNode(l);
  const la = {
    ...l,
    source: l.source,
    target: mid.id,
  }
  const lb = {
    ...l,
    source: mid.id,
    target: l.target,
  }
  return { la, mid, lb }
}

export const spreadLinks = ({ nodes, links }) => {
  let nodesToAdd = [];
  let linksToAdd = [];
  let linkIdxsToRemove = [];

  for (let i = 0; i < links.length; i++) {
    const l1 = links[i];
    for (let j = i + 1; j < links.length; j++) {
      const l2 = links[j];
      if ((l1.source === l2.source && l1.target === l2.target)
        || (l1.source === l2.target && l1.target === l2.source)) {
        const { la: l1a, mid: mid1, lb: l1b } = splitLink(l1);
        const { la: l2a, mid: mid2, lb: l2b } = splitLink(l2);
        nodesToAdd.push(mid1, mid2);
        linksToAdd.push(l1a, l1b, l2a, l2b);
        linkIdxsToRemove.push(i, j);
      }
    }
  }
  const rnodes = nodes.concat(nodesToAdd);
  const rlinks = links.filter((_, i) => !linkIdxsToRemove.includes(i))
    .concat(linksToAdd)

  return { nodes: rnodes, links: rlinks }

}

const formatNode = (val) => {
  const imgObj = val.track.album.images[1];
  const img = new Image(imgObj.width, imgObj.height);
  img.src = imgObj.url;
  return {
    name: val.track.name,
    id: val.id,
    img: img,
    attributes: {
      artist: val.track.artists[0].name,
      genre: val.track.fullArtist.genres[0],
      bpm: val.bpm,
      acous: val.acous,
      dance: val.dance,
      strrep: `bpm: ${val.bpm} acous: ${val.acous} dance: ${val.dance}`,
    },
    isMid: false

  }
}


