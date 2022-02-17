import Node from "./Node";

const OrGroup = (id) => ({
  ...Node("orGroup", id),
  children: [],

  apply() {

  }
});

export default OrGroup;