import axios from 'axios';

export default async partyID => {
  const link = `${process.env.REACT_APP_URL}Party/${partyID}`;
  const response = await axios.get(link);
  return response.data.Party;
}