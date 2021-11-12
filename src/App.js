import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
function App() {
  const [currentTime, setCurrentTime] = useState(0);

  //request from frontend to backend
  useEffect(() => {
    fetch('/api/time').then(res => res.json()).then(data => {
      setCurrentTime(data.time);
    });
  }, []);
  return (
    <div className="App">
      <header className="App-header">
        <BrowserRouter>
          <p> <Link className="App-link" to="/"> Input </Link> | <Link className="App-link" to="/results"> Results </Link></p>
          <Switch>
            <Route exact path="/">
              <br />
              <form action="/api/input" method="post">
                <p>Submission count: <input type="number" name="count" /></p>
                <p>Spawn rate: <input type="number" name="spawn" /></p>
                <p> <input type="submit" value="Submit" /></p>
              </form>
              <img src={logo} className="App-logo" alt="logo" />
              <p>
                Edit <code>src/App.js</code> and save to reload.
              </p>
              <a
                className="App-link"
                href="https://reactjs.org"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn React
              </a>
              <p> The current time is {currentTime}. </p>
            
            </Route>
            <Route path="/results">
              <h1>Results will be displayed here</h1>
            </Route>
          </Switch>
        </BrowserRouter>
      </header>
    </div>
  );
}

export default App;
