import React from 'react';
import { useForm } from "react-hook-form";
import { Form, Button } from 'react-bootstrap';
import axios from 'axios';

const Signup = () => {
  const { REACT_APP_URL } = process.env;
  const { register, handleSubmit, errors } = useForm();

  const onSubmit = (data) => {
    // This is the object we're sending through
    const payload = {
      first_name: data.firstName,
      last_name: data.lastName,
      password: data.password,
      email: data.email,
    };

    const headers = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const link = `${REACT_APP_URL}sign_up`;
    axios
      .post(link, payload, headers)
      .then(res => {
        console.log(res);
      })
      .catch((error) => console.log(error));
  }

  return(
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Form.Group controlId="formFirstName">
        <Form.Label>First Name</Form.Label>
        <Form.Control 
          type="text" 
          placeholder="Spongebob"
          name="firstName"
          aria-describedby="firstNameReq"
          ref={register({ required: true })} />
        {errors.firstName && <Form.Text className="text-danger" id="firstNameReq">Required</Form.Text>}
      </Form.Group>

      <Form.Group controlId="formLastName">
        <Form.Label>Last Name</Form.Label>
        <Form.Control 
          type="text" 
          placeholder="Squarepants"
          name="lastName"
          aria-describedby="lastNameReq"
          ref={register({ required: true })} />
        {errors.lastName && <Form.Text className="text-danger" id="lastNameReq">Required</Form.Text>}
      </Form.Group>

      <Form.Group controlId="formEmail">
        <Form.Label>Email address</Form.Label>
        <Form.Control 
          type="email" 
          placeholder="Enter email" 
          name="email"
          aria-describedby="emailReq"
          ref={register({ required: true })} />
        <Form.Text className="text-muted">
          We'll never share your email with anyone else.
        </Form.Text>
        {errors.email && <Form.Text className="text-danger" id="emailReq">Required</Form.Text>}
      </Form.Group>

      {/* <Form.Group controlId="formAddress">
        <Form.Label>Address</Form.Label>
        <Form.Control 
          type="text" 
          placeholder="12345 Gorges St"
          name="address"
          aria-describedby="addressReq"
          ref={register({ required: true })} />
          <Form.Text className="text-muted">
            We'll never share your address with anyone else.
          </Form.Text>
          {errors.address && <Form.Text className="text-danger" id="addressReq">Required</Form.Text>}
      </Form.Group> */}

      <Form.Group controlId="formPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control 
          type="password" 
          placeholder="Password"
          name="password"
          aria-describedby="passwordReq"
          ref={register({ required: true, minLength: 8 })} />
          {errors.password && errors.password.type === "required" && (
            <Form.Text className="text-danger" id="passwordReq">Required</Form.Text>)}
          {errors.password && errors.password.type === "minLength" && (
            <Form.Text className="text-danger" id="passwordReq">Minimum 8 characters</Form.Text>)}
      </Form.Group>
      <Button variant="primary" type="submit">
        Submit
      </Button>
    </Form>
  )
}

export default Signup;