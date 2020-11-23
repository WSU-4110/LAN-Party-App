import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const NewLocationModal = (props) => {

  return (
    <Modal
      show={props.show}
      size="sm"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Request New Location</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <input/>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="primary" onClick={props.onHide}>Submit</Button>
      </Modal.Footer>

    </Modal>
  )
}

export default NewLocationModal;