import './App.css';
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.css'
import { Navbar, Button, Form, Container, Row, Col } from 'react-bootstrap'
import { logDOM } from '@testing-library/react';
import logo from "./jotform-logo2.png";

function App() {
  const [error,seterror]=useState(0)
  const [average, setaverage] = useState(0)
  const [isloading, setisloading] = useState(false)
  const [count, setcount] = useState(0);
  //request from frontend to backend
  function Send_Form() {
    const navigate = useNavigate();
    const [spawnrate, setspawnrate] = useState(0);
    const [subcount, setsubcount] = useState(0);
    const [formid, setformid] = useState(0)
    const [results,setresults]=useState(0)

    const handleformid = (event) => {
      setformid(event.target.value)
    }

    const handlespawnchange = (event) => {
      setspawnrate(event.target.value)
    }
    const handlesubchange = (event) => {
      setsubcount(event.target.value)
    }

    async function handleSubmit(e) {
      e.preventDefault();
      setisloading(true)
      var body = {
        subcount: subcount,
        spawnrate: spawnrate,
        formid: formid
      };
      await axios.post('/api/input', body)
        .then(function (response) {
          console.log(response);
          // Getting required data from the response.
          setresults(response.data["times"])
          setaverage(response.data["average"])
          seterror(response.data["error"])
          setcount(subcount)

        })
        .catch(function (error) {
          console.log(error);
        });
      navigate('/results')
    }

    return (
      <div class="centered">

      <Container>
        
      <Form onSubmit={handleSubmit}>
        <Form.Group as= {Row} >
          <Form.Label column sm="2" >Test Duration</Form.Label>
          <Col sm="3">
          <Form.Control type="number"
            value={spawnrate}
            onChange={handlespawnchange} 
            />
          <Form.Text className = "text-muted">
            ne kadar zaman
            </Form.Text>
            </Col>
        </Form.Group>

        <Form.Group as= {Row}>
          <Form.Label column sm = "2">Number of Clients</Form.Label>
          <Col sm="3">
          <Form.Control type="number"
            value={subcount}
            onChange={handlesubchange} 
            />
          <Form.Text className = "text-muted">
            kac user filan
            </Form.Text>
            </Col>
        </Form.Group>

        <Form.Group as= {Row}>
          <Form.Label column sm = "2" >Form ID</Form.Label>
          <Col sm="3">
          <Form.Control type="number"
            value={formid}
            onChange={handleformid} 
            />
          <Form.Text className = "text-muted">
           form idsi
            </Form.Text>
            </Col>
        </Form.Group>
        <Button variant="secondary" type="submit" >Run Test</Button>
        </Form>

      </Container>
      </div>
    );

  }

  return (
    <div>
      <Navbar bg="jotformBlue"> 
        <Navbar.Brand>
          <img src = {logo} />
        </Navbar.Brand>
      </Navbar>

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Input />} />
          <Route path="/results" element={<Results />} />
        </Routes>
      </BrowserRouter>
    </div>
  );

  // Input and Result Pages
  function Input() {
    return (
      <div className="App">
        <header className="App-header">
          {Send_Form()}
          {isloading ? "Loading..." : null}
        </header>
      </div>
    )
  }
  function Results() {
    return (
      <div className="results-header">
        Average response time: {average.toFixed(2)} / Errors: {error} / # Requests : {count}
        {setisloading(false)}
      </div>
    )
  }
}

export default App;
