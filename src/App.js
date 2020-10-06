import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import Navigation from './components/Navigation/Navigation';
import Home from './components/Home/Home';
import './App.css';

function App() {
  return (
    <Router>
      <Navigation />
      <div className="App">
        <Switch>

          {/* Home is default */}
          <Route path="/" exact component={Home} />

        </Switch>
      </div>
    </Router>
  );
}

export default App;