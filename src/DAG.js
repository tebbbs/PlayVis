export default class DAG {

  constructor(nodes, links, unions) {
    this.nodes = nodes;
    this.links = links;
    this.unions = unions;
    // Should have a better solution than this ideally
    this.reload = false;
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
        .filter(l => l.target === trackid + stepNum || l.isLHalf);
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

    return new DAG(nodes, links, this.unions);

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
        .filter(l => l.source === trackid + stepNum || l.isRHalf);
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

    return new DAG(nodes, links, this.unions);

  }

  chooseSong(trackid, stepNum) {
    return this
      .getRoutesTo(trackid, stepNum)
      .getRoutesFrom(trackid, stepNum)

  }

  dagString() {
    return {
      nodes: this.nodenames(),
      links: this.linknames(),
      reload: this.reload
    }
  }

  nodenames() {
    return this.nodes.map(
      arr => arr.map(n => n.track.name))
  };

  linknames() {
    return this.links.map(
      (arr, i) => arr.map(
        l => {
          const src = this.nodes[i].find(n => "" + n.id + i === l.source).track.name;
          const tgt = this.nodes[i + 1].find(n => "" + n.id + (i + 1) === l.target).track.name;
          return `${src} -> ${tgt}`
        }
      )
    )
  }

}

