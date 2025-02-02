import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CoinContext } from '../../context/CoinContext';

const Navbar = () => {
  const { user, setUser } = useContext(CoinContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/logout', {
        method: 'POST',
        credentials: 'include', // Include cookies in the request
      });
      if (response.ok) {
        // Clear user from context and navigate to login page
        setUser(null);
        navigate('/login');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <Link to="/" style={styles.link}>
          Home
        </Link>
        {/* Additional navigation links can be added here */}
      </div>
      <div style={styles.right}>
        {user ? (
          <>
            <span style={styles.userText}>Welcome, {user.email}</span>
            <button onClick={handleLogout} style={styles.logoutButton}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>
              Login
            </Link>
            <Link to="/register" style={styles.link}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#007BFF',
  },
  left: {
    display: 'flex',
    gap: '1rem',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
  userText: {
    color: 'white',
  },
  logoutButton: {
    padding: '8px 12px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default Navbar;
