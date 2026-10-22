import React from 'react';
import ReactDOM from 'react-dom/client';
import { Modal } from 'antd';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import ThemeProvider from './utils/providers/ThemeProvider';
import { LoadingProvider } from './utils/providers/LoadingProvider';

// Empêche la fermeture de toutes les modales de l'app au clic en dehors (sur le mask).
// Une modale peut toujours l'autoriser explicitement en passant maskClosable={true}.
Modal.defaultProps = {
  ...Modal.defaultProps,
  maskClosable: false,
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <LoadingProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </LoadingProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
