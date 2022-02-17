import Node from "./Node";

const AndGroup = (id) => ({
  ...Node("andGroup", id),
  children: [],

  apply(dag, songs) {
    return this.isMax ?
      this.applyMax(dag, songs)
      : this.applyLoop(dag, songs);
  },

  applyMax(dag, songs) {
    let nextDag = dag;
    let hasResult = true;
    while (hasResult) {
      // Loop over children, see if they can be applied
      for (let i = 0; i < this.children.length; i++) {
        nextDag = this.children[i].apply(nextDag, songs);
        if (!nextDag) {
          hasResult = false;
          break;
        }
      }
      // If all children can be expanded, update retDag
      if (hasResult) dag = nextDag;
    }
    return dag;
  },

  applyLoop(dag, songs) {
    for (let i = 0; i < this.loops; i++)
      for (let j = 0; j < this.children.length; j++)
        dag = this.children[j].apply(dag, songs);
    return dag;
  }

});

export default AndGroup;