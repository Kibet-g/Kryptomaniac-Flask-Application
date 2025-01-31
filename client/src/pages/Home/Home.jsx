import React, { useEffect, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { CoinContext } from '../../context/CoinContext';

const Home = () => {
  const { currency } = useContext(CoinContext);
  const [allCoin, setAllCoin] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const coinsPerPage = 100;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/cryptocurrencies');
        const data = await response.json();
        console.log('Fetched Data:', data);
        setAllCoin(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const filteredCoins = allCoin.filter(
    (coin) =>
      coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchQuery.toLowerCase()) // Now includes symbol search
  );

  const indexOfLastCoin = currentPage * coinsPerPage;
  const indexOfFirstCoin = indexOfLastCoin - coinsPerPage;
  const currentCoins = filteredCoins.slice(indexOfFirstCoin, indexOfLastCoin);

  const totalPages = Math.ceil(filteredCoins.length / coinsPerPage);
  const nextPage = () => setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  const prevPage = () => setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));

  return (
    <div
      style={{
        padding: '10px',
        background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(0,123,255,0.5) 70%)',
        minHeight: '100vh',
      }}
    >
      {loading ? (
        <p style={{ textAlign: 'center', fontSize: '18px' }}>Loading data...</p>
      ) : (
        <div>
          {/* Search Bar */}
          <div
            style={{
              maxWidth: '600px',
              margin: '50px auto',
              textAlign: 'center',
            }}
          >
            <form
              onSubmit={(e) => e.preventDefault()}
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '10px',
              }}
            >
              <input
                type="text"
                placeholder="Search for a coin..."
                value={searchQuery}
                onChange={handleSearchChange}
                style={{
                  padding: '10px',
                  border: '2px solid #ccc',
                  borderRadius: '5px',
                  fontSize: '16px',
                  width: '60%',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '10px 15px',
                  border: 'none',
                  borderRadius: '5px',
                  backgroundColor: '#007BFF',
                  color: 'white',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                Search
              </button>
            </form>
          </div>

          {/* Coin List */}
          <div
            style={{
              maxWidth: '900px',
              margin: '20px auto',
              padding: '15px',
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '10px',
              boxShadow: '0 0 10px rgba(0,0,0,0.2)',
            }}
          >
            {/* Table Header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '0.5fr 2fr 1fr 1fr 1.5fr',
                padding: '15px',
                fontWeight: 'bold',
                backgroundColor: '#007BFF',
                color: 'white',
                borderRadius: '5px',
              }}
            >
              <p>#</p>
              <p>Coin</p>
              <p>Price ({currency.symbol || '$'})</p>
              <p>24h Change</p>
              <p>Market Cap</p>
            </div>

            {currentCoins.map((coin, index) => (
              <Link
                to={`/coin/${coin.id}`}
                key={coin.id}
                style={{ textDecoration: 'none', color: 'black' }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '0.5fr 2fr 1fr 1fr 1.5fr',
                    padding: '12px',
                    borderBottom: '1px solid #ddd',
                    alignItems: 'center',
                  }}
                >
                  <p>{indexOfFirstCoin + index + 1}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={coin.image || 'https://via.placeholder.com/30'}
                      alt={coin.name}
                      style={{ width: '30px' }}
                    />
                    <p>{coin.name} ({coin.symbol.toUpperCase()})</p>
                  </div>
                  <p>
                    {currency.symbol || '$'}
                    {coin.current_price ? coin.current_price.toLocaleString() : 'N/A'}
                  </p>
                  <p
                    style={{
                      color: coin.price_change_percentage_24h > 0 ? 'green' : 'red',
                    }}
                  >
                    {coin.price_change_percentage_24h
                      ? coin.price_change_percentage_24h.toFixed(2)
                      : 'N/A'}
                    %
                  </p>
                  <p>
                    {currency.symbol || '$'}
                    {coin.market_cap ? coin.market_cap.toLocaleString() : 'N/A'}
                  </p>
                </div>
              </Link>
            ))}

            {/* Pagination */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                margin: '20px 0',
              }}
            >
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                style={{
                  padding: '10px 15px',
                  margin: '0 5px',
                  border: 'none',
                  borderRadius: '5px',
                  backgroundColor: currentPage === 1 ? 'gray' : '#007BFF',
                  color: 'white',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                }}
              >
                Previous
              </button>
              <span style={{ fontSize: '18px', margin: '0 10px' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={nextPage}
                disabled={currentPage >= totalPages}
                style={{
                  padding: '10px 15px',
                  margin: '0 5px',
                  border: 'none',
                  borderRadius: '5px',
                  backgroundColor: currentPage >= totalPages ? 'gray' : '#007BFF',
                  color: 'white',
                  cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                }}
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
