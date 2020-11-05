import React, {useState, useEffect, useContext} from 'react';
import { useForm } from "react-hook-form";
import { Form, Button } from 'react-bootstrap';
import { UserContext } from '../../context/UserContext';
import axios from 'axios';
import cookies from 'js-cookie';
import './SearchUser.css';


const SearchUser=(props)=>{
const { REACT_APP_URL } = process.env;
  const [user, setUser] = useContext(UserContext);
  const [homeRender, setHomeRender] = useContext(HomeRenderContext);
  const [parties, setParties] = useContext(PartiesContext);
  


    return(


    )
}
export default SearchUser;
