import { useState } from 'react';

const RecipeSaveButton = ({ name, id, steps }) => {
  const [text, setText] = useState(name ? name : "");
  const [placeholder, setPlaceholder] = useState(name ? name : "Recipe name");

  const showMsg = (msg) => {
    setText("");
    setPlaceholder(msg);
  }

  const handleSaveAs = () => {
    if (text === "") {
      setPlaceholder("Name required");
      return;
    }
    fetch("http://localhost:8000/recipes")
      .then(res => res.json())
      .then((recipes) => {
        if (recipes.map(r => r.name).includes(text)) 
          throw new Error("name in use");
      }).then(() => {
        fetch("http://localhost:8000/recipes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: text, steps })
        })
      }).then(() =>
        showMsg(`'${text}' saved`)
      )
      .catch(err => {
        showMsg(text + " in use");
      });
  }

  // BUG: Allows for saving with the same name as another recipe
  const handleSave = () => {
    fetch(`http://localhost:8000/recipes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: text, steps })
    }).then(res => {
      if (res.status !== 200) {
        throw new Error("resource not present");
      }

    }).then(() => 
      showMsg(`'${text}'' updated`))
    .catch(err => {
      showMsg("'Save as' first");
  });
  }

  return (
    <>
      <input type="text" placeholder={placeholder} className="recNameInput" value={text} onChange={e => setText(e.target.value)} />
      <button type="button" onClick={handleSave}>Save</button>
      <button type="button" onClick={handleSaveAs}>Save as</button>
    </>
  )

}

// Just to keeep compiler quiet
function rsb() {
  return (
    <RecipeSaveButton name="placeholder" id={99} steps={[]}/>
  )
}
rsb()