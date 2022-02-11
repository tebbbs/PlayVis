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
