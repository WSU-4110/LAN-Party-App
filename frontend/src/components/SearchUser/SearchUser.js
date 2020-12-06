import React, {useState, useEffect, useContext} from 'react';
import {Button, Accordion, Card} from 'react-bootstrap';
import { UserContext } from '../../context/UserContext';
import axios from 'axios';
import cookies from 'js-cookie';
import './SearchUser.css';
import UserSnippet from './UserSnippet';


const SearchUser=(props)=>{
  const { REACT_APP_URL } = process.env;
  const [user, setUser] = useContext(UserContext);
  const [allUsers, setAllUsers] = useState([]);
  const [render, setRender] = useState(false);
  const [search, setSearch] = useState('');
  const [friendReqSent, setfriendReqSent] = useState([]);
  const [userIsFriend, setuserIsFriend] = useState([]);
  
  // console.log(friendReqSent);
  // console.log(user);

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
                <UserSnippet
                  userID={user.ID}
                  friends={user.Friends ? user.Friends : []}
                  about={p.About}
                  friendReqSent={friendReqSent}
                  ID={p.ID}
                  Username={p.Username} />
              </Card.Body>
            </Accordion.Collapse>
          </Card>
        ))}
        </Accordion>
    </div>
  )
}
export default SearchUser;
