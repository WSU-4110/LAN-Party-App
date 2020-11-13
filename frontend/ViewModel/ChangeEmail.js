const changeEmail = (data, e) => {
  e.preventDefault();

  // make sure email is not the current one
  if (data.email.toLowerCase() === user.Email.toLowerCase()) {
    alert("New email must be different");
    console.log("New and old email can't be the same");
    setEditEmail(false);
    return;
  }

  const headers = {
    headers: {
      "Content-Type": "application/json"
    }
  };
  // PATCH URL
  const Link = `${REACT_APP_URL}Account/${user.ID}`;
  const payload = {
    NewEmail: data.email
  }

  console.log("email payload", data.email);
  axios
    .patch(Link, payload, headers)
    .then((res) => {
      console.log("patch res: ", res);
      setUser({
        ...res.data,
        Token: cookies.get("Token"),
        LoggedIn: true
      })
      cookies.set("Avatar", res.data.Avatar);
    })
    .catch((error) => console.log(error));

  setEditEmail(false);
}

export default changeEmail;