import axios from "axios";

// TODO: update baseApiUrl to server api endpoit instead of mock server

const baseApiUrl = "http://localhost:3000";

const apiCall = async route => {
  const data = await axios.get(`${baseApiUrl}/${route}`);
  return data;
};

export default apiCall;
