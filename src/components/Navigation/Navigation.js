import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Navbar,
  Nav,
  NavDropdown } from 'react-bootstrap';

const Navigation = () => {

  const logout = () => {
  }

  return(
    <Navbar bg="primary" expand="lg">
      <Navbar.Brand href="/">React-Bootstrap</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link href="/signup">Signup</Nav.Link>
          <Nav.Link href="/login">Login</Nav.Link>
          <Nav.Link href="/" onClick={logout}>Logout</Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}

export default Navigation;