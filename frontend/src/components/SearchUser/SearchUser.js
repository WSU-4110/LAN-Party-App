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
  const [homeRender, setHomeRender] = useContext(HomeRenderContext);
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

  useEffect(()=>{
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
    })
    .catch((error) => console.log(error));
  }

  const renderButtons = (pid, username) => {
    if (friendReqSent) {
      if (friendReqSent.some(att => att.ID.includes(pid))) {
        if (friendReqSent.some(att => shallowEqual(att, {ID:pid, Sender:true, Username:username})))
          return <Button variant="outline-success" onClick={() => undoFriend(pid)}>Request Sent</Button>
        else
          return <Button variant="outline-success" onClick={() => confirmFriend(pid)} >Accept Request</Button>
      }
      else
        return <Button variant="outline-primary" onClick={() => addFriend(pid)}>Add Friend</Button>
    }
    else if (userIsFriend)
      return <Button variant="outline-primary" onClick={() => removeFriend(pid)}>Remove Friend</Button>
    else 
      return <p>uh, this shouldn't be here, oh god, oh jeez</p>
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

  useEffect(()=>{
    getAllUsers();
  } , [homeRender])

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
              <div className="searchUser-buttons">
                  <div className="settings-accordian-buttons">
                    <Button variant="outline-danger">Report</Button>{' '}
                    <div class="divider"/>
                    <Button variant="outline-secondary">Block</Button>{' '}
                    <div class="divider"/>
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
