import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import cookies from 'js-cookie';
import { 
  Navbar,
  Nav, } from 'react-bootstrap';
import {UserContext} from '../../context/UserContext';

const Navigation = (props) => {
  const [user, setUser] = useContext(UserContext);

  const logout = () => {
    // RESET THE GLOBAL VALUES
    setUser({
      LoggedIn: false,
      Username: '',
      Email: '',
      Password: '',
      Token: '',
      ID: ''
    })
    cookies.remove("Token");
    cookies.remove("Avatar");

    props.history.push("/");
  }

  return(
    <Navbar
      className = 'navbar-dark'
      expand="lg" 
      style={{
        backgroundColor: "#000", 
        boxShadow: "0 2px 4px -1px rgba(0,0,0,0.25)",
        // filter: "brightness(0.6)"
      }}>
      <Navbar.Brand>
        <NavLink to="/" style={{color:"#fff", textDecoration:"none"}}>LANParty</NavLink>
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" style ={{color:"#fff"}} />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          {user.LoggedIn === true ? null
            :
              <>
                <Nav.Link>
                  <NavLink to="/signup"style={{color:"#fff"}}>Signup</NavLink>
                </Nav.Link>
                <Nav.Link>
                  <NavLink to="/login"style={{color:"#fff"}}>Login</NavLink>
                </Nav.Link>
              </>
          }
          {user.LoggedIn === true 
            ?
              <>
                <Nav.Link>
                  <NavLink to="/user"style={{color:"#fff"}}>User</NavLink>
                </Nav.Link>
                <Nav.Link href="/" style={{color:"#fff"}} onClick={logout}>
                  Logout
                </Nav.Link>
                <Nav.Link>
                  <NavLink to="/SearchUser"style={{color:"#fff"}}>SearchUser</NavLink>
                </Nav.Link>
              </>
            : null
          }
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}

export default Navigation;