import React, { useContext, useState } from 'react';
// import { GoogleMap, Marker } from "react-google-maps"
import { compose, withProps } from "recompose";
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker
} from "react-google-maps";
import { PartiesContext } from '../../context/PartiesContext';
import './googleMap.css'

const MapComponent = compose(
  withProps({
    /**
     * Note: create and replace your own key in the Google console.
     * https://console.developers.google.com/apis/dashboard
     * The key "AIzaSyBkNaAGLEVq0YLQMi-PYEMabFeREadYe1Q" can be ONLY used in this sandbox (no forked).
     */
    googleMapURL:
      `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_MAP_API_KEY}&v=3.exp&libraries=geometry,drawing,places`,
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div className = "mapBox"/>,
    mapElement: <div style={{ height: `100%` }} />
  }),
  withScriptjs,
  withGoogleMap
)(props => (
  <GoogleMap defaultZoom={8} defaultCenter={{ lat: 42.331429, lng: -83.045753 }}>
    {/* {
      // <Marker color="#cdcdcd" position={{ lat: 42.331429, lng: -83.045753 }} />
    } */}
    {props.markerList.map((party, i) => {
        if (party.PartyLocation.Latitude && party.PartyLocation.Longitude) {
          // console.log("TEST", host.Latitude);
         return(<Marker
            key={i}
            position={{
              lat: party.PartyLocation.Latitude,
              lng: party.PartyLocation.Longitude
            }}
            title={party.name}
            pinColor={"#ffd1dc"}
          />)
        }
      })}
  </GoogleMap>
));



const Map = () => {
  const [parties, setParties] = useContext(PartiesContext);
  return (
    <MapComponent markerList={parties} />
  )
}


export default Map;