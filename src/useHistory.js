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

import { useReducer } from 'react';

export const useHistory = (initialState) => {

  const [state, dispatch] = useReducer(
    (state, updateFn) => ({ ...state, ...updateFn(state) }),
    { history: [initialState], index: 0 }
  );

  const setState = action => {
    dispatch(({ history, index }) => {
      const prevState = history[index];
      const newState = typeof action === "function" ? action(prevState) : action;
      if (JSON.stringify(prevState) !== JSON.stringify(newState)) {
        const newHist = history.slice(0, index + 1);
        return {
          history: [...newHist, newState],
          index: index + 1
        };
      }
      else return { history, index };
    });
  };

  const undo = () => state.index > 0 && dispatch(prev => ({ index: prev.index - 1 }));
  const redo = () => state.index < state.history.length - 1 && dispatch(prev => ({ index: prev.index + 1 }));
  const reset = (initialState) => dispatch(_ => ({ history: initialState ? [initialState] : [], index: 0 }));

  return [state.history[state.index], setState, undo, redo, reset];
  
}
