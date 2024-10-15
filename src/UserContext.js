import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import API_URL from './config';


export const AuthContext = createContext();

export const useUser = () => {
  return useContext(AuthContext);
};

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); // Store user details
  const [currentUserId, setCurrentUserId] = useState(null); // Store current user ID
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // If token exists, fetch current user
      axios
        .get(`${API_URL}/users/current-user`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setCurrentUser(response.data); // Set the current user
          setCurrentUserId(response.data.user_id); // Set user ID from response
          setIsAuthenticated(true); // User is authenticated
          localStorage.setItem('currentUser', JSON.stringify(response.data)); // Save user to localStorage
        })
        .catch((error) => {
          console.error('Error fetching user', error);
          setIsAuthenticated(false); // User not authenticated
        });
    } else {
      setIsAuthenticated(false); // No token means not authenticated
    }
  }, []);

  const setLoggedInUser = (user, token) => {
    if (token) {
      setCurrentUser(user);
      setCurrentUserId(user.user_id); // Set user ID
      localStorage.setItem('token', token); // Save token to localStorage
      localStorage.setItem('currentUser', JSON.stringify(user)); // Save user to localStorage
      setIsAuthenticated(true); // Set user as authenticated
    }
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setCurrentUserId(null); // Clear user ID
    setIsAuthenticated(false); // Set authentication to false
    localStorage.removeItem('token'); // Clear token
    localStorage.removeItem('currentUser'); // Clear user from localStorage
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentUserId,
        setLoggedInUser,
        logoutUser,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
