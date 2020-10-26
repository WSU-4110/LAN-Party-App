import React, { useState, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import MapComponent from '../GoogleMap/GoogleMap';
import cookies from 'js-cookie';
import {Button, Accordion, Card} from 'react-bootstrap';
import { UserContext } from '../../UserContext'
import ViewParty from '../ViewParty/ViewParty';

const tempPartyList = [
  {
    ID: "123",
    Host: "Thadd",
    Name: "Paris LAN",
    Location: "Paris",
    Latitude: 48.856614,
    Longitude: 2.3522219,
    Date: "Thu Oct 22 2020 00:58:34 GMT-0400"
  },
  {
    ID: "1234",
    Host: "Thadd",
    Name: "Detroit LAN",
    Location: "Detroit",
    Latitude: 42.331427,
    Longitude: -83.0457538,
    Date: "Thu Oct 22 2020 00:58:34 GMT-0400"
  },
  {
    ID: "12345",
    Host: "Thadd",
    Name: "Australia LAN",
    Location: "Australia",
    Latitude: 49.856614,
    Longitude: 2.3532219,
    Date: "Thu Oct 22 2020 00:58:34 GMT-0400"
  }
]

const Home = (props) => {
  const [user, setUser] = useContext(UserContext);
  const toHostParty = () => {
    props.history.push("/host");
  }

  const toLogin = () => {
    props.history.push("/login");
  }

  const toViewParty = () => {
    props.history.push("/ViewParty");
  }


  
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
        {tempPartyList.map((p, i) => (
          <Card>
            <Accordion.Toggle 
            style={{
              padding: "10px 10px 5px",
              borderBottom:"2px solid #0C0C0D",
              backgroundColor: "#35373D"
            }} 
            as={Card.Header} 
            eventKey={p.ID}>
              {p.Name} <br/>
              Host: {p.Host} <br/>
              Location: {p.Location} <br/>
              Date: {p.Date} <br/>
            </Accordion.Toggle>
            <Accordion.Collapse eventKey={p.ID}>
              <Card.Body>
                <ViewParty 
                Location={p.Location} 
                Name={p.Name}
                Host={p.Host} 
                Date={p.Date} />
              </Card.Body>
            </Accordion.Collapse>
          </Card>
        ))}
        </Accordion>
    </div>
  )
}


export default Home;