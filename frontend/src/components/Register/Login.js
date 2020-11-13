import React, {useContext} from 'react';
import { useForm } from "react-hook-form";
import { Form, Button } from 'react-bootstrap';
import { UserContext } from '../../context(Models)/UserContext';
import axios from 'axios';
import cookies from 'js-cookie';
import crypto from 'crypto-js'
import './Register.css'

const Login = (props) => {
  const { REACT_APP_URL, REACT_APP_SECRET_KEY } = process.env;
  const [user, setUser] = useContext(UserContext);
  const { register, handleSubmit, errors } = useForm();

  const onSubmit = (data) => {
    const payload = {
      Email: data.email,
      Password: data.password,
    }

    const headers = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const link = `${REACT_APP_URL}SignIn`;

    axios
      .post(link, payload, headers)
      .then(res => {
        let avatar = res.data.Avatar ? res.data.Avatar : 'https://images.unsplash.com/photo-1602254872083-22caf4166bd7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60';
        // secure the ID
        let secureID = crypto.AES.encrypt(res.data.ID, REACT_APP_SECRET_KEY);

        let inAnHour = new Date(new Date().getTime() + 60 * 60 * 1000);
        cookies.set("Token", secureID, {expires: inAnHour});
        setUser({
          ...res.data,
          LoggedIn: true,
          Avatar: avatar,
          Token: cookies.get("Token")
        })
      })
      .catch((error) => console.log(error));

    props.history.push("/");
  }



  return(
    <div className="form-container">
      <div className="form-content">
        <div className="component-header">
          <h2>Login</h2>
        </div>
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
            <div style={{textAlign:"center"}}>
              <Button variant="primary" type="submit">
                Submit
              </Button>
            </div>
          </Form>
      </div>
    </div>
  )
}

export default Login;