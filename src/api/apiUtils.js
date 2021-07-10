import axios from "axios";

const baseApiUrl = process.env.REACT_APP_BASEURL;

const apiCall = async route => {
  const data = await axios.get(`${baseApiUrl}/${route}`);
  return data;
};

export default apiCall;
