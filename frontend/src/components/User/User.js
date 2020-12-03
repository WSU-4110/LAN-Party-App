import React, { useState, useContext, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { Table, Button, Accordion, Card, Form, Col, Badge, FormControl, InputGroup } from 'react-bootstrap';
import cookies from 'js-cookie';
import axios from 'axios';
import './User.css';
import { UserContext } from '../../context/UserContext'

const User = (props) => {
  const { REACT_APP_URL } = process.env;
  const { register, handleSubmit, setError, errors } = useForm();
  const [user, setUser] = useContext(UserContext);
  
  const [avatar, setAvatar] = useState(user.Avatar);

  const [editMode, setEditMode] = useState(false);
  const [editEmail, setEditEmail] = useState(false);
  const [editPassword, setEditPassword] = useState(false);
  const [editAbout, setEditAbout] = useState(false);

  const [chosenImage, setChosenImage] = useState('Choose Image');

  /**
   * 
   * 
   * IMAGE UPLOAD
   * 
   * 
   */

  let image_array = [];

  const updateUser = (e, url) => {
    e.preventDefault();

    const headers = {
      headers: {
        "Content-Type": "application/json"
      }
    };
    // PATCH URL
    const Link = `${REACT_APP_URL}Account/${user.ID}`;

    const payload = {
      Avatar: url
    }

    axios
      .patch(Link, payload, headers)
      .then((res) => {
        console.log("patch res: ", res);
        setAvatar(res.data.Avatar);
        setUser({
          ...res.data,
          Token: cookies.get("Token"),
          LoggedIn: true
        })
        cookies.set("Avatar", res.data.Avatar);
      })
      .catch((error) => console.log(error));
  };

  let uploadInput, url_state;
  const handleChange = (ev) => {
    let filename = ev.target.value.split( '\\' ).pop();
    setChosenImage(filename);
  };
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
            setAvatar(url);
            updateUser(e, url);
            setEditMode(false);
            setChosenImage('Choose Image');
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
   * END IMAGE UPLOAD
   * 
   */

   /**
    * 
    * CHANGE EMAIL
    * 
    */
  const changeEmail = (data, e) => {
    e.preventDefault();

    // make sure email is not the current one
    if (data.email.toLowerCase() === user.Email.toLowerCase()) {
      alert("New email must be different");
      console.log("New and old email can't be the same");
      setEditEmail(false);
      return;
    }

    const headers = {
      headers: {
        "Content-Type": "application/json"
      }
    };
    // PATCH URL
    const Link = `${REACT_APP_URL}Account/${user.ID}`;
    const payload = {
      NewEmail: data.email
    }

    console.log("email payload", data.email);
    axios
      .patch(Link, payload, headers)
      .then((res) => {
        console.log("patch res: ", res);
        setUser({
          ...res.data,
          Token: cookies.get("Token"),
          LoggedIn: true
        })
        cookies.set("Avatar", res.data.Avatar);
      })
      .catch((error) => console.log(error));

    setEditEmail(false);
  }

  /**
    * 
    * CHANGE ABOUT
    * 
    */
   const changeAbout = (data, e) => {
    e.preventDefault();

    /*if (data.about.toLowerCase() === user.About.toLowerCase()) {
      alert("New about must be different");
      console.log("New and old about can't be the same");
      setEditAbout(false);
      return;
    }*/

    const headers = {
      headers: {
        "Content-Type": "application/json"
      }
    };
    // PATCH URL
    const Link = `${REACT_APP_URL}Account/${user.ID}`;
    const payload = {
      NewAbout: data.about
    }

    console.log("about payload", data.about);
    axios
      .patch(Link, payload, headers)
      .then((res) => {
        console.log("patch res: ", res);
        setUser({
          ...res.data,
          Token: cookies.get("Token"),
          LoggedIn: true
        })
        cookies.set("Avatar", res.data.Avatar);
      })
      .catch((error) => console.log(error));

    setEditAbout(false);
  }
 /*
   *
   * 
   * CHANGE PASSWORD
   * 
   */
  const changePassword = (data, e) => {
    e.preventDefault();

    // new email cannot be same as current
    if (data.oldpassword === data.newpassword) {
      console.log("passwords cannot be the same");
      return;
    }

    const headers = {
      headers: {
        "Content-Type": "application/json"
      }
    };
    // PATCH URL
    const Link = `${REACT_APP_URL}Account/${user.ID}`;
    const payload = {
      NewPassword: data.newpassword
    }

    console.log("password payload", payload);
    axios
      .patch(Link, payload, headers)
      .then((res) => {
        console.log("patch res: ", res);
        setUser({
          ...res.data,
          Token: cookies.get("Token"),
          LoggedIn: true
        })
        cookies.set("Avatar", res.data.Avatar);
      })
      .catch((error) => console.log(error));

    setEditPassword(false);
  }

  useEffect(()=> {
    // if the token expires while on this page and the user refresh
    // then put them back to login page
    if(!cookies.get("Token"))
      props.history.push("/login")
  })

  const renderEditEmail = () => {
    // if in edit mode
    if (editEmail) {
      return (
        <Form onSubmit={handleSubmit(changeEmail)}>
            <Form.Row className="align-items-center">
              <Col xs="auto">
                <Form.Control
                  size="sm"
                  className="mb-2"
                  type="email"
                  name="email"
                  placeholder={user.Email}
                  aria-describedby="emailReq"
                  ref={register({ required: true })}
                />
              </Col>
              <Col xs="auto" style={{display:'flex', alignContent:'center', justifyContent:'center'}}>
                <Button size="sm" type="submit" variant="secondary" className="mb-2">
                  Change
                </Button>
                <Badge 
                  style={{marginLeft:'5px'}}
                  className="close-btn"
                  onClick={()=>setEditEmail(false)}>X</Badge>
              </Col>
            </Form.Row>
        </Form>
      )
    }
    // regular mode
    return (
      <p>
        {user.Email} <Badge style={{cursor:'pointer'}} className="change-email" variant="secondary" onClick={() => setEditEmail(true)}>Edit</Badge>
      </p>
    )
  }


  const renderEditAbout = () => {
    // if in edit mode
    if (editAbout) {
      return (
        <Form onSubmit={handleSubmit(changeAbout)}>
            <Form.Row className="align-items-center">
              <Col xs="auto">
                <Form.Control
                  size="sm"
                  className="mb-2"
                  type="text"
                  name="about"
                  placeholder={user.About}
                  aria-describedby="aboutReq"
                  ref={register({ required: true })}
                />
              </Col>
              <Col xs="auto" style={{display:'flex', alignContent:'center', justifyContent:'center'}}>
                <Button size="sm" type="submit" variant="secondary" className="mb-2" onClick={() => setEditAbout(true)}>
                  Change
                </Button>
                <Badge 
                  style={{marginLeft:'5px'}}
                  className="close-btn"
                  onClick={()=>setEditAbout(false)}>X</Badge>
              </Col>
            </Form.Row>
        </Form>
      )
    }
    // regular mode
    return (
      <Button size="sm" onClick={() => setEditAbout(true)} >Edit About</Button>
    )
  }


  const renderEditPassword = () => {
    if (editPassword) {
      return (
        <Form onSubmit={handleSubmit(changePassword)}>
          {/* <Form.Control 
            className="mb-2" 
            size="sm" 
            type="password"
            name="oldpassword"
            placeholder="current password"
            ref={register({ required: true })} /> */}
          <Form.Control 
            size="sm" 
            type="password" 
            name="newpassword"
            placeholder="new password"
            ref={register({ required: true })} />
          <Button size="sm" type="submit">Confirm</Button> <Badge className="close-btn" onClick={()=>setEditPassword(false)}>X</Badge>
        </Form>
      )
    }

    return (
      <>
        <Button size="sm" variant="danger" onClick={() => setEditPassword(true)}>Change Password</Button>
      </>
    )
  }

  return(
    <div style={{backgroundColor: ""}}>
      <div className="userHeader">
        <div className="avatar-section">
          <div className='imageContainer'>
            <img className="avatar" src={user.Avatar} />
          </div>
            <div className="editButtonGroup">
              {editMode
                ?
                  <Form.Group className="choose-image-form" controlId="file-upload">
                    <Form.Label className="filelabel">{chosenImage}</Form.Label>
                    <Form.Control
                      id="file-upload"
                      type="file" 
                      name="fileInput"
                      onChange={handleChange}
                      // aria-describedby="emailReq"
                      ref={(ref) => {
                        uploadInput = ref;
                      }} />
                  </Form.Group>
                : null
              }
            {/* <input
              id="file-upload"
              name="file"
              onChange={handleChange}
              ref={(ref) => {
                uploadInput = ref;
              }}
              type="file"
            />
            <label for="file" id="filelabel">Choose a file</label> */}
            {!editMode
              ?
                <Button
                  size="sm"
                  onClick={() => setEditMode(true)} >
                  Edit Avatar
                </Button>
              : null
            }
            {chosenImage !== 'Choose Image'
            ?
              <Button
                style={{marginTop:"-10px", marginBottom:"10px"}}
                size="sm"
                onClick={handleUpload} >
                Confirm
              </Button>
            : null
            }
          </div>
        </div>
      
        <div className="desc-section">
          {user.Username}
          {renderEditEmail()}
          {renderEditPassword()}
        </div>

      </div>
      
      <div className="desc-section">
       
        {user.About}
        {renderEditAbout()}
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