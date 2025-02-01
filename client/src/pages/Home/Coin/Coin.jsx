import React, { useContext, useEffect, useState } from 'react';
import './Coin.css';
import { useParams } from 'react-router-dom';
import { CoinContext } from '../../../context/CoinContext';
import LineChart from '../../../components/LineChart/LineChart';

const Coin = () => {
  const { coinId } = useParams();
  const [coinData, setCoinData] = useState(null);
  const { currency } = useContext(CoinContext);
  const [historicalData, setHistoricalData] = useState(null);
  const [loadingPercentage, setLoadingPercentage] = useState(0);

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

  if (loadingPercentage < 100) {
    return (
      <div className="loading-container">
        <p>Loading... {loadingPercentage}%</p>
      </div>
    );
  }

  if (!coinData || !historicalData) {
    return <div>Error loading data. Please try again later.</div>;
  }

  return (
    <div className="coin">
      {/* Header: Image and Coin Name */}
      <div className="coin-name">
        <img src={coinData.logo_url} alt={coinData.name} />
        <p>
          <strong>
            {coinData.name} ({coinData.symbol.toUpperCase()})
          </strong>
        </p>
      </div>
      
      {/* Chart */}
      <div className="coin-chart">
        <LineChart historicalData={historicalData} />
      </div>

      {/* Coin Information */}
      <div className="coin-info">
        <ul>
          <li>Current Price</li>
          <li>
            {currency.symbol}{' '}
            {coinData.market_price ? Number(coinData.market_price).toLocaleString() : 'N/A'}
          </li>
        </ul>
        <ul>
          <li>Market Cap</li>
          <li>
            {currency.symbol}{' '}
            {coinData.market_cap ? Number(coinData.market_cap).toLocaleString() : 'N/A'}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Coin;
