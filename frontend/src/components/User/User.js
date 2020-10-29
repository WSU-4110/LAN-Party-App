import React, { useState, useContext } from 'react';
import { Table, Button, Accordion, Card } from 'react-bootstrap';
import cookies from 'js-cookie';
import axios from 'axios';
import './User.css'
import { UserContext } from '../../UserContext'

const User = () => {
  const { REACT_APP_URL } = process.env;
  const [user, setUser] = useContext(UserContext);
  
  const [avatar, setAvatar] = useState();

  /**
   * 
   * 
   * IMAGE UPLOAD
   * 
   * 
   */

  let image_array = [];

  const updateUser = (e) => {
    e.preventDefault();

    const payload = {
      
    }

    const headers = {
      headers: {
        "Content-Type": "application/json"
      }
    };
    // PATCH URL
    const Link = `${REACT_APP_URL}Account/${user.ID}/Update`;

    axios
      .patch(Link, payload, headers)
      .then((res) => {
        console.log("res: ", res);
      })
      .catch((error) => console.log(error));
  };

  let uploadInput, url_state;
  const handleChange = (ev) => {};
  const handleUpload = (e) => {
    e.preventDefault();
    let file = uploadInput.files[0];
    // split the filename to get the name and type
    let fileParts = uploadInput.files[0].name.split(".");
    let fileName = fileParts[0];
    let fileType = fileParts[1];
    let request_data = {
      fileName: fileName,
      fileType: fileType,
    };

    console.log("request_data", request_data);
    console.log("file", file);

    axios
      .post(`${REACT_APP_URL}Image/Upload`, request_data)
      .then((response) => {
        console.log("axios response:", response);
        var returnData = response.data;
        var signedRequest = returnData.signedRequest;
        var url = returnData.url;
        url_state = url;
        console.log("Recieved a signed request ", signedRequest);

    //     // Put the fileType in the headers for the upload
        var options = {
          headers: {
            "Content-Type": fileType,
          },
        };
        axios
          .put(signedRequest, file, options)
          .then((result) => {
            console.log(result)
            // console.log("Response from s3");
            // console.log("url:", url);
            // console.log("url_state:", url_state);
            image_array.push(url);
          })
          .catch((error) => {
            alert("ERROR " + JSON.stringify(error));
          });
      })
      .catch((error) => {
        console.log("error:", error);
        alert(JSON.stringify(error));
      });
  }

  /**
   * 
   * 
   * 
   * END IMAGE UPLOAD
   * 
   * 
   */

  return(
    <div style={{backgroundColor: ""}}>
      <div className="userHeader">
        <div className="avatar-section">
          <img className="avatar" src="https://images.unsplash.com/photo-1602254872083-22caf4166bd7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60" />
          <input
            onChange={handleChange}
            ref={(ref) => {
              uploadInput = ref;
            }}
            type="file"
          />
          <br />
          <Button
            size="sm"
            onClick={handleUpload} 
            style={{marginTop:"10px"}}>
            Edit Avatar
          </Button>
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