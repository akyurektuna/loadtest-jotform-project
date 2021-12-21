import './App.css';
import React, { Fragment, useState,useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.css'
import { Navbar, Nav, Button, Form, Container, Row, Col } from 'react-bootstrap'
import logo from "./jotform-logo2.png";
import io from "socket.io-client";
import {
  BarChart,
  Bar,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

let endPoint = "http://localhost:5000";
let socket = io.connect(`${endPoint}`);



const App = () => {
  //deneme
    useEffect(() => {
      const getAPI = () => {
          // Change this endpoint to whatever local or online address you have
          // Local PostgreSQL Database
          const API = 'http://127.0.0.1:5000/';

          fetch(API)
              .then((response) => {
                  console.log(response);
                  return response.json();
              })
              .then((data) => {
                  console.log(data);
                  setLoading(false);
                  setApiData(data);
              });
      };
      getAPI();
  }, []);
  const [apiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(true);
  //deneme

  const [isloading, setisloading] = useState(false)
  const[times,set_times]=useState([0])
  //request from frontend to backend

  // useEffect(() => {
  //   getresults();
  // }, [times.length]);

  // const getresults = () => {
  //   socket.on("message", msg => {
  //     set_times([...times, msg]);
  //   });
  // };
  
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
          <img src = {logo} /> {' '}
        </Navbar.Brand>
        <Nav>
        <Nav.Link href="\">New Test</Nav.Link>
          <Nav.Link href="ListTests">List Tests</Nav.Link>
        </Nav>
      </Navbar>

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Input />} />
          <Route path="/results" element={<Results />} />
          <Route path="/listTests" element= {<ListTests />}/>
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
    const [data, setData] = useState([]);
    const[average,set_average]=useState(0);
    const[errors,set_errors]=useState(0);
    
    useEffect(() =>{
      socket.on("message", (msg) => {
        set_errors(msg["errors"])
        set_average(msg["average"])
        setData((currentData)=> [...currentData, msg]);
      });
    }, []);

    return (
      <div>
        <h1>Response Time</h1>
        <LineChart width={500} height={300} data={data}>
          <XAxis dataKey="name"/>
          <YAxis/>
          <Line dataKey="value" />
        </LineChart>
        <h1>The Average is: {average.toFixed(2)}ms</h1> 
        <h1>Number of Errors: {errors}</h1> 

        
        
         {/* {times.length > 0 &&
        times.map(msg => (
          <div>
            <p>{msg}</p>
          </div>
        ))} */}
      </div>
    )
  }
  function ListTests() {
  //deneme
  useEffect(() => {
    const getAPI = () => {
        // Change this endpoint to whatever local or online address you have
        // Local PostgreSQL Database
        const API = 'http://127.0.0.1:5000/';

        fetch(API)
            .then((response) => {
                console.log(response);
                return response.json();
            })
            .then((data) => {
                console.log(data);
                setLoading(false);
                setApiData(data);
            });
    };
    getAPI();
}, []);
const [apiData, setApiData] = useState([]);
const [loading, setLoading] = useState(true);
//deneme

    return (
      <div>
      {/* listeleme kismi  */}
      
                {loading === true ? (
                    <div>
                        <h1>Loading...</h1>
                    </div>
                ) : (
                    <section>
                        {apiData.map((movie) => {
                            const testId = movie[0];
                            const testImgUrl = movie[1];
                            const avgRespTime = movie[2];
                            const errorCount = movie[3];
                            const testDate = movie[4];

                            return (
                                <div className="test-container" key={String(testId)}>

                                    <img src={testImgUrl}/>
                                    <p>
                                        <strong>resp time:</strong> {avgRespTime}
                                    </p>
                                    <p>
                                        <strong>error count:</strong> {errorCount}
                                    </p>
                                    <p>
                                        <strong>test date:</strong> {testDate}
                                    </p>
                                </div>
                            );
                        })}
                    </section>
                )}
            
            {/* listeleme kismi */}
      </div>
    )
  }



}

export default App;
