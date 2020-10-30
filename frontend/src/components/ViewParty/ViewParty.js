import React, { useState, useContext } from 'react';
import { Table, Button, Accordion, Card } from 'react-bootstrap';
import cookies from 'js-cookie';
import './ViewParty.css'
import { UserContext } from '../../UserContext'
import axios from 'axios';

//temporary metadata until we can pull it from the DB


const ViewParty=(props)=>{

    return(
        <div>
          <div 
            style={{
              padding: "10px 10px 5px",
              borderBottom:"2px solid #0C0C0D",
              backgroundColor: "#35373D"
            }}>
            <h4>{props.Name}</h4>
            <h5>Host: {props.Host}</h5>
            Location: {props.Location}
            <br/>
            <p>Date: {props.Date}</p>
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
  </div>
  
  
  
  
  )
}
export default ViewParty;

