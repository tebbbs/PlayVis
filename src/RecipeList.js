import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './index.css'

export const RecipeList = ({ setSteps }) => {

  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/recipes')
      .then(res => res.json())
      .then((recipes) => {
        setRecipes(recipes)
      })
  }, []);

  return (
    <div className="maindiv">
      {recipes.map((recipe => <RecipeInfo recipe={recipe} key={recipe.id} setSteps={setSteps} />))}
    </div>
  )
}


const StepsSummary = ({ steps }) => {
  return (
    <>
      <table>
        <thead>
          <tr>
            <th>BPM</th>
            <th>Danceability</th>
            <th>Acousticness</th>
            <th>#</th>
          </tr>
        </thead>
        <tbody>
          {steps.map((step, i) => {
            const { bpm, acous, dance, nSongs } = step.state;
            return (
              <tr key={i}>
                <td>
                  {bpm.checked && <span>[{bpm.min}, +{bpm.max}]</span>}
                  {!bpm.checked && <span>any</span>}
                </td>
                <td>{
                  acous.checked && <span>[{acous.min}, +{acous.max}]</span>}
                  {!acous.checked && <span>any</span>}
                </td>
                <td>{dance.checked && <span>[{dance.min}, +{dance.max}]</span>}
                  {!dance.checked && <span>any</span>}
                </td>
                <td>
                  {nSongs}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  );
}

const RecipeInfo = ({ recipe, setSteps }) => {

  const navigate = useNavigate();

  const { name, steps, id } = recipe

  const handleOpen = () => {
    setSteps(steps);
    navigate("/")
  }

  const handleDelete = () => {
    fetch(`http://localhost:8000/recipes/${id}`, {
        method: "DELETE",
      }).then(() => {
        navigate("/")
      })

  }


  return (
    <div style={{ display: "flex", direction: "row ", justifyContent: "space-between" }}>
      <h4>{name}</h4>
      <StepsSummary steps={steps} />
      <div>
        <button type="button" onClick={handleOpen}>Open</button>
        <button type="button" onClick={handleDelete}>Delete</button>
      </div>
    </div>
  )

}