/*import axios from "axios";
import { getToken } from "../auth/authStorage";

export const AUTH_API = "http://localhost:8081/api";
export const BLOG_API = "http://localhost:8082/api";
export const TOUR_API = "http://localhost:5281/api";

export const authAxios = axios.create({
  baseURL: AUTH_API,
});

export const blogAxios = axios.create({
  baseURL: BLOG_API,
});

export const tourAxios = axios.create({
  baseURL: TOUR_API,
});

authAxios.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});*/
import axios from "axios";
import { getToken } from "../auth/authStorage";

const GATEWAY_API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export const authAxios = axios.create({
  baseURL: GATEWAY_API,
});

export const blogAxios = axios.create({
  baseURL: GATEWAY_API,
});

export const tourAxios = axios.create({
  baseURL: GATEWAY_API,
});

function attachToken(config) {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}

authAxios.interceptors.request.use(attachToken);
blogAxios.interceptors.request.use(attachToken);
tourAxios.interceptors.request.use(attachToken);