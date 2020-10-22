import React, { useState, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import MapComponent from '../GoogleMap/GoogleMap';
import cookies from 'js-cookie';
import {Button} from 'react-bootstrap';
import { UserContext } from '../../UserContext'

const tempPartyList = [
  {
    Host: "Thadd",
    Name: "Detroit LAN",
    Location: "Detroit",
    Latitude: 42.331427,
    Longitude: -83.0457538,
    Date: "Thu Oct 22 2020 00:58:34 GMT-0400"
  },
  {
    Host: "Thadd",
    Name: "Paris LAN",
    Location: "Paris",
    Latitude: 48.856614,
    Longitude: 2.3522219,
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
      <div>
        {tempPartyList.map((p) => (
          <div 
            style={{
              padding: "10px 10px 5px",
              borderBottom:"2px solid #0C0C0D",
              backgroundColor: "#35373D"
            }}>
            <h4>{p.Name}</h4>
            <h5>Host: {p.Host}</h5>
            Location: {p.Location}
            <br/>
            <p>Date: {p.Date}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Home;