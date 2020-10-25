import React, { useEffect, useContext } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Navigation from './components/Navigation/Navigation';
import Home from './components/Home/Home';
import Signup from './components/Register/Signup';
import Login from './components/Register/Login';
import User from './components/User/User';
import Host from './components/HostParty/HostParty'
import ViewParty from './components/ViewParty/ViewParty';
import cookies from 'js-cookie';
import { UserContext } from './UserContext';
import './App.css';

function App() {
  const [user, setUser] = useContext(UserContext);
  // set user
  const updateUser = () => {
    if(cookies.get("Logged") === "true") {
      setUser({
        ...user,
        Username: cookies.get("Username"),
        Email: cookies.get("Email"),
        ID: cookies.get("ID"),
        LoggedIn: true
      })
    }
  }
  useEffect(()=>{
    updateUser();
  } , [])
  return (
    <Router>
      <Navigation user={user}/>
      <div 
        className="App" 
        style={{
          minHeight: "calc(100vh - 56px)", 
          backgroundColor: "#2e3136"
        }}>
        <Switch>

          {/* Home is default */}
          <Route path="/" exact component={Home} />
          <Route path="/signup" exact component={Signup} />
          <Route path="/login" exact component={Login} />
          <Route path="/user" exact component={User} />
          <Route path="/host" exact component={Host} />
          <Route path="/viewParty" exact component={ViewParty} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;