import axios from 'axios';

export default async (partyID, friendID) => {
  const headers = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  const Link = `${process.env.REACT_APP_URL}Party/${partyID}`;
  const payload={
    Attendees: {
      Add: friendID
    }
  }
  console.log("payload", payload)
  axios
  .patch(Link, payload, headers)
  .then((res) => {
    // props.changeArray(res.data.Attributes.Attendees);
    console.log(res.data);
    return (res.data);
  })
  .catch((error) => console.log(error));
};