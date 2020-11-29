import axios from 'axios';

export default async (id) => {
  const headers = {
    headers: {
      "Content-Type": "application/json"
    }
  };
  const link = `${process.env.REACT_APP_URL}Account/${id}`;
  const response = await axios.get(link, headers);
  return response.data.Account;
}