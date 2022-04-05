import FeatureStep from "./FeatureStep";
import { defaultAbsStepState } from "./Features";

const AbsStep = (id) => ({
  ...FeatureStep("Absolute", id),

  state: defaultAbsStepState,
  canMax() { return false },

  apply(dag, songs, allowReps) {
    for (let i = 0; i < this.loops; i++)
      dag = this.applyCommon(dag, songs, allowReps);
    return dag;
  },

  expand(songs, nodes, allowReps) {

    const stepNum = nodes.length;
    const frontier = nodes[stepNum - 1];
    const allNodeIDs = nodes.flat().map(n => n.track.id);

    const nextFront = allowReps
      ? this.find(songs)
      : this.find(songs).filter(n => allNodeIDs.includes(n.id));

    if (nextFront.length === 0)
      return { links: [], frontier: [], union: null };

    // #region format
    const union = {
      id: "union-" + stepNum,
      isUnion: true,
    };

    const l1s = frontier.map(curr => ({
      source: curr.id + (stepNum - 1),
      target: union.id,
      stepid: this.id,
      colour: this.colour,
      isLHalf: true,
      isRHalf: false
    }));
    const l2s = nextFront.map(nxt => ({
      source: union.id,
      target: nxt.id + stepNum,
      stepid: this.id,
      colour: this.colour,
      isLHalf: false,
      isRHalf: true,
    }));

    // #endregion format
    const nFront = Array.from(new Set(nextFront))
      .map(node => ({
        ...node,
        stepNum,
        stepCol: this.colour,
        stepFeats: this.checkedFeatures().map(([fname, _]) => fname)
      }));
    const links = [...l1s, ...l2s];
    return { frontier: nFront, links, union };
  },
});

export default AbsStep;