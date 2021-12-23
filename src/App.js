import './App.css';
import React, { useState,useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.css'
import { Navbar, Nav, Button, Form, Container, Row, Col, Badge } from 'react-bootstrap'
import logo from "./jotform-logo2.png";
import io from "socket.io-client";
import {
  Line,
  LineChart,
  XAxis,
  YAxis
} from 'recharts';
import { useCurrentPng } from 'recharts-to-png';
import FileSaver from 'file-saver';

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

  //PNG INDIRME ->
  // useCurrentPng usage (isLoading is optional)
  const [getPng, { ref: lineRef }] = useCurrentPng();
  const handleDownload = useCallback(async () => {
    const png = await getPng();
    console.log(png);
    // Verify that png is not undefined
    if (png) {
      // Download with FileSaver
      FileSaver.saveAs(png, 'myChart.png');
    }
  }, [getPng]);

  const [isloading, setisloading] = useState(false)
  const[times,set_times]=useState([0])

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
          <Route path="/:id" element= {<ShowTest />}/>
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
        <div className='line chart' >
        <h1>Response Time</h1>
        <LineChart width={500} height={300} data={data} ref={lineRef}>
          <XAxis dataKey="name"/>
          <YAxis/>
          <Line dataKey="value" />
        </LineChart>
        <br />
        <button onClick={handleDownload}>
        <code>Download line chart</code>
      </button>
      </div>
        <h1>The Average is: {average.toFixed(2)}ms</h1> 
        <h1>Number of Errors: {errors}</h1> 
      </div>
    )
  }

  function ShowTest(){
    let { id } = useParams();
    //const param = 1
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
        {loading === true ? (
          <div> <h1>Loading...</h1> </div>
          ) : (
            <section>
              {apiData.map((test) => {
                const testId = test[0];
                const testImgUrl = test[1];
                const avgRespTime = test[2];
                const errorCount = test[3];
                const testDate = test[4];
                if(testId == id){
                  return (
                    <div>
                      <img src={testImgUrl}/>
                        <p> <strong>resp time:</strong> {avgRespTime} </p>
                        <p> <strong>error count:</strong> {errorCount} </p>
                        <p> <strong>test date:</strong> {testDate} </p>
                    </div>
                  );
                }

              })}
            </section>
          )}
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
        {loading === true ? (
          <div> <h1>Loading...</h1> </div>
          ) : (
            <section>
              {apiData.map((test) => {
                const testId = test[0];
                const testImgUrl = test[1];
                const avgRespTime = test[2];
                const errorCount = test[3];
                const testDate = test[4];

                return (
                  <div class="list-group ">
                    <a href={`${testId}`} class="list-group-item list-group-item-action" > Test {testId} 
                      {' '}<Badge bg="secondary">finished</Badge>
                    </a>
                  </div>
                );
              })}
            </section>
          )}
      </div>
    )
  }
}

export default App;
