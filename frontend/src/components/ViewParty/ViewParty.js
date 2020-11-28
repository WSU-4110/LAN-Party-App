import React, { useState, useContext, Suspense } from 'react';
import { Table, Button, Accordion, Card, Col, Row } from 'react-bootstrap';
import cookies from 'js-cookie';
import './ViewParty.css';
import axios from 'axios';
import { UserContext } from '../../context/UserContext'
import { PartiesContext } from '../../context/PartiesContext'
import { HomeRenderContext } from '../../context/HomeRenderContext'
import NewLocationModal from './NewLocationModal';
const IFModal = React.lazy(() =>
  import("../InviteFriendModal/InviteFriendModal")
);

const ViewParty = (props) => {
  const { REACT_APP_URL } = process.env;
  const [user, setUser] = useContext(UserContext);
  const [parties, setParties] = useContext(PartiesContext);
  const [party, setParty] = useState(props.party);
  const [attendees, setAttendees] = useState(props.party.Attendees);
  // const [locationChange, setLocationChange] = useState(party.RequestLocationChange ? true : false);
  const [attendeeRender, setAttendeeRender] = useState(false);
  //  modal states
  const [show, setShow] = useState(false);
  const [showModal, setShowModal] = useState(false); // i think this is for the request location change
  // Modal functions
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

  const getParties = () => {
    const link = `${process.env.REACT_APP_URL}Parties`;
    axios
      .get(link)
      .then((res) => {
        console.log("parties", res);
        setParties(res.data.Parties);
      })
      .catch((error) => console.log(error))
  }

  const ageGate = () => {
    if (
      window.confirm(
        "By joining this party, you agree that you meet the minimum age requirement and that you won't sue us over anything."
      )
    ) {
      joinParty();
    }
  };

  const joinParty = () => {
    const headers = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const Link = `${process.env.REACT_APP_URL}Party/${party.ID}`;
    const payload = {
      Attendees: {
        Add: props.user.ID,
      },
    };
    axios
      .patch(Link, payload, headers)
      .then((res) => {
        console.log("patch res: ", res);
        setAttendees(res.data.Attributes.Attendees);
      })
      .catch((error) => console.log(error));
  };

  const leaveParty = () => {
    const headers = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const link = `${process.env.REACT_APP_URL}Party/${party.ID}`;
    const payload={
      Attendees: {
        Remove: props.user.ID,
      },
    };
    axios
    .patch(link, payload, headers)
      .then((res) => {
        console.log("patch res: ", res);
        setAttendees(res.data.Attributes.Attendees);
      })
      .catch((error) => console.log(error));
  };

  const handleModalClose = () => {
    setShow(false);
    setAttendeeRender(!attendeeRender);
  };
  const inviteFriendOpen = () => setShow(true);

  const removeMember = (attendeeID) => {
    const headers = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const Link = `${process.env.REACT_APP_URL}Party/${party.ID}`;
    const payload = {
      Attendees: {
        Remove: attendeeID,
      }
    };
    axios
      .patch(Link, payload, headers)
      .then((res) => {
        console.log("patch res: ", res);
        setAttendees(res.data.Attributes.Attendees);
        getParties();
      })
      .catch((error) => console.log(error));
  };

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
        getParty();
        getParties();
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
        getParties();
      })
      .catch((error) => console.log(error));
    console.log("location request confirmed");
  }
    
  return (
    <div>
      <div
        style={{
          padding: "10px 10px 5px",
          borderBottom: "2px solid #0C0C0D",
          backgroundColor: "#35373D",
        }}
      >
        <p>Hardware: {props.hardware}</p>
        <p>Minimum Age: {props.age}</p>
        <p>Notes from Host: {props.notes}</p>
      </div>
      
      <Table striped bordered hover variant="dark" className="mb-0">
        <thead>
          <tr>
            <th>#</th>
            <th>Participants</th>
            {cookies.get("Token") ? ( //if logged in
              attendees.some((att) => att.ID.includes(props.user.ID)) ? ( //if in the party
                user.ID === props.hostID ? ( //if host, then can't leave party
                  <th className="text-center">Remove</th>
                ) : null
              ) : null
            ) : null}
          </tr>
        </thead>
        <tbody>
          {attendees.map((attendee, index) => (
            <tr>
              <td>{index + 1}</td>
              <td>{attendee.Username}</td>
              <td className="text-center">
                {cookies.get("Token") ? ( //if logged in
                  attendees.some((att) => att.ID.includes(props.user.ID)) ? ( //if in the party
                    user.ID === props.hostID ? ( //if host, then can't leave party
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={attendee.ID === props.hostID ? true : false}
                        onClick={() => removeMember(attendee.ID)}
                      >
                        Boot
                      </Button>
                    ) : null
                  ) : null
                ) : null}
              </td>
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
              ? 
                <>
                  <Button variant="danger" onClick={leaveParty} disabled>Leave Party</Button>
                  <Button className="ml-2" variant="success" onClick={inviteFriendOpen}>
                    Invite Friend
                  </Button>
                </>
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

      <Suspense fallback={<div>Loading...</div>}>
        <IFModal
          show={show}
          handleClose={handleModalClose}
          partyID={party.ID}
          attendees={attendees}
          user={user}
          changeArray={setAttendees}
        />
      </Suspense>
    </div>
  );
};
export default ViewParty;
