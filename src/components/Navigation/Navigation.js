import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import cookies from 'js-cookie';
import { 
  Navbar,
  Nav, } from 'react-bootstrap';
import {UserContext} from '../../UserContext';

const Navigation = (props) => {
  const [user, setUser] = useContext(UserContext);

  const logout = () => {
    cookies.remove("Username");
    cookies.remove("ID");
    cookies.remove("Email");
    cookies.remove("Logged");
    // RESET THE GLOBAL VALUES
    setUser({
      LoggedIn: false,
      Username: '',
      Email: '',
      Password: '',
      Token: '',
      ID: ''
    })

    props.history.push("/");
  }

  return(
    <Navbar 
      expand="lg" 
      style={{
        backgroundColor: "#1e2124", 
        boxShadow: "0 2px 4px -1px rgba(0,0,0,0.25)",
        // filter: "brightness(0.6)"
      }}>
      <Navbar.Brand>
        <NavLink to="/" style={{color:"#fff", textDecoration:"none"}}>LANParty</NavLink>
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link>
            <NavLink to="/signup"style={{color:"#fff"}}>Signup</NavLink>
          </Nav.Link>
          <Nav.Link>
            <NavLink to="/login"style={{color:"#fff"}}>Login</NavLink>
          </Nav.Link>
          <Nav.Link>
            <NavLink to="/user"style={{color:"#fff"}}>User</NavLink>
          </Nav.Link>
          <Nav.Link href="/" style={{color:"#fff"}} onClick={logout}>
            Logout
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}

export default Navigation;