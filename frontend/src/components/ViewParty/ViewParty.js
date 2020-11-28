import React, { useState, useContext, Suspense, useEffect } from "react";
import { Table, Button, Accordion, Card } from "react-bootstrap";
import cookies from "js-cookie";
import "./ViewParty.css";
import { UserContext } from "../../context/UserContext";
import { PartiesContext } from "../../context/PartiesContext";
import { HomeRenderContext } from "../../context/HomeRenderContext";
import axios from "axios";
const IFModal = React.lazy(() =>
  import("../InviteFriendModal/InviteFriendModal")
);

const ViewParty = (props) => {
  const { REACT_APP_URL } = process.env;
  const [user, setUser] = useContext(UserContext);
  const [party, setParty] = useState(props.party);
  const [attendees, setAttendees] = useState(props.party.Attendees);
  const [attendeeRender, setAttendeeRender] = useState(false);
  //  modal states
  const [show, setShow] = useState(false);

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
    const Link = `${process.env.REACT_APP_URL}Party/${party.ID}`;
    const payload = {
      Attendees: {
        Remove: props.user.ID,
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

  const handleModalClose = () => {
    setShow(false);
    setAttendeeRender(!attendeeRender);
  };
  const inviteFriendOpen = () => setShow(true);

  const renderButtonGroup = () => (
    <>
      <Button variant="danger" onClick={leaveParty} disabled>
        Leave Party
      </Button>
      <Button className="ml-2" variant="success" onClick={inviteFriendOpen}>
        Invite Friend
      </Button>
    </>
  );

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

      <Table striped bordered hover variant="dark">
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

      {cookies.get("Token") ? ( //if logged in
        attendees.some((att) => att.ID.includes(props.user.ID)) ? ( //if in the party
          user.ID === props.hostID ? ( //if host, then can't leave party
            renderButtonGroup()
          ) : (
            <Button variant="danger" onClick={leaveParty}>
              Leave Party
            </Button>
          )
        ) : (
          <Button variant="success" onClick={ageGate}>
            Join Party
          </Button>
        )
      ) : (
        <Button onClick={props.toLogin}>Login to join</Button>
      )}
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
