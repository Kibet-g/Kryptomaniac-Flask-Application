import React, { useContext, useEffect, useState } from 'react';
import swal from 'sweetalert';
import { useParams } from 'react-router-dom';
import { CoinContext } from '../../../context/CoinContext';
import LineChart from '../../../components/LineChart/LineChart';

const Coin = () => {
  const { coinId } = useParams();
  const [coinData, setCoinData] = useState(null);
  const { currency, user } = useContext(CoinContext); // Access user from context
  const [historicalData, setHistoricalData] = useState(null);
  const [loadingPercentage, setLoadingPercentage] = useState(0);
  const [alertPrice, setAlertPrice] = useState('');

  // Inline CSS styles
  const containerStyle = {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '800px',
    margin: '0 auto',
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
  };

  const imageStyle = {
    width: '50px',
    height: '50px',
    marginRight: '15px',
  };

  const chartStyle = {
    margin: '20px 0',
    padding: '10px',
    border: '1px solid #eee',
    borderRadius: '8px',
  };

  const infoContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '20px',
  };

  const infoListStyle = {
    listStyleType: 'none',
    padding: 0,
    margin: 0,
    textAlign: 'left',
  };

  const infoItemTitleStyle = {
    fontWeight: 'bold',
    marginBottom: '5px',
  };

  const inputStyle = {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    marginRight: '10px',
    width: '200px',
  };

  const buttonStyle = {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  };

  const loadingContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '24px',
  };

  useEffect(() => {
    const fetchCoinData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/cryptocurrencies/${coinId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        const data = await response.json();
        setCoinData(data);
        setLoadingPercentage((prev) => prev + 50);
      } catch (error) {
        console.error('Error fetching coin data:', error);
      }
    };

    const fetchHistoricalData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/price-history/${coinId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        setHistoricalData(data);
        setLoadingPercentage((prev) => prev + 50);
      } catch (error) {
        console.error('Error fetching historical data:', error);
      }
    };

    // Reset loading percentage and fetch new data whenever currency or coinId changes
    setLoadingPercentage(0);
    fetchCoinData();
    fetchHistoricalData();
  }, [currency, coinId]);

  const handleAddToWatchlist = async () => {
    if (!user) {
      swal("Not Logged In", "Please log in to add cryptocurrencies to your watchlist.", "warning");
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/user-cryptocurrencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          crypto_id: coinId,
          alert_price: alertPrice,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        swal("Success", "Cryptocurrency added to your watchlist!", "success");
      } else {
        swal("Error", data.error || "Something went wrong", "error");
      }
    } catch (error) {
      console.error('Error adding cryptocurrency:', error);
      swal("Error", "An unexpected error occurred.", "error");
    }
  };

  if (loadingPercentage < 100) {
    return (
      <div style={loadingContainerStyle}>
        <p>Loading... {loadingPercentage}%</p>
      </div>
    );
  }

  if (!coinData || !historicalData) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Error loading data. Please try again later.</div>;
  }

  return (
    <div style={containerStyle}>
      {/* Header: Image and Coin Name */}
      <div style={headerStyle}>
        <img src={coinData.logo_url} alt={coinData.name} style={imageStyle} />
        <p style={{ fontSize: '24px', margin: 0 }}>
          <strong>
            {coinData.name} ({coinData.symbol.toUpperCase()})
          </strong>
        </p>
      </div>
      
      {/* Chart */}
      <div style={chartStyle}>
        <LineChart historicalData={historicalData} />
      </div>

      {/* Coin Information */}
      <div style={infoContainerStyle}>
        <ul style={infoListStyle}>
          <li style={infoItemTitleStyle}>Current Price</li>
          <li>
            {currency.symbol}{' '}
            {coinData.market_price ? Number(coinData.market_price).toLocaleString() : 'N/A'}
          </li>
        </ul>
        <ul style={infoListStyle}>
          <li style={infoItemTitleStyle}>Market Cap</li>
          <li>
            {currency.symbol}{' '}
            {coinData.market_cap ? Number(coinData.market_cap).toLocaleString() : 'N/A'}
          </li>
        </ul>
      </div>

      {/* Alert Price Input and Button */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <input
          type="number"
          placeholder="Set Alert Price"
          value={alertPrice}
          onChange={(e) => setAlertPrice(e.target.value)}
          style={inputStyle}
        />
        <button onClick={handleAddToWatchlist} style={buttonStyle}>
          Add to Watchlist
        </button>
      </div>
    </div>
  );
};

export default Coin;
