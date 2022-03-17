import FeatureStep from "./FeatureStep";
import { defaultAbsStepState } from "./FeatureInfo";

const AbsStep = (id) => ({
  ...FeatureStep("Absolute", id),
  
  state: defaultAbsStepState,

  apply(dag, songs) {
    for (let i = 0; i < this.loops; i++)
      dag = this.applyCommon(dag, songs);
    return dag;
  },

  expand(songs, frontier, stepNum) {
    const nextFront = this.find(songs);

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
      .map(node => ({ ...node, stepNum, stepCol: this.colour }));
    const links = [...l1s, ...l2s];
    return { frontier: nFront, links, union };
  },
});

export default AbsStep;