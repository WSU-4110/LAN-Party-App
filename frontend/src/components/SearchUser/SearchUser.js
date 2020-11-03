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


  console.log('whatever in a string', allUsers);

  
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
              </Card.Body>
            </Accordion.Collapse>
          </Card>
        ))}
        </Accordion>
    </div>
  )
}
export default SearchUser;
