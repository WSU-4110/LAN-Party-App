import React, { useState, useContext } from 'react';
import { Table, Button, Accordion, Card, Col, Row } from 'react-bootstrap';
import cookies from 'js-cookie';
import './ViewParty.css'
import { UserContext } from '../../context/UserContext'
import { PartiesContext } from '../../context/PartiesContext'
import { HomeRenderContext } from '../../context/HomeRenderContext'
import NewLocationModal from './NewLocationModal';
import axios from 'axios';

//temporary metadata until we can pull it from the DB


const ViewParty=(props)=>{
  const { REACT_APP_URL } = process.env;
  // const [user, setUser] = useContext(UserContext);
  const [party, setParty] = useState(props.party);
  const [attendees, setAttendees] = useState(props.party.Attendees);
  // const [locationChange, setLocationChange] = useState(party.RequestLocationChange ? true : false);
  
  // Modal functions
  const [showModal, setShowModal] = useState(false);
  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  // const handleLocationChange = () => setLocationChange(!locationChange);

  const getParty = () => {
    const link = `${process.env.REACT_APP_URL}Party/${party.ID}`;
    axios
      .get(link)
      .then(res => {console.log(res); setParty(res.data.Party);})
      .catch(err => console.log(err));
  }

  const ageGate=() =>{
    if (window.confirm("By joining this party, you agree that you meet the minimum age requirement and that you won't sue us over anything.")){
      joinParty();
   }
}

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
    const link = `${process.env.REACT_APP_URL}Party/${party.ID}`;
    const payload={
      Attendees: {
        Remove: props.user.ID
      }
    }
    axios
    .patch(link, payload, headers)
      .then((res) => {
        console.log("patch res: ", res);
        setAttendees(res.data.Attributes.Attendees);
      })
      .catch((error) => console.log(error));    
  }

  const removeMember=() =>{
    const headers = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const Link = `${process.env.REACT_APP_URL}Party/${party.ID}`;
    const payload={
      Attendees: {
        Remove: this.user.ID
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

  const confirmLocationRequest = (address, lat, lng) => {
    const headers = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const link = `${process.env.REACT_APP_URL}Party/${party.ID}`;
    const payload={
      PartyLocation: {
        Name: address,
        Latitude: lat,
        Longitude: lng
      }
    }
    axios
    .patch(link, payload, headers)
      .then((res) => {
        console.log("patch res: ", res);
      })
      .catch((error) => console.log(error));
    console.log("location request confirmed");
  }

  const denyLocationRequest = () => {
    const headers = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const link = `${process.env.REACT_APP_URL}Party/${party.ID}`;
    const payload = {
      RequestLocationChange: "void"
    }
    axios
    .patch(link, payload, headers)
      .then((res) => {
        console.log("patch res: ", res);
        getParty();
      })
      .catch((error) => console.log(error));
    console.log("location request confirmed");
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
      
      <Table striped bordered hover variant="dark" className="mb-0">
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
      
      {cookies.get("Token") // if logged in
        ? attendees.some(att => att.ID.includes(props.user.ID)) //if in the party
          ? party.RequestLocationChange // if theres a request
            ? // show the request
              <div className="mb-2 mt-2"
                style={{
                  backgroundColor:"#2C2F33",
                  padding:"5px 10px",
                  borderRadius:"3px"
                }}>
                <span className="font-italic text-center">Location Request Pending</span> <br/>
                <span><strong>Title </strong></span>
                <span className="font-weight-light">{party.RequestLocationChange ? party.RequestLocationChange.Title : null}</span> <br/>
                <span className=""><strong>Location </strong></span>
                <span className="font-weight-light">{party.RequestLocationChange ? party.RequestLocationChange.RequestLocation.Name : null}</span> <br/>
                <div className="ml-2">
                  <span className="font-weight-bolder"><strong>" </strong></span>
                  <span>{party.RequestLocationChange ? party.RequestLocationChange.Body : null}</span>
                  <span className="font-weight-bolder"><strong> "</strong></span>
                </div>
                {party.Host === props.user.ID //if host
                  ? // show the confirm button, probably need a deny button somewhere
                    <div className="mt-1">
                      <Button 
                        variant="success" 
                        onClick={() => 
                          confirmLocationRequest(party.RequestLocationChange.RequestLocation.Name, party.RequestLocationChange.RequestLocation.Latitude, party.RequestLocationChange.RequestLocation.Longitude)
                        }>
                        Confirm
                      </Button>
                      <Button className="ml-1" variant="danger" onClick={denyLocationRequest}>Deny</Button>
                    </div>
                  : // this will be null in the final version, the button exists for testing only
                    // <div className="mt-1">
                    //   <Button variant="success" onClick={confirmLocationRequest}>Confirm</Button>
                    //   <Button className="ml-1" variant="danger">Deny</Button>
                    // </div>
                    null
                }
              </div>
            : null // if there isn't a request
          : null // if not in the party
        : null // it not logged in
      }
      
      <div className="mt-2">
        {cookies.get("Token") //if logged in
          ? attendees.some(att => att.ID.includes(props.user.ID)) //if in the party
            ? props.user.ID === props.hostID //if host, then can't leave party
              ? <Button variant="danger" onClick={leaveParty} disabled>Leave Party</Button>
              : <Button variant="danger" onClick={leaveParty}>Leave Party</Button>
            : <Button variant="success" onClick={ageGate}>Join Party</Button>
          : <Button onClick={props.toLogin}>Login to join</Button>
        }

        {/* 1. logged in */}
        {/* 2. is a part of party */}
        {/* 3. is not party leader */}
        {cookies.get("Token") //if logged in
          ? attendees.some(att => att.ID.includes(props.user.ID)) //if in party
            ? party.Host !== props.user.ID //and you're not the host
              ? <Button className="ml-1" variant="warning" onClick={openModal}>Request New Location</Button>
              : <p>you're the host</p>
            : <p>not in party</p>
          : <p>not logged in</p>
        }
      </div>

      {/* MODAL */}
      <NewLocationModal 
        partyID={party.ID} 
        userID={props.user.ID} 
        show={showModal} 
        onHide={closeModal}
        getParty={getParty} />
    </div>
  )
}
export default ViewParty;

