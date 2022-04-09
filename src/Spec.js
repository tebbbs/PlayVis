/*
 * Created on Sat Apr 09 2022
 *
 * The MIT License (MIT)
 * Copyright (c) 2022 Joseph Tebbett, University of Birmingham
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software
 * and associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial
 * portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

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