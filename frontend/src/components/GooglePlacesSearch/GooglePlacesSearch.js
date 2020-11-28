import React, { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { Form, Button } from "react-bootstrap";
import axios from "axios";
import Geocode from "react-geocode";
import "react-datepicker/dist/react-datepicker.css";
import "./GooglePlacesSearch.css";

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

const GooglePlacesSearch = () => {
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

  return (
    <Combobox
      onSelect={async (address) => {
        setValue(address, false);
        clearSuggestions();
        try {
          const results = await getGeocode({address});
          const {lat, lng} = await getLatLng(results[0]);
          // console.log(lat, lng)
        } catch(error) {
          console.log("error: ", error);
        }
        console.log(address);
      }}
    >
      <ComboboxInput
        id="places-input-box"
        name="placesInput"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        disabled={!ready}
        placeholder="Enter an address"
      />
      <ComboboxPopover>
        {status === "OK" &&
          data.map(({ id, description }) => (
            <ComboboxOption key={id} value={description} />
          ))}
      </ComboboxPopover>
    </Combobox>
  )
}

export default GooglePlacesSearch;