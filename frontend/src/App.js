import React, { useEffect, useContext } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Navigation from './components/Navigation/Navigation';
import Home from './components/Home/Home';
import Signup from './components/Register/Signup';
import Login from './components/Register/Login';
import User from './components/User/User';
import Host from './components/HostParty/HostParty'
import ViewParty from './components/ViewParty/ViewParty';
import PartySearch from './components/PartySearch/PartySearch';
import SearchUser from './components/SearchUser/SearchUser';
import cookies from 'js-cookie';
import { UserContext } from './context/UserContext';
import crypto from 'crypto-js'
import './App.css';
import axios from 'axios';

function App() {
  const { REACT_APP_SECRET_KEY, REACT_APP_URL } = process.env;
  const [user, setUser] = useContext(UserContext);

  const getAccountInfo = () => {
    const headers = {
      headers: {
        "Content-Type": "application/json"
      }
    }

    let id = crypto.AES.decrypt(cookies.get("Token"), REACT_APP_SECRET_KEY);
    let original = id.toString(crypto.enc.Utf8);
    const link = `${REACT_APP_URL}Account/${original}`;
  
    axios
      .get(link, headers)
      .then((res) => {
        // console.log("account info", res.data)
        setUser({
          ...res.data.Account,
          Token: cookies.get("Token"),
          LoggedIn: true
        })
      })
      .catch((error) => console.log(error))
  }
  
  useEffect(()=>{
    if (cookies.get("Token"))
      getAccountInfo();
  } , [])
  
  return (
    <Router>
      <Navigation user={user}/>
      <div 
        className="App">
        <Switch>

          {/* Home is default */}
          <Route path="/" exact component={Home} />
          <Route path="/signup" exact component={Signup} />
          <Route path="/login" exact component={Login} />
          <Route path="/user" exact component={User} />
          <Route path="/host" exact component={Host} />
          <Route path="/viewParty" exact component={ViewParty} />
          <Route path="/PartySearch" exact component={PartySearch} />
          <Route path="/SearchUser" exact component={SearchUser} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;