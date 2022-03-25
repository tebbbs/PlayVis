// HTML Number Input field with validation for values entered by keyboard

const IntInput = (props) => {

  const { value, min, max } = props;
  const { setValue, ...htmlProps } = props;

  const checkInput = (prev, input) => [
    Number.isInteger(input),
    input > 0,
    min <= input,
    input <= max
  ].every(e => e) ? input : prev;

  return <input type="number" className="valInput" 
    onChange={e => setValue(checkInput(value, +e.target.value)) } 
    onKeyDown={e => { if (e.key ==='.') e.preventDefault() }}
   {...htmlProps}/>

}

export default IntInput;