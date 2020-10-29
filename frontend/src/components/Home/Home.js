import React, { useState, useEffect, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import MapComponent from '../GoogleMap/GoogleMap';
import cookies from 'js-cookie';
import {Button, Accordion, Card} from 'react-bootstrap';
import { UserContext } from '../../UserContext'
import ViewParty from '../ViewParty/ViewParty';
import axios from 'axios';



const Home = (props) => {
  const { REACT_APP_URL } = process.env;
  const [user, setUser] = useContext(UserContext);
  const [parties, setParties] = useState([]);
  const toHostParty = () => {
    props.history.push("/host");
  }

  const toLogin = () => {
    props.history.push("/login");
  }

  const toViewParty = () => {
    props.history.push("/ViewParty");
  }

  const getParties = () => {
    const link = `${REACT_APP_URL}Parties`;
    axios
      .get(link)
      .then((res) => {
        console.log("parties", res);
        setParties(res.data.Parties);
      })
      .catch((error) => console.log(error))
  }
  useEffect(()=>{
    getParties();
  } , [])


  
  return(
    <div>
      <MapComponent />
      {user.LoggedIn===true 
      ?
        <div
          style={{
            padding: "15px",
            textAlign: "center"
          }}>
          <Button variant="info" size="lg" onClick={toHostParty}>Host A Party</Button>
        </div>
      :
        <div
        style={{
          padding: "15px",
          textAlign: "center"
        }}>
        <Button variant="info" size="lg" onClick={toLogin}>Host A Party</Button>
      </div>
      }
      <Accordion>
        {parties.map((p, i) => (
          <Card>
            <Accordion.Toggle 
            style={{
              padding: "10px 10px 5px",
              borderBottom:"2px solid #0C0C0D",
              backgroundColor: "#35373D"
            }} 
            as={Card.Header} 
            eventKey={p.ID}>
              {p.PartyName} <br/>
              Host: {p.HostName} <br/>
              Location: {p.PartyLocation} <br/>
              Date: {p.PartyTime} <br/>
            </Accordion.Toggle>
            <Accordion.Collapse eventKey={p.ID}>
              <Card.Body>
                <ViewParty 
                Location={p.PartyLocation} 
                Name={p.PartyName}
                Host={p.HostName} 
                Date={p.DateTime} />
              </Card.Body>
            </Accordion.Collapse>
          </Card>
        ))}
        </Accordion>
    </div>
  )
}


export default Home;