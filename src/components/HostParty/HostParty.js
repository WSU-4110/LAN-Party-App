import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { Form, Button } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import setHours from "date-fns/setHours";
import setMinutes from "date-fns/setMinutes";
import cookies from 'js-cookie';
import axios from 'axios';
import "react-datepicker/dist/react-datepicker.css"

const HostParty = (props) => {
  const { REACT_APP_URL } = process.env;
  const { register, handleSubmit, errors } = useForm();
  // const [hours, setHours] = useState();
  // const [minutes, setMinutes] = useState();
  // const [startDate, setStartDate] = useState(setHours(setMinutes(new Date(), 30), 16));
  const [startDate, setStartDate] = useState(new Date());

  const onSubmit = (data) => {
    const payload = {
      Host: cookies.get("ID"),
      Name: data.Title,
      Location: data.Location,
      Date: startDate
    };
    const headers = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const link = `${REACT_APP_URL}CreateParty`;
    axios
      .post(link, payload, headers)
      .then(res => {
        console.log(res);
      })
      .catch((error) => console.log(error));

    props.history.push("/");
  }

  return(
    <div className="form-container">
      <div className="form-content">
      <div className="component-header">
          <h2>Create Party</h2>
        </div>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Form.Group controlId="formEmail">
            <Form.Label>Party Title</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="Enter Party Title" 
              name="Title"
              aria-describedby="titleReq"
              ref={register({ required: true })} />
            {errors.email && <Form.Text className="text-danger" id="emailReq">Required</Form.Text>}
          </Form.Group>

          {/* Location */}
          <Form.Group controlId="formEmail">
            <Form.Label>Set Location</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="Set Location" 
              name="Location"
              aria-describedby="locationReq"
              ref={register({ required: true })} />
            {errors.email && <Form.Text className="text-danger" id="locationReq">Required</Form.Text>}
          </Form.Group>
          
          {/* Date */}
          <Form.Group controlId="formEmail">
            <Form.Label>Set Location</Form.Label>
            <br/>
            <DatePicker
              name="something"
              ref={register({ required: true })}
              selected={startDate}
              onChange={date => setStartDate(date)}
              showTimeSelect
              excludeTimes={[
                setHours(setMinutes(new Date(), 0), 17),
                setHours(setMinutes(new Date(), 30), 18),
                setHours(setMinutes(new Date(), 30), 19),
                setHours(setMinutes(new Date(), 30), 17)
              ]}
              dateFormat="MMMM d, yyyy h:mm aa"
            />
          </Form.Group>

          <div style={{textAlign:"center"}}>
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </div>

          
          {/* Restrictions */}
            {/* Age, Alcohol */}
          {/* Party Size */}
          {/* Casual / Ranked */}
          {/* Additional Notes */}
        </Form>
      </div>
    </div>
  )
}

export default HostParty;