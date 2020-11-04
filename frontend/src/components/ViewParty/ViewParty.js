import React, { useState, useContext } from 'react';
import { Table, Button, Accordion, Card } from 'react-bootstrap';
import cookies from 'js-cookie';
import './ViewParty.css'
import { UserContext } from '../../context/UserContext'
import axios from 'axios';

//temporary metadata until we can pull it from the DB


const ViewParty=(props)=>{

  const joinParty=() =>{

    const headers = {
      headers: {
        "Content-Type": "application/json",
      },
    };
  
  const Link = `${process.env.REACT_APP_URL}/Party/${props.ID}/Update`;

  const payload={
    Attendees: props.Attendees.push({ID:props.user.ID,Username: props.user.Username})
  }

  axios
      .patch(Link, payload, headers)
      .then((res) => {
        console.log("patch res: ", res);
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
        <h4>{props.name}</h4>
        <h5>Host: {props.host}</h5>
        Location: {props.location}
        <br/>
        <p>Date: {props.date}</p>
      </div>
      
      <Table striped bordered hover variant="dark">
        <thead>
          <tr>
            <th>#</th>
            <th>Participants</th>
            <th>Game</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>35</td>
            <td>Tekken 7</td>
          </tr>
          <tr>
            <td>2</td>
            <td>50</td>
            <td>Street Fighter V</td>
          </tr>
          <tr>
            <td>3</td>
            <td>300</td>
            <td>Smash Bros. Melee</td>
          </tr>
        </tbody>
      </Table>

      <Button onClick={joinParty}>
        Join Party
        
      </Button>


    </div>


  )
}
export default ViewParty;

