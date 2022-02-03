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

export const ranges =
{
  rel: {
    bpm: [-50, 50],
    acous: [-50, 50],
    dance: [-50, 50]
  },
  abs: {
    bpm: [0, 200],
    acous: [0, 100],
    dance: [0, 100]
  }
}

export const relStep = (id) => ({
  isStep: true,
  isRel: true,
  id: "step-" + id,
  colour: colours[+id % colours.length],
  loops: 1,
  state: relStepState
});

export const absStep = (id) => ({
  isStep: true,
  isRel: false,
  id: "step-" + id,
  colour: colours[+id % colours.length],
  loops: 1,
  state: absStepState
})

export const group = (id) => ({
  isStep: false,
  id: "group-" + id,
  colour: colours[+id % colours.length],
  loops: 1,
  children: []
});

