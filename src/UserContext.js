import React, { useState, createContext } from 'react';

export const UserContext = createContext();

export const UserInfoProvider = (props) => {
  const [user, setUser] = useState({
    LoggedIn: false,
    Username: '',
    Email: '',
    Password: '',
    Token: '',
    ID: ''
  });

  return(
    <UserContext.Provider value={[user, setUser]}>
      {props.children}
    </UserContext.Provider>
  )
}