import Node from "./Node";
import { cloneDeep } from "lodash";

const Step = (type, id) => ({
  ...Node(type, id),

  applyCommon(dag, songs) {
    if (!dag) return null;
    let { nodes, links, unions } = cloneDeep(dag);
    const stepNum = nodes.length;
    const frontier = nodes[stepNum - 1];
    const result = this.expand(songs, frontier, stepNum);
    if (result.frontier.length === 0) return null;

    links.push(result.links);
    nodes.push(result.frontier);
    if (result.union) unions.push(result.union);

    return { nodes, links, unions };

  },

  expand() {
    throw new Error("expand() not overwritten");
  },

  find() {
    throw new Error("find() not overwritten");
  },


});

export default Step;