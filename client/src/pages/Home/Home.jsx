import React, { useEffect, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { CoinContext } from '../../context/CoinContext';

const Home = () => {
  const { currency } = useContext(CoinContext);
  const [allCoin, setAllCoin] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const coinsPerPage = 10;

  // Fetch data from Flask backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/cryptocurrencies'); // Adjust URL if needed
        const data = await response.json();
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const filteredCoins = allCoin.filter((coin) =>
    coin.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastCoin = currentPage * coinsPerPage;
  const indexOfFirstCoin = indexOfLastCoin - coinsPerPage;
  const currentCoins = filteredCoins.slice(indexOfFirstCoin, indexOfLastCoin);

  const nextPage = () => setCurrentPage((prevPage) => prevPage + 1);
  const prevPage = () => setCurrentPage((prevPage) => prevPage - 1);

  // Inline styles
  const styles = {
    home: {
      padding: '10px',
      background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(0,123,255,0.5) 70%)',
      minHeight: '100vh',
    },
    hero: {
      maxWidth: '600px',
      margin: '50px auto',
      textAlign: 'center',
    },
    form: {
      display: 'flex',
      justifyContent: 'center',
      gap: '10px',
    },
    input: {
      padding: '10px',
      border: '2px solid #ccc',
      borderRadius: '5px',
      fontSize: '16px',
      width: '60%',
    },
    button: {
      padding: '10px 15px',
      border: 'none',
      borderRadius: '5px',
      backgroundColor: '#007BFF',
      color: 'white',
      fontSize: '16px',
      cursor: 'pointer',
    },
    cryptoTable: {
      maxWidth: '900px',
      margin: '20px auto',
      padding: '15px',
      background: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '10px',
      boxShadow: '0 0 10px rgba(0,0,0,0.2)',
    },
    tableHeader: {
      display: 'grid',
      gridTemplateColumns: '0.5fr 2fr 1fr 1fr 1.5fr',
      padding: '15px',
      fontWeight: 'bold',
      backgroundColor: '#007BFF',
      color: 'white',
      borderRadius: '5px',
    },
    tableRow: {
      display: 'grid',
      gridTemplateColumns: '0.5fr 2fr 1fr 1fr 1.5fr',
      padding: '12px',
      borderBottom: '1px solid #ddd',
      alignItems: 'center',
    },
    pagination: {
      display: 'flex',
      justifyContent: 'center',
      margin: '20px 0',
    },
    paginationButton: {
      padding: '10px 15px',
      margin: '0 5px',
      border: 'none',
      borderRadius: '5px',
      backgroundColor: '#007BFF',
      color: 'white',
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.home}>
      {loading ? (
        <p style={{ textAlign: 'center', fontSize: '18px' }}>Loading data...</p>
      ) : (
        <div>
          <div style={styles.hero}>
            <form onSubmit={handleSearchSubmit} style={styles.form}>
              <input
                type="text"
                placeholder="Search for a coin..."
                value={searchQuery}
                onChange={handleSearchChange}
                style={styles.input}
              />
              <button type="submit" style={styles.button}>
                Search
              </button>
            </form>
          </div>

          <div style={styles.cryptoTable}>
            <div style={styles.tableHeader}>
              <p>#</p>
              <p>Coin</p>
              <p>Price ({currency.symbol})</p>
              <p>24h Change</p>
              <p>Market Cap</p>
            </div>

            {currentCoins.map((coin, index) => (
              <Link
                to={`/coin/${coin.id}`}
                key={coin.id}
                style={{ textDecoration: 'none', color: 'black' }}
              >
                <div style={styles.tableRow}>
                  <p>{indexOfFirstCoin + index + 1}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={coin.image} alt={coin.name} style={{ width: '30px' }} />
                    <p>{coin.name}</p>
                  </div>
                  <p>
                    {currency.symbol}
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
                    {currency.symbol}
                    {coin.market_cap ? coin.market_cap.toLocaleString() : 'N/A'}
                  </p>
                </div>
              </Link>
            ))}

            <div style={styles.pagination}>
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                style={styles.paginationButton}
              >
                Previous
              </button>
              <button
                onClick={nextPage}
                disabled={indexOfLastCoin >= filteredCoins.length}
                style={styles.paginationButton}
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
