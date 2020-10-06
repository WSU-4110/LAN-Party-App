import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import Navigation from './components/Navigation/Navigation';
import Home from './components/Home/Home';
import Signup from './components/Register/Signup';
import Login from './components/Register/Login';
import './App.css';

function App() {
  return (
    <Router>
      <Navigation />
      <div className="App">
        <Switch>

          {/* Home is default */}
          <Route path="/" exact component={Home} />
          <Route path="/signup" exact component={Signup} />
          <Route path="/login" exact component={Login} />

        </Switch>
      </div>
    </Router>
  );
}

export default App;