import React from 'react';
import { useForm } from "react-hook-form";
import { Form, Button } from 'react-bootstrap';

const Login = () => {
  const { register, handleSubmit, errors } = useForm();

  const onSubmit = (data) => {
    console.log("submitted", data)
  }

  return(
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Form.Group controlId="formEmail">
        <Form.Label>Email address</Form.Label>
        <Form.Control 
          type="email" 
          placeholder="Enter email" 
          name="email"
          aria-describedby="emailReq"
          ref={register({ required: true })} />
        {errors.email && <Form.Text className="text-danger" id="emailReq">Required</Form.Text>}
      </Form.Group>

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

export default Login;