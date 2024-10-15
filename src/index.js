import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import '../src/app.css'
import { UserProvider } from './UserContext'; // Adjust the path

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <UserProvider>
  <App />
</UserProvider>,
);

