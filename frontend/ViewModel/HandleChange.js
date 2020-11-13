const handleChange = (ev, uploadInput, urlState) => {
  let filename = ev.target.value.split( '\\' ).pop();
  setChosenImage(filename);
};

export default handleChange;