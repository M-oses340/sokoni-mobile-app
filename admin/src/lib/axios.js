import axios from "axios";

// Determine the correct backend URL
const baseURL = import.meta.env.MODE === 'production' 
  ? 'https://sokoni-mobile-app.vercel.app/api' // Replace with your actual backend URL
  : '/api'; // Keep using the proxy for local development

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

export default axiosInstance;