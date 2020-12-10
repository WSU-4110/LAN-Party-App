import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import cookies from 'js-cookie';
import { 
  Navbar,
  Nav,
  Button } from 'react-bootstrap';
import {UserContext} from '../../context/UserContext';
import '../Navigation/Navigation.css'
import logo from './imgs/onlyLansLogo.png'

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
  }

  const renderUserNavButton = () => (
    <Nav.Link className="xs-mt user-nav-button">
      <NavLink to="/user" style={{textDecoration:"none",color:"#fff"}}>
        <span><img style={{width:"35px",height:"35px",borderRadius:"50%"}} src={user.Avatar}/></span>
        <span style={{marginLeft:"10px"}}>{user.Username}</span>
      </NavLink>
    </Nav.Link>
  );

  return(
    <Navbar
      className = 'navbar-dark'
      expand="md" 
      style={{
        backgroundColor: "#000", 
        boxShadow: "0 2px 4px -1px rgba(0,0,0,0.25)",
      }}>
      <Navbar.Brand>
        <NavLink to="/" style={{color:"#fff", textDecoration:"none"}}>LANParty</NavLink>
        {/* {user.LoggedIn && renderUserNavButton()} */}
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" style ={{color:"#fff"}} />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ml-auto">
          {user.LoggedIn === true 
            ?     
              <>
                {renderUserNavButton()}
                <Nav.Link className="nav-link-button">
                  <NavLink to="/login" style={{color:"#fff"}} onClick={logout}>
                    Logout
                  </NavLink>
                </Nav.Link>
                <Nav.Link className="nav-link-button">
                  <NavLink to="/SearchUser"style={{color:"#fff"}}>SearchUser</NavLink>
                </Nav.Link>
              </>
            :
              <>
                <Nav.Link className="nav-link-button">
                  <NavLink to="/signup"style={{color:"#fff"}}>Signup</NavLink>
                </Nav.Link>
                <Nav.Link className="nav-link-button">
                  <NavLink to="/login"style={{color:"#fff"}}>Login</NavLink>
                </Nav.Link>
              </>
          }
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}

export default Navigation;