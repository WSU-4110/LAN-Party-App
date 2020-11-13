const updateUser = (e, url) => {
  e.preventDefault();

  const headers = {
    headers: {
      "Content-Type": "application/json"
    }
  };
  // PATCH URL
  const Link = `${REACT_APP_URL}Account/${user.ID}`;

  const payload = {
    Avatar: url
  }

  axios
    .patch(Link, payload, headers)
    .then((res) => {
      console.log("patch res: ", res);
      setAvatar(res.data.Avatar);
      setUser({
        ...res.data,
        Token: cookies.get("Token"),
        LoggedIn: true
      })
      cookies.set("Avatar", res.data.Avatar);
    })
    .catch((error) => console.log(error));
};

export default updateUser;