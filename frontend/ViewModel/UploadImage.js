const handleUpload = (e) => {
  e.preventDefault();
  let file = uploadInput.files[0];
  // split the filename to get the name and type
  let fileParts = uploadInput.files[0].name.split(".");
  let fileName = fileParts[0];
  let fileType = fileParts[1];
  let request_data = {
    fileName: fileName,
    fileType: fileType,
  };

  console.log("request_data", request_data);
  console.log("file", file);

  axios
    .post(`${REACT_APP_URL}Image/Upload`, request_data)
    .then((response) => {
      console.log("axios response:", response);
      var returnData = response.data;
      var signedRequest = returnData.signedRequest;
      var url = returnData.url;
      url_state = url;
      console.log("Recieved a signed request ", signedRequest);

  //     // Put the fileType in the headers for the upload
      var options = {
        headers: {
          "Content-Type": fileType,
        },
      };
      axios
        .put(signedRequest, file, options)
        .then((result) => {
          console.log(result)
          // console.log("Response from s3");
          // console.log("url:", url);
          // console.log("url_state:", url_state);
          image_array.push(url);
          setAvatar(url);
          updateUser(e, url);
          setEditMode(false);
          setChosenImage('Choose Image');
        })
        .catch((error) => {
          alert("ERROR " + JSON.stringify(error));
        });
    })
    .catch((error) => {
      console.log("error:", error);
      alert(JSON.stringify(error));
    });
}

export default handleUpload;