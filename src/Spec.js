import { createContext } from "react";
import { Group, AbsStep, RelStep } from "./Tree.js";
import _uniqueId from 'lodash/uniqueId';

export const defaultTree = {
  ...Group(_uniqueId()),
  isRoot: true,
  children: [
    { ...AbsStep(_uniqueId()), isRoot: true },
    RelStep(_uniqueId()),
    RelStep(_uniqueId())
  ]
};

export const SongContext = createContext();

export const Spec = ({ tree, setTree, songs }) => {

  const tUpdate = (node, newnode) => {
    if (node.id === newnode.id) return newnode;
    return ["Relative", "Absolute"].includes(node.type) || !node.children.length ?
      node
      : { ...node, children: node.children.map(child => tUpdate(child, newnode)) };
  }

  return (
    <SongContext.Provider value={songs}>
      {tree.view(
         newNode => setTree(prev => tUpdate(prev, newNode)),
        () => setTree(defaultTree))
      }
    </SongContext.Provider>
  )
}