import { RecipeSummary } from "./RecipeDBView"
import { useEffect, useState } from "react";


export const RecipeList = () => {

  const [allRecipes, setAllRecipes] = useState([]);
  const [recipes, setRecipes] = useState([]);

  const addRecipe = (recipe) => {
    setRecipes(recipes => recipes.concat({...recipe, loops: 1 }));
  }

  useEffect(() => {
    fetch("http://localhost:8000/recipes")
      .then(res => res.json())
      .then(recipes => {
        setAllRecipes(recipes);
      })
    }, []);

  const setLoop = (id, val) => {
    setRecipes(recipes =>
      recipes.map(r => r.id === id ? { ...r, loops: val } : r));
  }

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {allRecipes.map((rec) => <RecipeFromDBView key={rec.id} recipe={rec} addRecipe={addRecipe} />)}
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {recipes.map((rec, i) => <RecipeAsStepView key={rec.id + "," + i} recipe={rec} setLoop={(v) => setLoop(rec.id, v)} />)}
      </div>
    </div>
  )
}

const RecipeFromDBView = ({ recipe, addRecipe }) => {
  return (
    <div style={{ display: "flex", flexDirection: "row " }}>
      <RecipeSummary recipe={recipe} />
      <button type="button" onClick={_ => addRecipe(recipe)}>+</button>
    </div>
  )
}

const RecipeAsStepView = ({ recipe, setLoop }) => {
  const { loops } = recipe;

  return (
    <div style={{ display: "flex", flexDirection: "row " }}>
      <RecipeSummary recipe={recipe} />
      Loops:
      <input type="number" className="valInput" value={loops} min={1} onChange={e => setLoop(e.target.value)} />
      
    </div>
  )

}