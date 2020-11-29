import Geocode from "react-geocode";
Geocode.setApiKey(process.env.REACT_APP_MAP_GEOCODE_KEY);

export default async (address) => {
  let loc = await Geocode.fromAddress(address);
  return loc.results[0].geometry.location.lat;
};