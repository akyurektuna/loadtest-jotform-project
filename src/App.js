import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import axios from 'axios';
function App() {
  const [results, setresults] = useState(0);
 

  //request from frontend to backend

  function Send_Form
  () {
    const [spawnrate, setspawnrate] = useState(0);
    const [subcount, setsubcount] = useState(0);

    const handlespawnchange = (event) => {
      setspawnrate(event.target.value)
    }
    const handlesubchange = (event) => {
      setsubcount(event.target.value)
    }

    function handleSubmit(e) {    
      e.preventDefault();
      var body = {
       subcount:subcount,
       spawnrate:spawnrate

    };
    axios.post('/api/input', body)
      .then(function (response) {
        console.log(response); 
        setresults(response.data["subcount"])
      })
      .catch(function (error) {
        console.log(error);
      });
     
    }
  
    return (
      <form onSubmit={handleSubmit}>
      Spawn rate: <input type="number" value={spawnrate} onChange={handlespawnchange} />
      <br/>
      Submisson count: <input type="number" value={subcount} onChange={handlesubchange} />
      <p> <input type="submit" value="Submit" /></p>
    </form>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <BrowserRouter>
          <Switch>
            <Route exact path="/">
              <br />
              {Send_Form()}    
              <p> The spawn rate retrived from API is: {results}. </p>
            
            </Route>
            <Route path="/results">
              <h1>Results will be displayed here</h1>
              <p>{results}</p>
            </Route>
          </Switch>
        </BrowserRouter>
      </header>
    </div>
  );
}

export default App;
