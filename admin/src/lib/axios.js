import axios from "axios";

// If we are in production, requests to '/api' are automatically 
// routed by Vercel to your backend based on vercel.json.
// If in dev, Vite proxies '/api' to localhost:5000.
const baseURL = '/api'; 

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

export default axiosInstance;