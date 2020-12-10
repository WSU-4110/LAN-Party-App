import React, { useState, useEffect, useContext } from "react";
import { Button } from "react-bootstrap";
import axios from "axios";
import './SearchUser.css'

import { UserContext } from '../../context/UserContext';

function shallowEqual(object1, object2) {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (let key of keys1) {
    if (object1[key] !== object2[key]) {
      return false;
    }
  }
  return true;
}

const UserSnippet = (props) => {
  const [user, setUser] = useContext(UserContext);
  // show/hide buttons
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showRemoveFriend, setShowRemoveFriend] = useState(false); //this is a new one i made
  const [showFriendRequestSent, setShowFriendRequestSent] = useState(false);
  const [showAcceptFriendRequest, setShowAcceptFriendRequest] = useState(false);
  const [showDeclineFriendRequest, setShowDeclineFriendRequest] = useState(
    false
  );

  const updateFriends = () => {
    // call get user
    // take what's returned
    // props.user.Friends = res.data.Account.Friends
    const headers = {
      headers: {
        "Content-Type": "application/json"
      }
    }
    const link = `${process.env.REACT_APP_URL}Account/${props.userID}`;
    axios
      .get(link, headers)
      .then((res) => {
        console.log("account info", res.data)
        setUser({
          ...user,
          Friends: res.data.Account.Friends,
          FriendRequests: res.data.Account.FriendRequests
        })
      })
      .catch((error) => console.log(error))
  }

  const addFriend = (ID) =>{
    const headers = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const Link = `${process.env.REACT_APP_URL}AddFriend/Account/${props.userID}`;
    const payload={
        Requested: ID
    }
    setShowAddFriend(!showAddFriend);
    axios
    .patch(Link, payload, headers)
    .then((res) => {
      console.log("patch res: ", res.data);
      updateFriends();
      updateFriends();
      setShowFriendRequestSent(true);
    })
    .catch((error) => {
      console.log(error);
      setShowAddFriend(!showAddFriend);
    });
  }

  const removeFriend=(ID) =>{
    const headers = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const Link = `${process.env.REACT_APP_URL}AddFriend/Account/${props.userID}`;
    const payload={
        Remove: ID
    }
    setShowRemoveFriend(!showRemoveFriend);
    axios
    .patch(Link, payload, headers)
    .then((res) => {
      console.log("patch res: ", res.data);
      updateFriends();
      setShowAddFriend(true);
    })
    .catch((error) => {
      console.log(error)
      setShowRemoveFriend(!showRemoveFriend);
    });
  }

  const confirmFriend = (ID) =>{
    const headers = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const Link = `${process.env.REACT_APP_URL}AddFriend/Account/${props.userID}`;
    const payload={
        Confirm: ID
    }
    setShowAcceptFriendRequest(!showAcceptFriendRequest);
    setShowDeclineFriendRequest(!showDeclineFriendRequest);

    console.log(payload);
    axios
    .patch(Link, payload, headers)
    .then((res) => {
      console.log("patch res: ", res.data);
      updateFriends();
      setShowRemoveFriend(true);
    })
    .catch((error) => {
      console.log(error)
      setShowAcceptFriendRequest(!showAcceptFriendRequest);
      setShowDeclineFriendRequest(!showDeclineFriendRequest);
    });
  }

  const rejectFriend =(ID) =>{
    const headers = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const Link = `${process.env.REACT_APP_URL}AddFriend/Account/${props.userID}`;
    const payload={
        RemoveRequest: ID
    }

    setShowAcceptFriendRequest(!showAcceptFriendRequest);
    setShowDeclineFriendRequest(!showDeclineFriendRequest);

    axios
    .patch(Link, payload, headers)
    .then((res) => {
      console.log("patch res: ", res.data);
      updateFriends();
      setShowAddFriend(true);
    })
    .catch((error) => console.log(error));
  }

  const undoFriend=(ID) =>{
    const headers = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const Link = `${process.env.REACT_APP_URL}AddFriend/Account/${props.userID}`;
    const payload={
        RemoveRequest: ID
    }
    setShowFriendRequestSent(!showFriendRequestSent);

    axios
    .patch(Link, payload, headers)
    .then((res) => {
      console.log("patch res: ", res.data);
      updateFriends();
      
      setShowAddFriend(true);
    })
    .catch((error) =>{ 
      console.log(error)
      setShowFriendRequestSent(!showFriendRequestSent);
    });
  }

  useEffect(() => {
    console.log("friend requests sent", props.friendReqSent);
    // if you're already friends with this person
    console.log("User: " , props);
    if (props.friends.some((friend) => friend.ID.includes(props.ID))) {
      setShowRemoveFriend(true);
    } else {
      // if a friend request was already sent
      if (props.friendReqSent.some((att) => att.ID.includes(props.ID))) {
        console.log("IN HERE!")
        //Location of the friend request
        let friendReqLoc = props.friendReqSent.findIndex(att => att.ID === props.ID);
        //If you sent the friend request
        if (props.friendReqSent[friendReqLoc].Sender === true) {
          setShowFriendRequestSent(true);
          setShowAddFriend(false);
          setShowAcceptFriendRequest(false);
          setShowDeclineFriendRequest(false);
        }
        else {
          // if they sent you a request and it's pending
          setShowAddFriend(false);
          setShowAcceptFriendRequest(true);
          setShowDeclineFriendRequest(true);
        }
      } else {
        // no request was ever sent or received
        setShowAddFriend(true);
      }
    }
  }, [props.friendReqSent]);

  return (
    <>
      <div className="mt-0 mb-4 text-center">
        <b>"{props.about}"</b>
      </div>
      <div className="searchUser-buttons">
        <div className="settings-accordian-buttons">
          <Button className="su-button" variant="outline-warning">Report</Button>
          <Button className="ml-2 su-button" variant="outline-secondary">Block</Button>
          {showAddFriend && (
            <Button
              className="ml-2 su-button"
              variant="outline-primary"
              onClick={() => addFriend(props.ID)}
            >
              Add Friend
            </Button>
          )}
          {showRemoveFriend && (
            <Button
              className="ml-2 su-button"
              variant="outline-danger"
              onClick={() => removeFriend(props.ID)}
            >
              Remove Friend
            </Button>
          )}
          {showFriendRequestSent && (
            <Button
              className="ml-2 su-button"
              variant="outline-success"
              onClick={() => undoFriend(props.ID)}
            >
              Undo Request
            </Button>
          )}
          {showAcceptFriendRequest && (
            <Button
              className="ml-2 su-button"
              variant="outline-success"
              onClick={() =>
                confirmFriend(props.ID)
              }
            >
              Accept Request
            </Button>
          )}
          {showDeclineFriendRequest && (
            <Button
              className="ml-2 su-button"
              variant="outline-danger"
              onClick={() =>
                rejectFriend(props.ID)
              }
            >
              Reject Request
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default UserSnippet;
