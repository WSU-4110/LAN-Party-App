import React, { useState, useContext } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from 'axios';
import GooglePlacesSearch from "../GooglePlacesSearch/GooglePlacesSearch";
import { PartiesContext } from "../../context/PartiesContext";
import "./NewLocationModal.css";

import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "@reach/combobox";
import "@reach/combobox/styles.css";

const NewLocationModal = (props) => {
  const [parties, setParties] = useContext(PartiesContext);
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);
  const [address, setAddress] = useState("");

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      location: { lat: () => 42.331429, lng: () => -83.045753 },
      radius: 200 * 1000, // 200m
    },
  });

  const handleInput = (e) => {
    // Update the keyword of the input element
    setValue(e.target.value);
  };

  const handleSelect = ({ description }) => () => {
    // When user selects a place, we can replace the keyword without request data from API
    // by setting the second parameter to "false"
    setValue(description, false);
    setAddress(description);
    clearSuggestions();

    getGeocode({ address: description })
      .then((results) => getLatLng(results[0]))
      .then(({ lat, lng }) => {
        let m = { lat, lng };
        setLat(m.lat);
        setLng(m.lng);
      })
      .catch((error) => {
        console.log("Error: ", error);
      });
  };

  const renderSuggestions = () =>
    data.map((suggestion) => {
      const {
        place_id,
        structured_formatting: { main_text, secondary_text },
      } = suggestion;

      return (
        <li
          className="suggestion-li"
          key={place_id}
          onClick={handleSelect(suggestion)}
        >
          <strong>{main_text}</strong> <small>{secondary_text}</small>
        </li>
      );
    });

  const getParties = () => {
    const link = `${process.env.REACT_APP_URL}Parties`;
    axios
      .get(link)
      .then((res) => {
        console.log("parties", res);
        setParties(res.data.Parties);
      })
      .catch((error) => console.log(error))
  } 

  const requestNewLocation = (e) => {
    e.preventDefault();
    console.log("target", e.target.requestTitle.value);
    const headers = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const link = `${process.env.REACT_APP_URL}Party/RequestLocation/${props.partyID}`;
    const payload = {
      Title: e.target.requestTitle.value,
      Body: e.target.requestBody.value ? e.target.requestBody.value : "",
      User: props.userID,
      RequestLocation: {
        Name: address,
        Latitude: lat,
        Longitude: lng,
      },
    };
    axios
      .patch(link, payload, headers)
      .then(res => {
        console.log(res);
        props.getParty();
        getParties();
      })
      .catch(err => {
        console.log("Error: ", err);
      })

    console.log("location request called", payload);
    console.log("link: ", link);
    console.log("party id: ", props.partyID);
    console.log("party id type", typeof props.partyID);
    props.onHide();
  };

  return (
    <Modal show={props.show} size="sm" onHide={props.onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Request New Location</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <form onSubmit={requestNewLocation}>
          <div className="mb-2">
            <span>Title:</span>
            <input
              name="requestTitle"
              className="places-input-box"
              type="text"
              placeholder="Request Name"
              required
            />
          </div>
          <div>
            <span>Address:</span>
            <input
              className="places-input-box"
              name="googlePlacesSearch"
              value={value}
              onChange={handleInput}
              disabled={!ready}
              placeholder="New Location"
              autocomplete="off"
              required
            />
            {status === "OK" && (
              <ul className="suggestion-ul">{renderSuggestions()}</ul>
            )}
          </div>

          <div className="mt-2">
            <span>Request Reason:</span>
            <textarea
              name="requestBody"
              className="places-input-box"
            ></textarea>
          </div>
          <Button className="mt-2" variant="primary" type="submit">
            Submit
          </Button>
        </form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="danger" onClick={props.onHide}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NewLocationModal;
