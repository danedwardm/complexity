import axios from "axios";

const api = axios.create({
    baseURL: "https://complexity-3kp9.onrender.com"
});

// Request interceptor to add Authorization header
api.interceptors.request.use(
    config => {
        if (!config.headers.Authorization) {
            const token = localStorage.getItem("jwt-token");

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    error => Promise.reject(error)
);



export default api;
