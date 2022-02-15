const colours = ["#173F5F", "#20639B", "#3CAEA3", "#F6D55C", "#ED553B"]

const relStepState = {
  bpm: { checked: true, min: 0, max: 20 },
  acous: { checked: true, min: 0, max: 30 },
  dance: { checked: true, min: 0, max: 20 }
};

const absStepState = {
  bpm: { checked: true, min: 150, max: 180 },
  acous: { checked: true, min: 0, max: 30 },
  dance: { checked: true, min: 65, max: 100 }
};

export const ranges = (songs) => {

  const bpms = songs.map(s => s.bpm);
  const acouss = songs.map(s => s.acous);
  const dances = songs.map(s => s.dance);

  const minMax = (feats) => [Math.min(...feats), Math.max(...feats)];

  return {
      rel: {
        bpm: [-50, 50],
        acous: [-50, 50],
        dance: [-50, 50]
      },
      abs: {
        bpm: minMax(bpms),
        acous: minMax(acouss).map(x => x * 100),
        dance: minMax(dances).map(x => x * 100)
      }
  }
};

export const relStep = (id) => ({
  isStep: true,
  isRel: true,
  id: "step-" + id,
  colour: colours[+id % colours.length],
  loops: 1,
  isMax: false,
  state: relStepState
});

export const absStep = (id) => ({
  isStep: true,
  isRel: false,
  id: "step-" + id,
  colour: colours[+id % colours.length],
  loops: 1,
  state: absStepState
});

export const stepOne = (id) => ({
  isStep: true,
  isRel: false,
  isRoot: true,
  id: "step-" + id,
  colour: colours[+id % colours.length],
  loops: 1,
  state: absStepState
});

export const group = (id) => ({
  isStep: false,
  id: "group-" + id,
  colour: colours[+id % colours.length],
  loops: 1,
  isMax: false,
  children: []
});

