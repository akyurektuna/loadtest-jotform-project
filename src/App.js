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
        window.location.href='/ListTests'
      }
      
    }
    const rightDiv = {
      paddingTop: "160px",
    }
 
    const leftDiv = {
      paddingTop: "100px",
      paddingRight:"20px"
    }

    const textStyling= {
      fontFamily: "Open Sans",
      fontSize: "20px",
      fontWeight:"bold",
      paddingBottom:"20px"
    }
    
    const textStylingNormal={
      fontFamily: "Open Sans",
      fontSize: "20px",
    }

    return (
      
      <div class="d-flex justify-content-center">
        <div className='line chart' style={leftDiv} >
        <Text style={textStyling}>Response Time</Text>
        <Container fluid>
        <LineChart width={700} height={300} data={data} ref={lineRef} >
          <XAxis dataKey="name"/>
          <YAxis type="number" domain={[0, 3000]} allowDataOverflow={true}/>
          <Line dataKey="value" />
        </LineChart>
        </Container>
        <br />
      </div>
      
      <div class="d-flex flex-column" style={rightDiv}  >
        <div class="p-2">
        <Text style={textStyling}>Average Response Time: </Text> <Text style={textStylingNormal}>{average.toFixed(2)}ms</Text>
        </div> 
        <div class="p-2">
        <Text style={textStyling}>Error Count:</Text> <Text style={textStylingNormal}> {errors}</Text> 
        </div>
        <div class="mb-auto p-2">
        {isdone && <Button variant='secondary' onClick={insert_db}> <Text style={textStylingNormal}>{' '} Save Test Results {' '} </Text> </Button>}
        </div>
        </div>
      </div>
      
    )
  }

  function ShowTest() {
    let { id } = useParams();
    const [apiData, setApiData] = useState([]);
    const [loading, setLoading] = useState(true);
    Font.register({ family: 'OpenSans', src: font});
    Font.register({ family: 'OpenSansBold', src: fontBold});


    //deneme
    useEffect(() => {
      const getTest = () => {
        // Change this endpoint to whatever local or online address you have
        // Local PostgreSQL Database
        const API = 'http://127.0.0.1:5000/' + id;

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
      getTest();
    }, []);
    const testId = apiData[0];
    const testImgUrl = apiData[1];
    const avgRespTime = apiData[2];
    const errorCount = apiData[3];
    const testDate = apiData[4];
    const formid = apiData[5];
    const baseUrl = apiData[6];
    const clientCount = apiData[7];
    const resultDuration = apiData[8];

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


    //myDoc is the pdf component
    //grafik png dosyasi da burada eklenmeli
    const MyDoc = () => (
      <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
        <Text style={styles.title}>Test Report</Text>
        <Text style={styles.imgBaslik}>Test Runs Overview</Text>
          <Text style={styles.text}>Response Time: {avgRespTime}ms</Text>
          <Text style={styles.text}>Total Errors: {errorCount}</Text>
          <Text style={styles.text}>Test Date: {testDate}</Text>
          <Text style={styles.text}>Form: {formid}</Text>
          <Text style={styles.text}>Base URL: {baseUrl}</Text>
          <Text style={styles.text}>Number of Clients: {clientCount}</Text>
          <Text style={styles.text}>Test Duration: {resultDuration} seconds</Text>
          <Text style={styles.imgBaslik}>Average Response Times</Text>
          <Image style={styles.img} src={testImgUrl} />
        </View>
        </Page>
      </Document>
    );

    const rightDiv = {
      paddingTop: "160px",
    }
 
    const leftDiv = {
      paddingTop: "100px",
      paddingRight:"20px"
    }

    const textStyling= {
      fontFamily: "Open Sans",
      fontSize: "20px",
      fontWeight:"bold",
      paddingBottom:"20px"
    }
    
    const textStylingNormal={
      fontFamily: "Open Sans",
      fontSize: "20px",
    }
    const deneme={
      paddingBottom: "30px"
    }

    return (
      <div >
        {loading === true ? (
          <div> <h1>Loading...</h1> </div>
        ) : (
          <div class= "d-flex justify-content-center">
            <div class="d-flex flex-column"  style={leftDiv}>
            <div class="top-left" style={deneme}><Text style={textStyling}>Response Times </Text> </div>
              <img width={700} height={300} src={testImgUrl} />
              
            </div>
            <div class="d-flex flex-column" style={rightDiv}> 
              <div class="p-2">
                <Text style={textStyling}>Average Response Time: </Text> <Text style={textStylingNormal}>{avgRespTime}ms</Text>
               </div> 
               <div class="p-2">
                <Text style={textStyling}>Error count: </Text> <Text style={textStylingNormal}>{errorCount}</Text>
               </div> 
               <div class="p-2">
                <Text style={textStyling}>Date: </Text> <Text style={textStylingNormal}>{testDate}</Text>
               </div>
               <div>
                <PDFDownloadLink document={<MyDoc />} fileName="Test Report.pdf">
                  {({ blob, url, loading, error }) => (loading ? 'Loading document...' : <Text style={textStylingNormal}> Download Summary Report</Text>)}
                 </PDFDownloadLink>
                </div> 
            </div>
          </div>
        )
        }

      </div>
    )
  }


  function ListTests() {
    //deneme
    useEffect(() => {
      const getAPI = () => {
        // Change this endpoint to whatever local or online address you have
        // Local PostgreSQL Database
        const API = 'http://127.0.0.1:5000/list';

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
