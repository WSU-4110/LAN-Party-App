import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Navigation from './components/Navigation/Navigation';
import Home from './components/Home/Home';
import Signup from './components/Register/Signup';
import Login from './components/Register/Login';
import User from './components/User/User';
import Host from './components/HostParty/HostParty'
import './App.css';

function App() {
  return (
    <Router>
      <Navigation />
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
        </Switch>
      </div>
    </Router>
  );
}

export default App;