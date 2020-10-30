import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import {UserInfoProvider} from './UserContext';
import {HomeRenderProvider} from './HomeRenderContext';

ReactDOM.render(
  <React.StrictMode>
    <HomeRenderProvider>
      <UserInfoProvider>
        <App />
      </UserInfoProvider>
    </HomeRenderProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
