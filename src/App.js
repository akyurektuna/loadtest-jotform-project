import './App.css';
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import axios from 'axios';
function App() {
  const [results, setresults] = useState("");
  //request from frontend to backend
  function Send_Form() {
    const navigate = useNavigate();
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
        subcount: subcount,
        spawnrate: spawnrate

      };
      axios.post('/api/input', body)
        .then(function (response) {
          console.log(response);
          setresults(response.data["times"])
        })
        .catch(function (error) {
          console.log(error);
        });
      navigate('/results')
    }

    return (
      <form onSubmit={handleSubmit}>
        Spawn rate: <input type="number" value={spawnrate} onChange={handlespawnchange} />
        <br />
        Submisson count: <input type="number" value={subcount} onChange={handlesubchange} />
        <p> <input type="submit" value="Submit" /></p>
      </form>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/results" element={<Results />} />
          </Routes>
        </BrowserRouter>
      </header>
    </div>
  );
  function Home() {
    return (
      <div className="App">
        <header className="App-header">
          {Send_Form()}
        </header>
      </div>
    )
  }
  function Results() {
    return (
      <div className="App">
        <header className="App-header">
          The results are:
          <br />
          {results}
        </header>
      </div>
    )
  }
}

export default App;
