import FeatureStep from "./FeatureStep";

const absStepState = {
  bpm: { checked: true, min: 150, max: 180 },
  acous: { checked: true, min: 0, max: 30 },
  dance: { checked: true, min: 65, max: 100 }
};

const AbsStep = (id) => ({
  ...FeatureStep("Absolute", id),
  
  state: absStepState,

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

  find(songs) {
    const { bpm, acous, dance } = this.state;
    return songs.filter(song =>
      (!bpm.checked || (bpm.min < song.bpm && song.bpm < bpm.max)) &&
      (!acous.checked || (acous.min / 100 < song.acous && song.acous < acous.max / 100)) &&
      (!dance.checked || (dance.min / 100 < song.dance && song.dance < dance.max / 100))
    )
  },

  ranges(songs) {
    const minMax = (feats) => [Math.min(...feats), Math.max(...feats)];
    return {
      bpm: minMax(songs.map(s => s.bpm)),
      acous: minMax(songs.map(s => s.acous)).map(x => x * 100),
      dance: minMax(songs.map(s => s.dance)).map(x => x * 100)
    }
  },

  format(x) { 
    return x.toFixed(0);
  }

});

export default AbsStep;