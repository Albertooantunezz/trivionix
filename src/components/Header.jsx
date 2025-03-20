// src/components/Header.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser } from '@fortawesome/free-solid-svg-icons';

const Header = () => {
  const { currentUser } = useAuth();

  return (
    <header className="header">
      <Link to="/" style={{ fontSize: "50px" }}>Trivionix</Link>
      
      
      <Link to={currentUser ? "/profile" : "/login"} style={{ fontSize: "40px" }}>
        <FontAwesomeIcon icon={faCircleUser} />
      </Link>
    </header>
  );
};

export default Header;