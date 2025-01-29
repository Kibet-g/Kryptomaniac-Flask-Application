import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { CoinContext } from '../../context/CoinContext';
import './Home.css';

const Home = () => {
  const { allCoin, currency } = useContext(CoinContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const coinsPerPage = 10; // Number of coins per page

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when search query changes
  };

  // Handle search submit (optional if needed)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log('Searching for: ', searchQuery);
  };

  // Ensure allCoin is always an array
  const safeAllCoin = allCoin || [];

  // Filter coins based on search query
  const filteredCoins = safeAllCoin.filter(coin =>
    coin.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get the current coins to display based on pagination
  const indexOfLastCoin = currentPage * coinsPerPage;
  const indexOfFirstCoin = indexOfLastCoin - coinsPerPage;
  const currentCoins = filteredCoins.slice(indexOfFirstCoin, indexOfLastCoin);

  // Handle next page
  const nextPage = () => {
    setCurrentPage(prevPage => prevPage + 1);
  };

  // Handle previous page
  const prevPage = () => {
    setCurrentPage(prevPage => prevPage - 1);
  };

  return (
    <div className="home">
      {safeAllCoin.length === 0 ? (
        <p>Loading data...</p>
      ) : (
        <div className="bubble-background">
          <div className="hero">
            {/* Search Form */}
            <form onSubmit={handleSearchSubmit}>
              <input 
                type="text" 
                placeholder="Search for a coin..." 
                value={searchQuery} 
                onChange={handleSearchChange} 
              />
              <button type="submit">Search</button>
            </form>
          </div>

          <div className="crypto-table">
            {/* Table Header */}
            <div className="table-layout">
              <p>#</p>
              <p>Coin</p>
              <p>Price ({currency.symbol})</p>
              <p>24h Change</p>
              <p>Market Cap</p>
            </div>

            {/* Table Content - filtered based on search and paginated */}
            {currentCoins.map((coin, index) => (
              <Link to={`/coin/${coin.id}`} className="table-layout" key={coin.id}>
                <p>{indexOfFirstCoin + index + 1}</p> {/* Adjust index based on pagination */}
                <div>
                  <img src={coin.image} alt={coin.name} />
                  <p>{coin.name}</p>
                </div>
                <p>{currency.symbol}{coin.current_price ? coin.current_price.toLocaleString() : 'N/A'}</p>
                <p className={coin.price_change_percentage_24h > 0 ? 'green' : 'red'}>
                  {coin.price_change_percentage_24h ? coin.price_change_percentage_24h.toFixed(2) : 'N/A'}%
                </p>
                <p className="market-cap">
                  {currency.symbol}{coin.market_cap ? coin.market_cap.toLocaleString() : 'N/A'}
                </p>
              </Link>
            ))}

            {/* Pagination Controls */}
            <div className="pagination">
              <button 
                onClick={prevPage} 
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <button 
                onClick={nextPage} 
                disabled={indexOfLastCoin >= filteredCoins.length}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
