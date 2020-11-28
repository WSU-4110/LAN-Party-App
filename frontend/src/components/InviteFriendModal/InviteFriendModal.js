import React, { useEffect, useState } from 'react';
import { Modal, Button, Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { UserContext } from '../../context/UserContext'

const InviteFriendModal = (props) => {

  const inviteFriend = (friend) =>{
    const headers = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const Link = `${process.env.REACT_APP_URL}Party/${props.partyID}`;
    const payload={
      Attendees: {
        Add: friend.ID
      }
    }
    console.log("payload", payload)
    axios
    .patch(Link, payload, headers)
    .then((res) => {
      // console.log("patch res: ", res.data.Attributes);
      props.changeArray(res.data.Attributes.Attendees);
    })
    .catch((error) => console.log(error));
  }

  const renderFriends = () => {
    if (props.user.Friends) {
      return (
        props.user.Friends.filter(friend => !props.attendees.some(att => att.ID.includes(friend.ID)))
        .map((filterFriend => (
          <>
            <Col className="mb-2" xs={8}>
              <img src={filterFriend.Avatar} style={{width:"50px",height:"50px",borderRadius:"50%"}} />
              <span className="ml-2">{filterFriend.Username}</span>
            </Col>
            <Col xs={4}>
              <Button 
              variant="success" 
              onClick={() => inviteFriend(filterFriend)}
              >Invite</Button>
            </Col>
          </>
        )))
      )
    }
    return (
      <></>
    )
  }

  return (
    <Modal
      show={props.show}
      onHide={props.handleClose}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Invite Friend
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>
          <Row>
            {renderFriends()}
          </Row>
        </Container>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.handleClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default InviteFriendModal;