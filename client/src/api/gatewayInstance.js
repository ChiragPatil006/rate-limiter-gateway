import axios from 'axios';

const gatewayInstance = axios.create({
  baseURL: 'http://localhost:5000/gateway',
});

export default gatewayInstance;