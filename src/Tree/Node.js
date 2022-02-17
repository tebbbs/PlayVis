const colours = ["#173F5F", "#20639B", "#3CAEA3", "#F6D55C", "#ED553B"];

const Node = (type, id) => ({
  type,
  id: `${type}-${id}`,
  loops: 1,
  colour: colours[+id % colours.length],
  isMax: false,
  apply() {
    throw new Error("apply() not overwritten");
  }
});

export default Node;