// Home.jsx
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CoinContext } from '../../context/CoinContext';
import Swal from 'sweetalert2';

const Home = () => {
  const { currency } = useContext(CoinContext);
  const [allCoin, setAllCoin] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [userWatchlist, setUserWatchlist] = useState([]);
  const coinsPerPage = 10;

  // Fetch all cryptocurrencies (public endpoint)
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

  // Fetch the user's watchlist if the user is logged in (using token)
  const fetchWatchlist = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch('http://127.0.0.1:5000/user-cryptocurrencies', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: "include"
      });
      if (response.ok) {
        const data = await response.json();
        setUserWatchlist(data);
      } else {
        setUserWatchlist([]);
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      setUserWatchlist([]);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchWatchlist();
    }
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Function to add cryptocurrency to watchlist
  const handleAddToWatchlist = async (coin, e) => {
    e.preventDefault();
    e.stopPropagation();

    // Prompt for alert price using SweetAlert2
    const { value: alertPrice } = await Swal.fire({
      title: `Enter alert price for ${coin.name}`,
      input: 'text',
      inputLabel: 'Alert Price',
      inputPlaceholder: 'Enter alert price',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return 'You need to enter a value!';
        }
      },
    });

    if (!alertPrice) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch('http://127.0.0.1:5000/user-cryptocurrencies', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          crypto_id: coin.id,
          alert_price: alertPrice,
        }),
        credentials: "include"
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: `${coin.name} added to your watchlist!`,
          showConfirmButton: false,
          timer: 1500,
        });
        // Update local watchlist state by refetching
        fetchWatchlist();
      } else {
        const errData = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errData.error || 'Failed to add to watchlist.',
        });
      }
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while adding to the watchlist.',
      });
    }
  };

  // Function to remove cryptocurrency from watchlist
  const handleRemoveFromWatchlist = async (coin, e) => {
    e.preventDefault();
    e.stopPropagation();

    const result = await Swal.fire({
      title: `Remove ${coin.name} from your watchlist?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove it!',
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://127.0.0.1:5000/user-cryptocurrencies/${coin.id}`, {
          method: 'DELETE',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: "include"
        });

        if (response.ok) {
          Swal.fire({
            icon: 'success',
            title: `${coin.name} removed from your watchlist!`,
            showConfirmButton: false,
            timer: 1500,
          });
          // Update local watchlist state by refetching
          fetchWatchlist();
        } else {
          const errData = await response.json();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errData.error || 'Failed to remove from watchlist.',
          });
        }
      } catch (error) {
        console.error('Error removing from watchlist:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred while removing from the watchlist.',
        });
      }
    }
  };

  // Determine if a given coin is in the user's watchlist
  const isCoinWatched = (coinId) => {
    return userWatchlist.some((entry) => entry.cryptocurrency_id === coinId);
  };

  const filteredCoins = allCoin.filter(
    (coin) =>
      coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastCoin = currentPage * coinsPerPage;
  const indexOfFirstCoin = indexOfLastCoin - coinsPerPage;
  const currentCoins = filteredCoins.slice(indexOfFirstCoin, indexOfLastCoin);

  const totalPages = Math.ceil(filteredCoins.length / coinsPerPage);
  const nextPage = () => setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  const prevPage = () => setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));

  return (
    <div style={{ padding: '10px', background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(0,123,255,0.5) 70%)', minHeight: '100vh' }}>
      {loading ? (
        <p style={{ textAlign: 'center', fontSize: '18px' }}>Loading data...</p>
      ) : (
        <div>
          {/* Search Bar */}
          <div style={{ maxWidth: '600px', margin: '50px auto', textAlign: 'center' }}>
            <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <input
                type="text"
                placeholder="Search for a coin..."
                value={searchQuery}
                onChange={handleSearchChange}
                style={{ padding: '10px', border: '2px solid #ccc', borderRadius: '5px', fontSize: '16px', width: '60%' }}
              />
              <button
                type="submit"
                style={{ padding: '10px 15px', border: 'none', borderRadius: '5px', backgroundColor: '#007BFF', color: 'white', fontSize: '16px', cursor: 'pointer' }}
              >
                Search
              </button>
            </form>
          </div>

          {/* Coin List */}
          <div style={{ maxWidth: '900px', margin: '20px auto', padding: '15px', background: 'rgba(255, 255, 255, 0.9)', borderRadius: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '0.5fr 2fr 1fr 1fr 1.5fr 1fr', padding: '15px', fontWeight: 'bold', backgroundColor: '#007BFF', color: 'white', borderRadius: '5px' }}>
              <p>#</p>
              <p>Coin Name</p>
              <p>Price ({currency.symbol || '$'})</p>
              <p>Market Cap</p>
              <p>Add To WatchList</p>
              <p>Remove</p>
            </div>

            {currentCoins.map((coin, index) => (
              <div key={coin.id} style={{ display: 'grid', gridTemplateColumns: '0.5fr 2fr 1fr 1fr 1.5fr 1fr', padding: '12px', borderBottom: '1px solid #ddd', alignItems: 'center' }}>
                <Link
                  to={`/coin/${coin.id}`}
                  style={{ display: 'contents', textDecoration: 'none', color: 'black' }}
                >
                  <p>{indexOfFirstCoin + index + 1}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={coin.logo_url || 'https://via.placeholder.com/30'} alt={coin.name} style={{ width: '30px' }} />
                    <p>{coin.name} ({coin.symbol.toUpperCase()})</p>
                  </div>
                  <p>{currency.symbol || '$'}{coin.market_price ? Number(coin.market_price).toLocaleString() : 'N/A'}</p>
                  <p>{currency.symbol || '$'}{coin.market_cap ? Number(coin.market_cap).toLocaleString() : 'N/A'}</p>
                </Link>
                {/* "Add" button changes to "Watching" if coin is already in watchlist */}
                {isCoinWatched(coin.id) ? (
                  <button
                    style={{
                      padding: '8px 12px',
                      border: 'none',
                      borderRadius: '5px',
                      backgroundColor: '#6c757d', // Gray color for "Watching"
                      color: 'white',
                      cursor: 'default'
                    }}
                    disabled
                  >
                    Watching
                  </button>
                ) : (
                  <button
                    onClick={(e) => handleAddToWatchlist(coin, e)}
                    style={{ padding: '8px 12px', border: 'none', borderRadius: '5px', backgroundColor: '#28a745', color: 'white', cursor: 'pointer' }}
                  >
                    Add
                  </button>
                )}
                <button
                  onClick={(e) => handleRemoveFromWatchlist(coin, e)}
                  style={{ padding: '8px 12px', border: 'none', borderRadius: '5px', backgroundColor: '#dc3545', color: 'white', cursor: 'pointer' }}
                >
                  Remove
                </button>
              </div>
            ))}

            {/* Pagination */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                style={{ padding: '10px 15px', margin: '0 5px', border: 'none', borderRadius: '5px', backgroundColor: currentPage === 1 ? 'gray' : '#007BFF', color: 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                Previous
              </button>
              <span style={{ fontSize: '18px', margin: '0 10px' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={nextPage}
                disabled={currentPage >= totalPages}
                style={{ padding: '10px 15px', margin: '0 5px', border: 'none', borderRadius: '5px', backgroundColor: currentPage >= totalPages ? 'gray' : '#007BFF', color: 'white', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer' }}
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
