import React from 'react';
import { 
  Navbar,
  Nav, } from 'react-bootstrap';

const Navigation = () => {

  const logout = () => {
  }

  return(
    <Navbar 
      expand="lg" 
      style={{
        backgroundColor: "#1e2124", 
        boxShadow: "0 2px 4px -1px rgba(0,0,0,0.25)",
        // filter: "brightness(0.6)"
      }}>
      <Navbar.Brand href="/" style={{color:"#fff"}}>LANParty</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link href="/signup"style={{color:"#fff"}}>Signup</Nav.Link>
          <Nav.Link href="/login"style={{color:"#fff"}}>Login</Nav.Link>
          <Nav.Link href="/user"style={{color:"#fff"}}>User</Nav.Link>
          <Nav.Link href="/" style={{color:"#fff"}} onClick={logout}>Logout</Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}

export default Navigation;