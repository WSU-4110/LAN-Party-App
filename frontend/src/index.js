import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import {UserInfoProvider} from './UserContext';

ReactDOM.render(
  <React.StrictMode>
    <UserInfoProvider>
      <App />
    </UserInfoProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
