// Essentially a module for non-UI code

const formatTree = ({ val, children }) => (
  {
    name: val.track.name,
    attributes: { 
      artist: val.track.artists[0].name,
      linkColor: val.stepid,//colours[val.stepid % colours.length]
      bpm: val.bpm,
      acous: val.acous,
      dance: val.dance
    },
    children: children.map(formatTree)
  }
)

export const genPL = (songs, features, recipeSteps) => {
  // expand recipe out such that a step applied for n songs becomes n steps
  const oneSteps = recipeSteps.flatMap(step => {
    const { id, state } = step
    const { bpm, acous, dance, nSongs } = state;
    return Array(nSongs).fill(({ id, params: { bpm, acous, dance } }))
  });

  const fsongs = songs.map((song, i) =>
  ({
    track: song.track,
    bpm: features[i].tempo,
    acous: features[i].acousticness,
    dance: features[i].danceability
  }));

  // Will allow this to be selected later
  const seed = fsongs[0];

  // track already chosen track ids
  let played = [seed.track.id];

  const genChildren = (parent, step, n) => {
    let children = [];
    const { bpm, acous, dance } = step.params;

    for (let i = 0; i < fsongs.length && children.length < n; i++) {
      
      const cand = fsongs[i];
      const bpmdiff = 100 * (cand.bpm - parent.bpm) / parent.bpm;
      const acousdif = 100 * (cand.acous - parent.acous) / parent.acous;
      const dancedif = 100 * (cand.dance - parent.dance) / parent.dance;

      if ( (!bpm.checked   || (bpm.min   <= bpmdiff  && bpmdiff  <= bpm.max  ))
        && (!acous.checked || (acous.min <= acousdif && acousdif <= acous.max))
        && (!dance.checked || (dance.min <= dancedif && dancedif <= dance.max))
        // will need a better check to impose min length on cycles
        //&& cand.track.id !== parent.track.id) {
        && !played.includes(cand.track.id)) {
          children.push({ ...cand, stepid: step.id });
          played.push(cand.track.id);
      }
    }
    return children;
  }

  const treeGen = (val, f, depth) => (
    { val: val,
      children: f(val, depth).map(child => treeGen(child, f, depth - 1))});

  const maxDepth = oneSteps.length;
  const childNum = 2;

  return formatTree(treeGen(
    seed,
    ((song, d) => d === 0 ? [] : genChildren(song, oneSteps[maxDepth - d], childNum)),
    maxDepth
  ));
}