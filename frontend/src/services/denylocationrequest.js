import axios from 'axios';

export default async (partyID) => {
  const headers = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  const link = `${process.env.REACT_APP_URL}Party/${partyID}`;
  const payload = {
    RequestLocationChange: "void"
  }
  await axios
  .patch(link, payload, headers)
    .then((res) => {
      return res.data;
    })
    .catch((error) => console.log(error));

  // const response = await axios.patch(link, payload);
  // return response;
}