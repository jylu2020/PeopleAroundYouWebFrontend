import React from 'react';
import { Icon } from 'antd';
import logo from '../assets/logo.svg';
import '../styles/Topbar.css';

export function Topbar(props) {
  return (
    <header className="App-header">
      <h1 className="App-title">People Around You</h1>
      {
        props.isLoggedIn ?
          <a onClick={props.handleLogout} className="logout">
            <Icon type="logout" />
            {' '}Logout
          </a> :
          null
      }
    </header>
  );
}
