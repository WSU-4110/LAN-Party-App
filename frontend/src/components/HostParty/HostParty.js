import React, { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { Form, Button } from "react-bootstrap";
import DatePicker from "react-datepicker";
import axios from "axios";
import Geocode from "react-geocode";
import { UserContext } from "../../context/UserContext";
import { PartiesContext } from "../../context/PartiesContext";
import { HomeRenderContext } from "../../context/HomeRenderContext";
import "react-datepicker/dist/react-datepicker.css";
import "./HostParty.css";
import moment from "moment";
import GooglePlacesSearch from '../GooglePlacesSearch/GooglePlacesSearch'

Geocode.setApiKey(process.env.REACT_APP_MAP_GEOCODE_KEY);
Geocode.setLanguage("en");
Geocode.enableDebug();

const HostParty = (props) => {
  const { REACT_APP_URL } = process.env;
  const [user, setUser] = useContext(UserContext);
  const [parties, setParties] = useContext(PartiesContext);
  const [homeRender, setHomeRender] = useContext(HomeRenderContext);
  const { register, handleSubmit, errors } = useForm();
  const [startDate, setStartDate] = useState(new Date());

  const getLatitude = async (address) => {
    let loc = await Geocode.fromAddress(address);
    return loc.results[0].geometry.location.lat;
  };
  const getLongitude = async (address) => {
    let loc = await Geocode.fromAddress(address);
    return loc.results[0].geometry.location.lng;
  };

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

  const onSubmit = async (data, e) => {
    let latitude = await getLatitude(e.target.placesInput.value);
    let longitude = await getLongitude(e.target.placesInput.value);

    const payload = {
      Host: user.ID,
      HostUsername: user.Username,
      PartyName: data.Title,
      PartyLocation: {
        Name: e.target.placesInput.value,
        Latitude: latitude,
        Longitude: longitude,
      },
      PartyTime: moment(startDate).format("MMMM DD, yyyy hh:mm a"),
      HardwareReq: data.Hardware,
      MinAge: data.Age,
      Notes: data.Notes,
    };
    const headers = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const link = `${REACT_APP_URL}CreateParty`;
    axios
      .post(link, payload, headers)
      .then((res) => {
        console.log(res);
        getParties();
        setHomeRender({ render: !homeRender.render });
      })
      .catch((error) => console.log(error));

    console.log(payload);

    props.history.push("/");
  };

  return (
    <div className="form-container">
      <div className="form-content">
        <div className="component-header">
          <h2>Create Party</h2>
        </div>
        <Form onSubmit={handleSubmit(onSubmit)} autocomplete="off">
          <Form.Group controlId="formTitle">
            <Form.Label>Party Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Party Title"
              name="Title"
              aria-describedby="titleReq"
              ref={register({ required: true })}
            />
            {errors.email && (
              <Form.Text className="text-danger" id="emailReq">
                Required
              </Form.Text>
            )}
          </Form.Group>

          {/* Location */}
          <Form.Group controlId="formEmail">
            <Form.Label>Set Location</Form.Label>
            <GooglePlacesSearch />
            {/* <Form.Control
              type="text"
              placeholder="Set Location"
              name="Location"
              aria-describedby="locationReq"
              ref={register({ required: true })}
            /> */}
            {/* {errors.email && (
              <Form.Text className="text-danger" id="locationReq">
                Required
              </Form.Text>
            )} */}
          </Form.Group>

          {/* Date */}
          <Form.Group controlId="formDate">
            <Form.Label>Set Date</Form.Label>
            <br />
            <DatePicker
              id="party-time-picker"
              name="something"
              ref={register({ required: true })}
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              showTimeSelect
              excludeTimes={
                [
                  // setHours(setMinutes(new Date(), 0), 17),
                  // setHours(setMinutes(new Date(), 30), 18),
                  // setHours(setMinutes(new Date(), 30), 19),
                  // setHours(setMinutes(new Date(), 30), 17)
                ]
              }
              dateFormat="MMMM dd, yyyy h:mm a"
            />
          </Form.Group>

          {/* Hardware Requirements */}
          <Form.Group controlId="formRequirements">
            <Form.Label>Set Hardware Requirements</Form.Label>
            <Form.Control
              type="text"
              rows={3}
              placeholder="Set Hardware Requirements"
              name="Hardware"
              aria-describedby="hardwareReq"
              ref={register({ required: true })}
            />
            {errors.email && (
              <Form.Text className="text-danger" id="hardwareReq">
                Required
              </Form.Text>
            )}
          </Form.Group>

          {/* Minimum Age */}
          <Form.Group controlId="formMinAge">
            <Form.Label>Minimum Age</Form.Label>
            <Form.Control
              type="number"
              min="16"
              max="100"
              placeholder="Set Minimum Age"
              name="Age"
              aria-describedby="ageReq"
              ref={register({ required: true })}
            />
            {errors.email && (
              <Form.Text className="text-danger" id="ageReq">
                Required
              </Form.Text>
            )}
          </Form.Group>

          {/* Additional Notes */}
          <Form.Group controlId="formAdditionalNotes">
            <Form.Label>Additional Notes</Form.Label>
            <Form.Control
              type="text"
              placeholder="Any additional notes?"
              name="Notes"
              aria-describedby="notesReq"
              ref={register({ required: false })}
            />
            {errors.email && (
              <Form.Text className="text-danger" id="notesReq">
                Required
              </Form.Text>
            )}
          </Form.Group>

          <div style={{ textAlign: "center" }}>
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </div>

          {/* Restrictions */}
          {/* Age, Alcohol */}
          {/* Party Size */}
          {/* Casual / Ranked */}
        </Form>
      </div>
    </div>
  );
};

export default HostParty;
