import React from 'react';
import { useForm } from "react-hook-form";
import { Form, Button } from 'react-bootstrap';

const Login = () => {
  const { register, handleSubmit, watch, errors } = useForm();

  const onSubmit = (data) => {
    console.log("submitted", data)
  }

  return(
    <>
    Login
    </>
  )
}

export default Login;