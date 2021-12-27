import './App.css';
import React, { useState,useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.css'
import { Navbar, Nav, Button, Form, Container, Row, Col, Badge, Tooltip, OverlayTrigger } from 'react-bootstrap'
import logo from "./jotform-logo2.png";
import font from "./OpenSans-Light.ttf";
import fontBold from "./OpenSans-Bold.ttf";
import io from "socket.io-client";
import axios from 'axios';
import {
  Line,
  LineChart,
  XAxis,
  YAxis
} from 'recharts';
import { useCurrentPng } from 'recharts-to-png';
import FileSaver from 'file-saver';
import { Font, Image, PDFDownloadLink, Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';



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
 

  const [isloading, setisloading] = useState(false)
  const[times,set_times]=useState([0])

  function Send_Form() {
    const navigate = useNavigate();
    const [spawnrate, setspawnrate] = useState(0);
    const [subcount, setsubcount] = useState(0);
    const [formid, setformid] = useState(0);
    const [results,setresults]=useState(0);
    const [formhost, setformhost] = useState(0);

    const handleformid = (event) => {
      setformid(event.target.value)
    }

    const handlespawnchange = (event) => {
      setspawnrate(event.target.value)
    }
    const handlesubchange = (event) => {
      setsubcount(event.target.value)
    }
    const handleformhost = (event) => {
      setformhost(event.target.value)
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
    const renderTooltip = (props) => (
      <Tooltip id="button-tooltip" {...props}>
      The test is performed on the form you have specified, depending on the number of clients and duration.
      </Tooltip>
    );

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
        <Form.Group as= {Row}>
          <Form.Label column sm = "2" >Host</Form.Label>
          <Col sm="3">
          <Form.Control type="text"
            value={formhost}
            onChange={handleformhost} 
            />
          <Form.Text className = "text-muted">
           host bilgisi
            </Form.Text>
            </Col>
        </Form.Group>
        <OverlayTrigger
          placement="bottom"
          delay={{ show: 250, hide: 400 }}
          overlay={renderTooltip}
        >
          
        <Button variant="secondary" type="submit" >Run Test</Button>
        </OverlayTrigger>
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
    const [isdone, set_isdone] = useState(false)
    
    useEffect(() =>{
      socket.on("message", (msg) => {
        set_errors(msg["errors"])
        set_average(msg["average"])
        set_isdone(msg["done"])
        setData((currentData)=> [...currentData, msg]);
      });
    }, [isdone==true]);

    const [getPng, { ref: lineRef }] = useCurrentPng();
    async function insert_db(){
      const png = await getPng();
      console.log(png);
      // Verify that png is not undefined
      if (png) {
        // Download with FileSaver
        var data = { "graph": png, "average": average, "errors": errors }
        axios.post("/database", data)
      }
    }

    return (
      <div>
        <div className='line chart' >
        <h1>Response Time</h1>
        <LineChart width={700} height={300} data={data} ref={lineRef}>
          <XAxis dataKey="name"/>
          <YAxis/>
          <Line dataKey="value" />
        </LineChart>
        <br />
        <button onClick={insert_db}>
        <code>Insert into database</code>
      </button>
      </div>
        <h1>The Average is: {average.toFixed(2)}ms</h1> 
        <h1>Number of Errors: {errors}</h1> 
      </div>
    )
  }

  function ShowTest(){
    let { id } = useParams();
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
    Font.register({ family: 'OpenSans', src: font});
    Font.register({ family: 'OpenSansBold', src: fontBold});

    const styles = StyleSheet.create({
      page: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        paddingLeft: 30,
        paddingRight:40,
        width: 10
      },
      section: {
        margin: 10,
        padding: 10,
        flexGrow: 1,
        width: 10
      },
      text: {
        fontFamily: 'OpenSans',
        // borderBottom: "1px",
        padding: "7px", 
        fontSize: 11,
        paddingRight: "30px"
      },
      title:{
        fontSize: 15,
        textAlign: 'center',
        margin: 50,
        fontFamily: 'OpenSansBold'
      },
      imgBaslik: {
        FontFamily: 'OpenSansBold',
        fontSize: 11,
        paddingTop: 10
      },
      img: {
        // paddingLeft: 30,
        paddingRight:100,
        paddingTop: 20
      }
    });

    var rt = 0;
    var ec = 0;
    var td = 0;
    var iUrl = "";
    var fid, bUrl, count, rDuration = "";
    {apiData.map((test) => {
      const testId = test[0];
      const testImgUrl = test[1];
      const avgRespTime = test[2];
      const errorCount = test[3];
      const testDate = test[4];
      const formid = test[5];
      const baseUrl = test[6];
      const clientCount = test[7];
      const resultDuration = test[8];
      
      if(testId == id){
        rt = avgRespTime;
        ec = errorCount;
        td = testDate;
        iUrl = testImgUrl;
        fid = formid;
        bUrl = baseUrl;
        count = clientCount;
        rDuration = resultDuration;
      }
      
      return (
        <div class="list-group ">
          <p> {rt} </p>
          <p> {ec} </p>
          <p> {td} </p>
        </div>
      );
    })};

    //myDoc is the pdf component
    //grafik png dosyasi da burada eklenmeli
    const MyDoc = () => (
      <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
        <Text style={styles.title}>Test Report</Text>
        <Text style={styles.imgBaslik}>Test Runs Overview</Text>
          <Text style={styles.text}>Response Time: {rt}</Text>
          <Text style={styles.text}>Total Errors: {ec}</Text>
          <Text style={styles.text}>Test Date: {td}</Text>
          <Text style={styles.text}>Form: {fid}</Text>
          <Text style={styles.text}>Base URL: {bUrl}</Text>
          <Text style={styles.text}>Number of Clients: {count}</Text>
          <Text style={styles.text}>Test Duration: {rDuration} seconds</Text>
          <Text style={styles.imgBaslik}>Average Response Times</Text>
          <Image style={styles.img} src={iUrl} />
        </View>
        </Page>
      </Document>
    );


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

<PDFDownloadLink document={<MyDoc />} fileName="Test Report.pdf">
          {({ blob, url, loading, error }) => (loading ? 'Loading document...' : 'Download Summary Report')}
        </PDFDownloadLink>
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
