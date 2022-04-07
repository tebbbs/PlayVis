import { createContext } from "react";
import { Group, AbsStep, RelStep } from "./Tree.js";
import _uniqueId from 'lodash/uniqueId';

export const defaultTree = {
  ...Group(_uniqueId()),
  isRoot: true,
  loops: 2,
  canMax() { return false },
  children: [
    { ...AbsStep(_uniqueId()), isRoot: true },
    RelStep(_uniqueId()),
    RelStep(_uniqueId()),
  ]
};

export const SongContext = createContext();

export const Spec = ({ tree, setTree, songs }) => {

  // returns a copy of the tree 'node', where the node with id === newNode.id has been updated
  const updateNode = (node, newNode) => {
    if (node.id === newNode.id)
      // found node to update, replace with new value
      return newNode;
    else
      return "children" in node
        // node is group, recurse
        ? { ...node, children: node.children.map(child => updateNode(child, newNode)) }
        // node is step, return unchanged
        : node
  }

  // updates a node in the tree state by calling updateNode then setTree
  const setNode = newNode => setTree(prevTree => updateNode(prevTree, newNode));

  return (
    <SongContext.Provider value={songs}>
      {/* tree.view() returns a JSX component representing the tree */}
      {tree.view(
        // function to call to update tree state
        setNode,
        // function to call when 'x' is clicked
        () => setTree(defaultTree)
      )
      }
    </SongContext.Provider>
  )
}