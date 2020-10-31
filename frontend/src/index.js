import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import {UserInfoProvider} from './context/UserContext';
import {PartiesInfoProvider} from './context/PartiesContext';
import {HomeRenderProvider} from './context/HomeRenderContext';

ReactDOM.render(
  <React.StrictMode>
    <HomeRenderProvider>
      <UserInfoProvider>
        <PartiesInfoProvider>
          <App />
        </PartiesInfoProvider>
      </UserInfoProvider>
    </HomeRenderProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
