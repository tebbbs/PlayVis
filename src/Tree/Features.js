import RangedStepElem from "./RangedStepElem"

const info = {
  tempo: {
    name: "Tempo (BPM)", short: "BPM",
    desc: "The overall estimated tempo of a track in beats per minute (BPM). In musical terminology, tempo is the speed or pace of a given piece and derives directly from the average beat duration.",
  },
  acousticness: {
    name: "Acousticness", short: "Acous.",
    desc: "A confidence measure from 0.0 to 1.0 of whether the track is acoustic. 1.0 represents high confidence the track is acoustic.",
  },
  danceability: {
    name: "Danceability", short: "Dance.",
    desc: "Danceability describes how suitable a track is for dancing based on a combination of musical elements including tempo, rhythm stability, beat strength, and overall regularity. A value of 0.0 is least danceable and 1.0 is most danceable.",
  },
  energy: {
    name: "Energy", short: "Energy",
    desc: "Energy is a measure from 0.0 to 1.0 and represents a perceptual measure of intensity and activity. Typically, energetic tracks feel fast, loud, and noisy. For example, death metal has high energy, while a Bach prelude scores low on the scale. Perceptual features contributing to this attribute include dynamic range, perceived loudness, timbre, onset rate, and general entropy.",
  },
  key: {
    name: "Key", short: "Key",
    desc: "The key the track is in. Integers map to pitches using standard Pitch Class notation. E.g. 0 = C, 1 = C♯/D♭, 2 = D, and so on. If no key was detected, the value is -1. Ranges from -1 to 11",
  }
};

const absRangedFeature = (feat) => ({
  ...info[feat],
  filter(songs, curr) { return songs.filter(song => this.min <= song.features[feat] && song.features[feat] <= this.max) },
  ranges(songs) {
    const minMax = (feats) => [Math.min(...feats), Math.max(...feats)];
    return minMax(songs.map(s => s.features[feat]));
  },
  view(songs, setState) {
    return <RangedStepElem
      label={this.short}
      format={x => (x * (["acousticness", "danceability", "energy"].includes(feat) ? 100 : 1)).toFixed(0)}
      state={this}
      range={this.ranges(songs)}
      setState={setState}
    />
  }
});

const relRangedFeature = (feat) => ({
  ...info[feat],
  filter(songs, curr) {
    return songs.filter(song => {
      const diff = 100 * (song.features[feat] - curr.features[feat]) / curr.features[feat];
      return this.min <= diff && diff <= this.max;
    })
  },
  view(songs, setState) {
    return <RangedStepElem
      label={this.short}
      format={x => `${x >= 0 ? "+" : ""}${x.toFixed(0)}%`}
      state={this}
      range={[-50, 50]}
      setState={setState}
    />
  }
});

const RelkeyFeature = () => ({
  ...info["key"],
  filter(songs, curr) {
    /* TODO */
    return songs;
  },
  view(songs, setState) {
    return (
      <div className="stepElem">
        <button id="x" onClick={() => setState({ ...this, checked: false })} className="smallDelButton">
          -
        </button>
        <div className="stepElemBody">
          <span className="stepElemTexts">{this.short}</span>
          <select id="keyOpts" className="keySelect">
            <option>Same</option>
            <option>Related 1</option>
            <option>Related 2</option>
          </select>
        </div>
      </div>
    )
  }
})

const AbskeyFeature = () => ({
  ...info["key"],
  filter(songs, curr) {
    /* TODO */
    return songs;
  },
  view(songs, setState) {
    return (
      <div className="stepElem">
        <button id="x" onClick={() => setState({ ...this, checked: false })} className="smallDelButton">
          -
        </button>
        <div className="stepElemBody">
          <span className="stepElemTexts">{this.short}</span>
          <select id="keyOpts" className="keySelect">
            {[...Array(12).keys()].map(i => <option key={i}>{i}</option>)}
          </select>
        </div>
      </div>
    )
  }
})

export const defaultAbsStepState = {
  tempo: { checked: true, min: 150, max: 180, ...absRangedFeature("tempo") },
  acousticness: { checked: true, min: 0, max: 0.30, ...absRangedFeature("acousticness") },
  danceability: { checked: true, min: 0.65, max: 1.00, ...absRangedFeature("danceability") },
  energy: { checked: false, min: 0.4, max: 0.9, ...absRangedFeature("energy") },
  key: { checked: false, /* more needed here */ ...AbskeyFeature() }
};

export const defaultRelStepState = {
  tempo: { checked: true, min: 0, max: 20, ...relRangedFeature("tempo") },
  acousticness: { checked: true, min: 0, max: 30, ...relRangedFeature("acousticness") },
  danceability: { checked: true, min: 0, max: 20, ...relRangedFeature("danceability") },
  energy: { checked: false, min: 0, max: 20, ...relRangedFeature("energy") },
  key: { checked: false /* more needed here */, ...RelkeyFeature() }
};