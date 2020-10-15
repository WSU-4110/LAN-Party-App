import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { Form } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import setHours from "date-fns/setHours";
import setMinutes from "date-fns/setMinutes";
import "react-datepicker/dist/react-datepicker.css"

const HostParty = () => {
  const { register, handleSubmit, errors } = useForm();
  // const [hours, setHours] = useState();
  // const [minutes, setMinutes] = useState();
  // const [startDate, setStartDate] = useState(setHours(setMinutes(new Date(), 30), 16));
  const [startDate, setStartDate] = useState(new Date());


  return(
    <div>
      <Form>
        <Form.Group controlId="formEmail">
          <Form.Label>Party Title</Form.Label>
          <Form.Control 
            type="text" 
            placeholder="Enter Party Title" 
            name="partyTitles"
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
            name="location"
            aria-describedby="locationReq"
            ref={register({ required: true })} />
          {errors.email && <Form.Text className="text-danger" id="emailReq">Required</Form.Text>}
        </Form.Group>
        
        {/* Date */}
        <Form.Group controlId="formEmail">
          <Form.Label>Set Location</Form.Label>
          <br/>
          <DatePicker
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

        
        {/* Restrictions */}
          {/* Age, Alcohol */}
        {/* Party Size */}
        {/* Casual / Ranked */}
        {/* Additional Notes */}
      </Form>
    </div>
  )
}

export default HostParty;