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
  const [loadingPercentage, setLoadingPercentage] = useState(0); // New state for percentage

  useEffect(() => {
    const fetchCoinData = async () => {
      try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`, {
          method: 'GET',
          headers: {
            accept: 'application/json',
            'x-cg-demo-api-key': 'CG-vr9q42xzksSXXNze9mYXezYy',
          },
        });
        const data = await response.json();
        setCoinData(data);
        setLoadingPercentage((prev) => prev + 50); // Increment loading progress
      } catch (error) {
        console.error('Error fetching coin data:', error);
      }
    };

    const fetchHistoricalData = async () => {
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=${currency.name}&days=10&interval=daily`,
          {
            method: 'GET',
            headers: {
              accept: 'application/json',
              'x-cg-demo-api-key': 'CG-vr9q42xzksSXXNze9mYXezYy',
            },
          }
        );
        const data = await response.json();
        setHistoricalData(data);
        setLoadingPercentage((prev) => prev + 50); // Increment loading progress
      } catch (error) {
        console.error('Error fetching historical data:', error);
      }
    };

    setLoadingPercentage(0); // Reset loading progress
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

  if (!coinData || !coinData.image || !historicalData) {
    return <div>Error loading data. Please try again later.</div>; // Handle null data gracefully
  }

  return (
    <div className="coin">
      <div className="coin-name">
        <img src={coinData.image.large} alt={`${coinData.name}`} />
        <p>
          <strong>{coinData.name} ({coinData.symbol.toUpperCase()})</strong>
        </p>
      </div>
      <div className="coin-chart">
        <LineChart historicalData={historicalData} />
      </div>
      <div className="coin-info">
        <ul>
          <li>Crypto Market Rank</li>
          <li>{coinData.market_cap_rank}</li>
        </ul>
        <ul>
          <li>Current Price</li>
          <li>{currency.symbol} {coinData.market_data.current_price[currency.name].toLocaleString()}</li>
        </ul>
        <ul>
          <li>Market Cap</li>
          <li>{currency.symbol} {coinData.market_data.market_cap[currency.name].toLocaleString()}</li>
        </ul>
        <ul>
          <li>24 Hour High</li>
          <li>{currency.symbol} {coinData.market_data.high_24h[currency.name].toLocaleString()}</li>
        </ul>
        <ul>
          <li>24 Hour Low</li>
          <li>{currency.symbol} {coinData.market_data.low_24h[currency.name].toLocaleString()}</li>
        </ul>
      </div>
    </div>
  );
};

export default Coin;
