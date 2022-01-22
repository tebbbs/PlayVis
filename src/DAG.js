export default class DAG {

  constructor(nodes, links) {
    this.nodes = nodes;
    this.links = links;
  }

  getRoutesTo(trackid, stepNum) {
    // Copy nodes and links
    let nodes = this.nodes.map(arr => arr.slice());
    let links = this.links.map(arr => arr.slice());

    // Remove songs in this row
    nodes[stepNum] = nodes[stepNum].filter(n => n.id === trackid)

    // Remove songs that don't go through trackid
    if (stepNum > 0) {
      // In current row, remove links that aren't to trackid
      links[stepNum - 1] = links[stepNum - 1]
        .filter(l => l.target === trackid + stepNum);
      // Go back and remove all paths that don't lead to trackid
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
      }
    }
    return [ nodes, links ]
  }

  getRoutesFrom(trackid, stepNum) {
    // Copy nodes and links
    let nodes = this.nodes.map(arr => arr.slice());
    let links = this.links.map(arr => arr.slice());
    
    // Remove songs in this row
    nodes[stepNum] = nodes[stepNum].filter(n => n.id === trackid)
    // Remove songs that aren't reachable from trackid
    if (stepNum < nodes.length - 1) {
      // In next row, remove links that aren't reachable from trackid
      links[stepNum] = links[stepNum]
        .filter(l => l.source === trackid + stepNum);
      // Go forward and remove all paths that don't start from trackid
      for (let j = stepNum + 1; j < nodes.length; j++) {
        // find nodes to remove, i.e. nodes with no links to them
        const tgts = links[j - 1].map(l => l.target);
        const idsToRemove = nodes[j]
          .map(node => node.id + j)
          .filter(id => !tgts.includes(id));
        // remove links from nodes that are to be removed
        if (j < nodes.length - 1)
          links[j] = links[j].filter(l => !idsToRemove.includes(l.source));
        // remove nodes
        nodes[j] = nodes[j].filter(n => !idsToRemove.includes(n.id + j));
      }
    }

    return [ nodes, links ]
  }

  chooseSong(trackid, stepNum) {
    const [nodes1, links1] = this.getRoutesTo(trackid, stepNum);
    const [nodes2, links2] = this.getRoutesFrom(trackid, stepNum);
    const nodesNew = [ ...(nodes1.slice(0, stepNum)), ...(nodes2.slice(stepNum)) ];
    const linksNew = [ ...(links1.slice(0, stepNum)), ...(links2.slice(stepNum)) ];
    return [ nodesNew, linksNew ]

  }

}

// MUTATING FUNCTIONS

// pruneRoutesTo(trackid, stepNum) {
//   // Remove songs in this row
//   this.nodes[stepNum] = this.nodes[stepNum].filter(n => n.id === trackid)

//   // Remove songs that don't go through trackid
//   if (stepNum > 0) {
//     // In current row, remove links that aren't to trackid
//     this.links[stepNum - 1] = this.links[stepNum - 1]
//       .filter(l => l.target === trackid + stepNum);
//     // Go back and remove all paths that don't lead to trackid
//     for (let j = stepNum - 1; j >= 0; j--) {
//       // find nodes to remove, i.e. nodes with no links coming from them
//       const srcs = this.links[j].map(l => l.source);
//       const idsToRemove = this.nodes[j]
//         .map(node => node.id + j)
//         .filter(id => !srcs.includes(id));
//       // remove links to nodes that are to be removed
//       if (j > 0)
//         this.links[j - 1] = this.links[j - 1].filter(l => !idsToRemove.includes(l.target));
//       // remove nodes
//       this.nodes[j] = this.nodes[j].filter(n => !idsToRemove.includes(n.id + j));
//     }
//   }
// }

// pruneRoutesFrom(trackid, stepNum) {
//   // Remove songs in this row
//   this.nodes[stepNum] = this.nodes[stepNum].filter(n => n.id === trackid)
//   // Remove songs that aren't reachable from trackid
//   if (stepNum < this.nodes.length - 1) {
//     // In next row, remove links that aren't reachable from trackid
//     this.links[stepNum] = this.links[stepNum]
//       .filter(l => l.source === trackid + stepNum);
//     // Go forward and remove all paths that don't start from trackid
//     for (let j = stepNum + 1; j < this.nodes.length; j++) {
//       // find nodes to remove, i.e. nodes with no links to them
//       const tgts = this.links[j - 1].map(l => l.target);
//       const idsToRemove = this.nodes[j]
//         .map(node => node.id + j)
//         .filter(id => !tgts.includes(id));
//       // remove links from nodes that are to be removed
//       if (j < this.nodes.length - 1)
//         this.links[j] = this.links[j].filter(l => !idsToRemove.includes(l.source));
//       // remove nodes
//       this.nodes[j] = this.nodes[j].filter(n => !idsToRemove.includes(n.id + j));
//     }
//   }
// }