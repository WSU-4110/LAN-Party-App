import React, { useState, useContext } from 'react';
import { Table, Button, Accordion, Card } from 'react-bootstrap';
import cookies from 'js-cookie';
import './User.css'
import { UserContext } from '../../UserContext'

const User = () => {
const [user, setUser] = useContext(UserContext);

  // username will be state
  // email will be state
  let username = "TestUsername";
  let email = "test@gmail.com";

  return(
    <div style={{backgroundColor: ""}}>
      <div className="userHeader">
        <div className="avatar-section">
          <img className="avatar" src="https://images.unsplash.com/photo-1602254872083-22caf4166bd7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60" />
        </div>
        <div className="desc-section">
          {user.Username}
          <br/>
          {user.Email}
        </div>
      </div>
      

      <Accordion defaultActiveKey="0">
  <Card>
    <Accordion.Toggle as={Card.Header} eventKey="0">
      Local 
    </Accordion.Toggle>
    <Accordion.Collapse eventKey="0">
      <Table striped bordered hover variant="dark">
        <thead>
          <tr>
            <th>#</th>
            <th>Local Rank</th>
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
    </Accordion.Collapse>
  </Card>
  <Card>
    <Accordion.Toggle as={Card.Header} eventKey="1">
      Global
    </Accordion.Toggle>
    <Accordion.Collapse eventKey="1">
      <Table striped bordered hover variant="dark">
        <thead>
          <tr>
            <th>#</th>
            <th>Global Rank</th>
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

      </Accordion.Collapse>
  </Card>
      </Accordion>

      <div className="userpage-buttons">
        <div className="settings-button-section">
          <Button 
            variant="outline-secondary"
            style={{width: "90vw"}}>
              Settings
          </Button>
        </div>
        <div className="settings-button-section">
          <Button 
            variant="outline-success"
            style={{width: "90vw"}}>
              Friends
          </Button>
        </div>
        <div className="settings-button-section">
          <Button 
            variant="outline-danger"
            style={{width: "90vw"}}>
              Games
          </Button>
        </div>
      </div>
    </div>
  )
}

export default User;