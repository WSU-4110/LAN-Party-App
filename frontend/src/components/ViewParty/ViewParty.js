import React, { useState, useContext } from 'react';
import { Table, Button, Accordion, Card } from 'react-bootstrap';
import cookies from 'js-cookie';
import './ViewParty.css'
import { UserContext } from '../../context/UserContext'
import { PartiesContext } from '../../context/PartiesContext'
import { HomeRenderContext } from '../../context/HomeRenderContext'
import axios from 'axios';
import { hoistStatics } from 'recompose';

//temporary metadata until we can pull it from the DB


const ViewParty=(props)=>{
  const { REACT_APP_URL } = process.env;
  const [user, setUser] = useContext(UserContext);
  const [homeRender, setHomeRender] = useContext(HomeRenderContext);
  const [party, setParty] = useState(props.party);
  const [attendees, setAttendees] = useState(props.party.Attendees);

  const joinParty=() =>{
    const headers = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const Link = `${process.env.REACT_APP_URL}Party/${party.ID}`;
    const payload={
      Attendees: {
        Add: props.user.ID
      }
    }
    axios
    .patch(Link, payload, headers)
    .then((res) => {
      console.log("patch res: ", res);
      setAttendees(res.data.Attributes.Attendees);
    })
    .catch((error) => console.log(error));
  }

    const leaveParty=() =>{
      const headers = {
        headers: {
          "Content-Type": "application/json",
        },
      };
    const Link = `${process.env.REACT_APP_URL}Party/${party.ID}`;
    const payload={
      Attendees: {
        Remove: props.user.ID
      }
    }
    axios
    .patch(Link, payload, headers)
      .then((res) => {
        console.log("patch res: ", res);
        setAttendees(res.data.Attributes.Attendees);
      })
      .catch((error) => console.log(error));    
  }

  
  return(
    <div>
      <div 
        style={{
          padding: "10px 10px 5px",
          borderBottom:"2px solid #0C0C0D",
          backgroundColor: "#35373D"
        }}>
        <p>Hardware: {props.hardware}</p>
        <p>Minimum Age: {props.age}</p>
        <p>Notes from Host: {props.notes}</p>
      </div>
      
      <Table striped bordered hover variant="dark">
        <thead>
          <tr>
            <th>#</th>
            <th>Participants</th>
          </tr>
        </thead>
        <tbody>
          {attendees.map((attendee, index) =>(
            <tr>
              <td>{index+1}</td>
              <td>{attendee.Username}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      {cookies.get("Token") //if logged in
        ? attendees.some(att => att.ID.includes(props.user.ID)) //if in the party
          ? user.ID === props.hostID //if host, then can't leave party
            ? <Button variant="danger" onClick={leaveParty} disabled>Leave Party</Button>
            : <Button variant="danger" onClick={leaveParty}>Leave Party</Button>
          : <Button variant="success" onClick={joinParty}>Join Party</Button>
        : <Button onClick={props.toLogin}>Login to join</Button>
      } 
    </div>
  )
}
export default ViewParty;

