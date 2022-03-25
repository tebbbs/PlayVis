import FeatureStep from "./FeatureStep";
import { defaultRelStepState } from "./Features";

const RelStep = (id) => ({
  ...FeatureStep("Relative", id),
  
  state: defaultRelStepState,
  canMax() { return true },

  apply(dag, songs) {
    if (this.isMax) {
      let nextDag = this._applyOnce(dag, songs);
      for (let i = 0; i < this.MAX_LIMIT && nextDag; i++) {
        dag = nextDag;
        nextDag = this._applyOnce(nextDag, songs);
      }
    }
    else for (let i = 0; i < this.loops; i++)
      dag = this._applyOnce(dag, songs);
    return dag;
  },

  _applyOnce(dag, songs) {
    const next = this.applyCommon(dag, songs)
    if (!next) return null;
    const { nodes, links, unions } = next;
    prune(nodes, links);
    return { nodes, links, unions };

  },

  expand(songs, frontier, stepNum) {
    let links = [];
    //#region format
    const nextFront = frontier.flatMap(curr => {
      const next = this.find(songs, curr, this.state)
        .filter(song =>
          song.track.fullArtist.name !== curr.track.fullArtist.name
          && song.track.name !== curr.track.name
        );
      links.push(...next.map(nxt =>
      ({
        source: curr.id + (stepNum - 1),
        target: nxt.id + stepNum,
        stepid: this.id,
        colour: this.colour,
        // need a better way to do this
        isLHalf: false,
        isRHalf: false,
      })));
      return next;
    });
    //#endregion format
    const nFront = Array.from(new Set(nextFront))
      .map(node => ({ ...node, stepNum, stepCol: this.colour }));
    return { frontier: nFront, links };

  },

});

export default RelStep;

// might be able to extend this to prune at differnt depths for alt steps

// Should be called after the frontier has been pushed to nodes
const prune = (nodes, links) => {

  for (let j = nodes.length - 2; j >= 0; j--) {
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