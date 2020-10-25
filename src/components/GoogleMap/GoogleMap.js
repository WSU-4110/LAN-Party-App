import React, { useState } from 'react';
// import { GoogleMap, Marker } from "react-google-maps"
import { compose, withProps } from "recompose";
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker
} from "react-google-maps";

let tempList = [
  {
    Host: "Thadd",
    Name: "Detroit LAN",
    Location: "Detroit",
    Latitude: 42.331427,
    Longitude: -83.0457538,
    Date: "Thu Oct 22 2020 00:58:34 GMT-0400"
  },
  {
    Host: "Thadd",
    Name: "Paris LAN",
    Location: "Paris",
    Latitude: 48.856614,
    Longitude: 2.3522219,
    Date: "Thu Oct 22 2020 00:58:34 GMT-0400"
  }
]

const MapComponent = compose(
  withProps({
    /**
     * Note: create and replace your own key in the Google console.
     * https://console.developers.google.com/apis/dashboard
     * The key "AIzaSyBkNaAGLEVq0YLQMi-PYEMabFeREadYe1Q" can be ONLY used in this sandbox (no forked).
     */
    googleMapURL:
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyAHoOsaxhFYc2fQlGdr-5Mdep3UVkfpfP4&v=3.exp&libraries=geometry,drawing,places",
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: `400px` }} />,
    mapElement: <div style={{ height: `100%` }} />
  }),
  withScriptjs,
  withGoogleMap
)(props => (
  <GoogleMap defaultZoom={8} defaultCenter={{ lat: 42.331429, lng: -83.045753 }}>
    {/* {
      // <Marker color="#cdcdcd" position={{ lat: 42.331429, lng: -83.045753 }} />
    } */}
    {tempList.map((host, i) => {
        if (host.Latitude && host.Longitude) {
          console.log("TEST", host.Latitude);
         return(<Marker
            key={i}
            position={{
              lat: host.Latitude,
              lng: host.Longitude
            }}
            title={host.name}
            pinColor={"#ffd1dc"}
          />)
        }
      })}
  </GoogleMap>
));

export default MapComponent;