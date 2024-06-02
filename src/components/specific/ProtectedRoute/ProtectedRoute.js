import { message } from 'antd';
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ component }) => {
  const userConnected = JSON.parse(sessionStorage.getItem('userConnected')); // Replace with your auth logic
  const isAuth = userConnected && userConnected !== undefined && userConnected !== null;
  if (!isAuth) {
    message.info("Vous n'êtes pas autorisé à accéder à cette page, veuillez vous connecter pour continuer");
  }

  return isAuth ? component : <Navigate to="/login" />;
};

export default ProtectedRoute;
