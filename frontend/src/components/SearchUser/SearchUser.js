import React, {useState, useEffect, useContext} from 'react';
import { useForm } from "react-hook-form";
import Map from '../GoogleMap/GoogleMap';
import {Button, Accordion, Card} from 'react-bootstrap';
import { UserContext } from '../../context/UserContext';
import { HomeRenderContext } from '../../context/HomeRenderContext'
import axios from 'axios';
import cookies from 'js-cookie';
import './SearchUser.css';


const SearchUser=(props)=>{
  const { REACT_APP_URL } = process.env;
  const [user, setUser] = useContext(UserContext);
  const [allUsers, setAllUsers] = useState([]);
  const [render, setRender] = useState(false);
  const [search, setSearch] = useState('');
  const [friendReqSent, setfriendReqSent] = useState([]);
  const [userIsFriend, setuserIsFriend] = useState([]);

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
  
  console.log(friendReqSent);
  console.log(user);

  //don't delete this useEffect it's the only thing keeping it from crashing!
  useEffect(()=>{
    if(user.FriendRequests)  
      setfriendReqSent(user.FriendRequests);
  }, [user])

  useEffect(() => {
    if (!cookies.get("Token"))
      props.history.push("/login");
    getAllUsers();
    if (user.ID !== "") {
      setfriendReqSent(user.FriendRequests);
    }
  }, [])

  useEffect(()=>{
    setuserIsFriend(user.Friends);
  }, [user])

  useEffect(() => {
    if (!cookies.get("Token"))
      props.history.push("/login");
    getAllUsers();
    if (user.ID !== "") {
      setuserIsFriend(user.Friends);
    }
  }, [])
  
  
  const getAllUsers = () => {
    const link = `${REACT_APP_URL}Accounts`;
    axios
      .get(link)
      .then((res) => {
        console.log("allUsers", res);
        setAllUsers(res.data.Items);
      })
      .catch((error) => console.log(error))
  }

  const addFriend=(ID) =>{
    console.log("FriendReqSent", friendReqSent)
    
    const headers = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const Link = `${process.env.REACT_APP_URL}AddFriend/Account/${user.ID}`;
    const payload={
        Requested: ID
    }
    axios
    .patch(Link, payload, headers)
    .then((res) => {
      console.log("patch res: ", res.data);
      user.FriendRequests.push({
        ID: ID,
        Sender: true
      })
      setfriendReqSent(user.FriendRequests);

        console.log("FRIEND REQ SENT: ", friendReqSent )
    })
    .catch((error) => console.log(error));
  }

  const confirmFriend=(ID) =>{
    const headers = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const Link = `${process.env.REACT_APP_URL}AddFriend/Account/${user.ID}`;
    const payload={
        Confirm: ID
    }
    console.log(payload);
    axios
    .patch(Link, payload, headers)
    .then((res) => {
      console.log("patch res: ", res.data);
    })
    .catch((error) => console.log(error));
  }
  
  const removeFriend=(ID) =>{
    const headers = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const Link = `${process.env.REACT_APP_URL}AddFriend/Account/${user.ID}`;
    const payload={
        Remove: ID
    }
    axios
    .patch(Link, payload, headers)
    .then((res) => {
      console.log("patch res: ", res.data);
    })
    .catch((error) => console.log(error));
  }
  
  const undoFriend=(ID) =>{
    console.log("friendReqSent: ", [...friendReqSent])
    const headers = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const Link = `${process.env.REACT_APP_URL}AddFriend/Account/${user.ID}`;
    const payload={
        RemoveRequest: ID
    }
    axios
    .patch(Link, payload, headers)
    .then((res) => {
      console.log("patch res: ", res.data);
      user.FriendRequests.splice(
        user.FriendRequests.findIndex(removed => removed.ID === ID), 1
      )
      console.log("user.FriendRequests: ",user.FriendRequests)
      setfriendReqSent(user.FriendRequests)
    })
    .catch((error) => console.log(error));
  }

  const renderButtons = (pid, username) => {
    //If the current user has the attribute related to FriendRequests
    //And the other user is in the friend request array
    if (friendReqSent && friendReqSent.some(att => att.ID ===(pid))) {
      //Get the location in the array where the other user's ID matches the current
      let friendReqLoc = friendReqSent.findIndex(att => att.ID ===(pid));

      console.log("IN BUTTON FUNCTION: ", friendReqSent)
      //If they're the sender, tell them the request was sent
      if (friendReqSent[friendReqLoc].Sender)
        return <Button variant="outline-success" onClick={() => undoFriend(pid)}>Undo Request</Button>
      //If they're not the sender, offer the option to accept. Reject is somewhere else.
      else
        return <Button variant="outline-success" onClick={() => confirmFriend(pid)} >Accept Request</Button>
    }

    //If the user has a friends list and the other user is in it
    else if (userIsFriend && userIsFriend.some(att => att.ID.includes(pid))) {
      return <Button variant="outline-primary" onClick={() => removeFriend(pid)}>Remove Friend</Button>
    }
    
    //The current user that is logged in either has neither of the attributes,
    //Or the person they're looking at is in neither.
    else
      return <Button variant="outline-primary" onClick={() => addFriend(pid)}>Add Friend</Button>
  }

  const renderEXButton = (pid, username) => {
     if (friendReqSent.some(att => shallowEqual(att, {ID:pid, Sender:false, Username:username})))
      return <Button variant="outline-success" onClick={() => undoFriend(pid)} >Reject Request</Button> 
    else
      return <p></p>
  }
  
  useEffect(() => {
    getAllUsers();
  }, [])

  const filteredUsers = allUsers.filter( users => {
    return users.Username.toLowerCase().includes( search.toLowerCase() )
  } )

  return(
    <div>
    <input type= "text" placeholder = "search users" onChange = { e => setSearch(e.target.value)} />
      <Accordion>
        {filteredUsers.map((p, i) => (
          <Card>
            <Accordion.Toggle 
            style={{
              padding: "10px 10px 5px",
              borderBottom:"2px solid #0C0C0D",
              backgroundColor: "#35373D"
            }} 
            as={Card.Header} 
            eventKey={p.ID}>
              <img className='searchAvatar'src= {p.Avatar}></img>
              {p.Username} <br/>
            </Accordion.Toggle>
            <Accordion.Collapse eventKey={p.ID}>
              <Card.Body>
              <b>"{p.About}"</b>
              {p.About}
              <div className="searchUser-buttons">
                  <div className="settings-accordian-buttons">
                    <Button variant="outline-danger">Report</Button>{' '}
                    <div class="divider"/>
                    <Button variant="outline-secondary">Block</Button>{' '}
                    <div class="divider"/>
                    {render}
                    {renderButtons(p.ID, p.Username)}
                    <div class="divider"/>
                    {renderEXButton(p.ID, p.Username)}
                  </div>
                </div>
              </Card.Body>
            </Accordion.Collapse>
          </Card>
        ))}
        </Accordion>
    </div>
  )
}
export default SearchUser;
