const changePassword = (data, e) => {
  e.preventDefault();

  // new email cannot be same as current
  if (data.oldpassword === data.newpassword) {
    console.log("passwords cannot be the same");
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
    NewPassword: data.newpassword
  }

  console.log("password payload", payload);
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

  setEditPassword(false);
}

export default changePassword;