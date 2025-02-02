import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import Coin from './pages/Home/Coin/Coin';
import Register from './pages/Register';
import Login from './pages/Login'; // Login page
import Footer from './components/Footer/Footer';
import { CoinContext } from './context/CoinContext';

const App = () => {
  const { user } = useContext(CoinContext); // Get authentication state

  return (
    <div className='app'>
      <Navbar />
      <Routes>
  <Route path='/' element={user ? <Home /> : <Navigate to='/login' />} />
  <Route path='/home' element={user ? <Home /> : <Navigate to='/login' />} />
  <Route path='/login' element={user ? <Navigate to='/' /> : <Login />} />
  <Route path='/register' element={<Register />} />
  <Route path='/coin/:coinId' element={user ? <Coin /> : <Navigate to='/login' />} />
</Routes>
    </div>
  );
};

export default App;
