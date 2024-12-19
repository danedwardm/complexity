import { useContext, createContext, useState } from "react";

import api from "../api/axiosInstance";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(localStorage.getItem("username") || "");
  const [token, setToken] = useState(localStorage.getItem("jwt-token") || "");
  const registerAction = async (data) => {
    try {
        const res = await api.post('/register', data)
        if(res){
            return res
        }
        throw new Error(res.message)
    } catch (error) {
        console.error(err);  
    }
  }

  const loginAction = async (data) => {
    try {
      const res = await api.post('/login', new URLSearchParams(data))
      if (res.data) {
        setUser(res.data.username)
        localStorage.setItem('jwt-token', res.data.access_token);
        localStorage.setItem('username', res.data.username);
        setToken(res.data.access_token)
        return res
      }
      throw new Error(res.message);
    } catch (err) {
      console.error(err);
    }
  };

  const logOut = () => {
    const token = localStorage.getItem('jwt-token');
    if(!token){
        setUser("");
       setToken("");      
       window.location.href = '/login'
    }
    setUser("");
    setToken("");
    localStorage.removeItem("jwt-token");

  };

  return (
    <AuthContext.Provider value={{ token, user, loginAction, logOut, registerAction }}>
      {children}
    </AuthContext.Provider>
  );

};

export default AuthProvider;

export const useAuth = () => {
  return useContext(AuthContext);
};
