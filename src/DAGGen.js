import DAG from './DAG'

const formatNodes = (nodes) => nodes.map(narr => narr.map(node => ({

  name: node.track.name,
  id: node.id + node.stepNum,
  trackid: node.track.id,
  imgurl: node.track.album.images[1].url,

  audio: node.audio,

  stepNum: node.stepNum,
  stepCol: node.stepCol,

  isUnion: false,
  isClicked: false,
  isHighlighted: false,
  highlightCol: "clear",

  attributes: {
    artist: node.track.artists[0].name,
    genre: node.track.fullArtist.genres[0],
    features: node.features
  }

})

))

/**
 * Sets up an initial DAG before traversing the recipe tree to compute
 * the final DAG.
 * @param {*} node 
 * @param {*} songs 
 * @returns 
 */
export const genDAG3 = (node, songs) => {

  // Remove first step from tree to be used to find initial nodes 
  const step1 = node.children[0];
  const tree = { ...node, children: node.children.slice(1) };

  // Set up initial DAG
  const initNodes = step1.find(songs)
    .map(song => ({ ...song, stepNum: 0, stepCol: step1.colour }));
  let dag = { nodes: [initNodes], links: [], unions: [] };

  // Expand initial step
  dag = { ...step1, loops: step1.loops - 1 }.apply(dag, songs)

  // Expand the rest of the children of the root once
  dag = { ...tree, loops: 1 }.apply(dag, songs);

  // Restore the initial step and generate the dag the remaining number of times
  // This works because 'dag' is now non-empty
  if (tree.loops > 1) {
    tree.children = [step1, ...tree.children];
    tree.loops -= 1;
    dag = tree.apply(dag, songs);
  }

  // Check for failed graph generation
  if (!dag) return null;

  const { nodes, links, unions } = dag;

  return new DAG(formatNodes(nodes), links, unions);

}
