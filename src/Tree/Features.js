/*
 * Created on Sat Apr 09 2022
 *
 * The MIT License (MIT)
 * Copyright (c) 2022 Joseph Tebbett, University of Birmingham
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software
 * and associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial
 * portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import RangedStepElem from "./RangedStepElem"

const info = {
  tempo: {
    name: "Tempo (BPM)", 
    desc: "The overall estimated tempo of a track in beats per minute (BPM). In musical terminology, tempo is the speed or pace of a given piece and derives directly from the average beat duration.",
  },
  acousticness: {
    name: "Acousticness", 
    desc: "A confidence measure from 0.0 to 1.0 of whether the track is acoustic. 1.0 represents high confidence the track is acoustic.",
  },
  danceability: {
    name: "Danceability",
    desc: "Danceability describes how suitable a track is for dancing based on a combination of musical elements including tempo, rhythm stability, beat strength, and overall regularity. A value of 0.0 is least danceable and 1.0 is most danceable.",
  },
  energy: {
    name: "Energy",
    desc: "Energy is a measure from 0.0 to 1.0 and represents a perceptual measure of intensity and activity. Typically, energetic tracks feel fast, loud, and noisy. For example, death metal has high energy, while a Bach prelude scores low on the scale. Perceptual features contributing to this attribute include dynamic range, perceived loudness, timbre, onset rate, and general entropy.",
  },
  key: {
    name: "Key",
    desc: "The key the track is in. Integers map to pitches using standard Pitch Class notation. E.g. 0 = C, 1 = C♯/D♭, 2 = D, and so on. If no key was detected, the value is -1. Ranges from -1 to 11",
  }
};

const absRangedFeature = (feat) => {

  const isDecimal = ["acousticness", "danceability", "energy"].includes(feat);
  const format = {
    fRead: x => (x * (isDecimal ? 100 : 1)).toFixed(0),
    fEdit: x => (x * (isDecimal ? 100 : 1)).toFixed(0),
    uFEdit: x => parseFloat(x / (isDecimal ? 100.0 : 1.0)),
    step: isDecimal ? 0.01 : 1,
  }

  return {
    ...info[feat],
    filter(songs, curr) { return songs.filter(song => this.min <= song.features[feat] && song.features[feat] <= this.max) },
    ranges(songs) {
      const minMax = (feats) => [Math.min(...feats), Math.max(...feats)];
      return minMax(songs.map(s => s.features[feat]));
    },
    view(songs, setState) {
      return <RangedStepElem
        label={this.name}
        format={format}
        state={this}
        range={this.ranges(songs)}
        setState={setState}
      />
    }
  }
};

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
      label={this.name}
      format={{
        fRead: x => `${x >= 0 ? "+" : ""}${x.toFixed(0)}%`,
        fEdit: x => x.toFixed(0),
        uFEdit: x => parseInt(x),
        step: 1
      }}
      state={this}
      range={[-50, 50]}
      setState={setState}
    />
  }
});

const absKeyFeature = () => ({
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
          <select id="keyOpts" className="keySelect"
            value={this.val} onChange={e => setState({ ...this, val: e.target.value })}
          >
            {[...Array(12).keys()].map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
      </div>
    )
  }
})

const relKeyFeature = () => ({
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
          <span className="stepElemTexts">{this.name}</span>
          <br></br>
          <select id="keyOpts" className="keySelect"
            value={this.val} onChange={e => setState({ ...this, val: e.target.value })}
          >
            <option value="same">Same</option>
            <option value="rel1">Related 1</option>
            <option value="rel2">Related 2</option>
          </select>
        </div>
      </div>
    )
  }
});

export const defaultAbsStepState = {
  tempo: { checked: true, min: 150, max: 180, ...absRangedFeature("tempo") },
  acousticness: { checked: true, min: 0, max: 0.30, ...absRangedFeature("acousticness") },
  danceability: { checked: true, min: 0.65, max: 0.95, ...absRangedFeature("danceability") },
  energy: { checked: false, min: 0.4, max: 0.9, ...absRangedFeature("energy") },
  key: { checked: false, val: 3, /* more needed here */ ...absKeyFeature() }
};

export const defaultRelStepState = {
  tempo: { checked: true, min: 0, max: 20, ...relRangedFeature("tempo") },
  acousticness: { checked: true, min: 0, max: 30, ...relRangedFeature("acousticness") },
  danceability: { checked: true, min: 0, max: 20, ...relRangedFeature("danceability") },
  energy: { checked: false, min: 0, max: 20, ...relRangedFeature("energy") },
  key: { checked: false, val: "same", /* more needed here */ ...relKeyFeature() }
};