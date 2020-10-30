import React, {useContext} from 'react';
import { useForm } from "react-hook-form";
import { Form, Button } from 'react-bootstrap';
import { UserContext } from '../../UserContext';
import axios from 'axios';
import cookies from 'js-cookie';
import './Register.css'

const Login = (props) => {
  const { REACT_APP_URL } = process.env;
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
        console.log(res);
        setUser({
          ...res.data,
          LoggedIn: true
        })
        let inAnHour = new Date(new Date().getTime() + 60 * 60 * 1000);
        cookies.set("Username", res.data.Username, {expires: inAnHour});
        cookies.set("ID", res.data.ID, {expires: inAnHour});
        cookies.set("Email", res.data.Email);
        cookies.set("Logged", "true", {expires: inAnHour});
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