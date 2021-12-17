import './App.css';
import React, { useState,useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.css'
import { Navbar, Button, Form, Container, Row, Col } from 'react-bootstrap'
import logo from "./jotform-logo2.png";
import io from "socket.io-client";

let endPoint = "http://localhost:5000";
let socket = io.connect(`${endPoint}`);



const App = () => {
  const [isloading, setisloading] = useState(false)
  const[times,set_times]=useState([0])
  //request from frontend to backend

  useEffect(() => {
    getresults();
  }, [times.length]);

  const getresults = () => {
    socket.on("message", msg => {
      set_times([...times, msg]);
    });
  };
  
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
      socket.emit("message",body);
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
      <div>
         {times.length > 0 &&
        times.map(msg => (
          <div>
            <p>{msg}</p>
          </div>
        ))}
      </div>
    )
  }
}

export default App;
