import React, { useState, useEffect, useContext, FormControl } from 'react';
import { NavLink } from 'react-router-dom';
import Map from '../GoogleMap/GoogleMap';
import cookies from 'js-cookie';
import {Button, Accordion, Card} from 'react-bootstrap';
import { UserContext } from '../../context/UserContext';
import { PartiesContext } from '../../context/PartiesContext'
import { HomeRenderContext } from '../../context/HomeRenderContext'
import ViewParty from '../ViewParty/ViewParty';
import axios from 'axios';


const Home = (props) => {
  const { REACT_APP_URL } = process.env;
  const [user, setUser] = useContext(UserContext);
  const [homeRender, setHomeRender] = useContext(HomeRenderContext);
  const [parties, setParties] = useContext(PartiesContext);
  const [search, setSearch] = useState('');

  const toHostParty = () => {
    props.history.push("/host");
  }

  const toLogin = () => {
    props.history.push("/login");
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

  useEffect(()=> {
    getParties();
  }, [])

  useEffect(()=>{
    getParties();
  } , [homeRender])

  const filteredParties = parties.filter( parties => {
    return parties.PartyName.toLowerCase().includes( search.toLowerCase() )
  } )
  
  return(
    <div>
      <Map />
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

      <input type= "text" placeholder = "search parties" onChange = { e => setSearch(e.target.value)} />

      <Accordion>
        {filteredParties.map((p, i) => (
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
              Host: {p.HostUsername} <br/>
              Location: {p.PartyLocation.hasOwnProperty("Name") ? p.PartyLocation.Name : p.PartyLocation} <br/>
              Date: {p.PartyTime} <br/>
            </Accordion.Toggle>
            <Accordion.Collapse eventKey={p.ID}>
              <Card.Body>
                <ViewParty 
                party = {p}
                location={p.Location} 
                name={p.Name}
                host={p.HostUsername}
                hostID = {p.Host}
                date={p.Date}
                Attendees = {p.Attendees}
                user={user}
                hardware={p.HardwareReq}
                age={p.MinAge}
                notes={p.Notes} 
                toLogin = {toLogin}/>
              </Card.Body>
            </Accordion.Collapse>
          </Card>
        ))}
        </Accordion>
    </div>
  )
}

export default Home;