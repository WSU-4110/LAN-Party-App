import React, {useState, useEffect, useContext} from 'react';
import { useForm } from "react-hook-form";
import { Form, Button } from 'react-bootstrap';
import { UserContext } from '../../Models/UserContext';
import axios from 'axios';
import cookies from 'js-cookie';
import './PartySearch.css';


const PartySearch = (props) => {
  const { REACT_APP_URL } = process.env;
  const [parties, setParties] = useState([]);

  const onSubmit = (data) => {
    const payload = {
      PartyName: data.partyName,
      PartyLocation: data.partyLocation,
      PartyTime: data.partyTime,
      HostUsername: data.hostUsername,
    }
  }

  const getParties = () => {
    const link = '${REACT_APP_URL}Parties';
    axios
      .get(link)
      .then((res) => {
        console.log("parties", res);
        setParties(res.data.Parties);
      })
      .catch((error) => console.log(error))
  }

  useEffect(()=>{
    getParties();
  } , [])   
}
export default PartySearch;