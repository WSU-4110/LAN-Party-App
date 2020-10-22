import React, { useState, useContext } from 'react';
import { Table, Button, Accordion, Card } from 'react-bootstrap';
import cookies from 'js-cookie';
import './User.css'
import { UserContext } from '../../UserContext'
import axios from 'axios';

const User = () => {
  const { REACT_APP_URL } = process.env;
  const [user, setUser] = useContext(UserContext);
  const [imageUploading, setImageUploading] = useState(false);

  // image upload function
  let uploadButton;
  const imageUpload = (event) => {
    // uploads image to s3 bucket
    event.preventDefault();
    let file = uploadButton.files;
    // split the filename to get the name type
    let fileParts = uploadButton.files.name.split('.');
    let fileName = fileParts[0];
    let fileType = fileParts[1];
    let requestData = {
      fileName,
      fileType
    };
    setImageUploading(true);
    axios
      .post(`${REACT_APP_URL}images/upload`, requestData)
      .then((res) => {
        console.log("axios response:", res);
      })
      .then((res) => {
        
      })
  }

  const editAvatar = () => {
    // declare image var
  }

  return(
    <div style={{backgroundColor: ""}}>
      <div className="userHeader">
        <div className="avatar-section" style={{textAlign:"center"}}>
          <img className="avatar" src="https://images.unsplash.com/photo-1602254872083-22caf4166bd7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60" />
          <Button 
            size="sm" 
            style={{marginTop:"5px"}}
            onClick={editAvatar}>Edit Avatar</Button>
        </div>
        <div className="desc-section" style={{padding:"10px"}}>
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