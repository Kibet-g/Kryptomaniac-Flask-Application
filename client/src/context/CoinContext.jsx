import { createContext, useEffect, useState, useCallback } from "react";

export const CoinContext = createContext();

const CoinContextProvider = ({ children }) => {
  const [allCoin, setAllCoin] = useState([]);
  const [currency, setCurrency] = useState({ name: "usd", symbol: "$" });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllCoin = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:5000/cryptocurrencies/", {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch data from backend");

      const data = await response.json();
      setAllCoin(data || []);
    } catch (err) {
      console.error("Error fetching cryptocurrencies:", err);
      setError(err.message);
      setAllCoin([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const checkUserSession = useCallback(async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/check-session", {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Not logged in");

      const data = await response.json();
      setUser(data.user);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    checkUserSession();
  }, [checkUserSession]);

  useEffect(() => {
    fetchAllCoin();
  }, [fetchAllCoin]);

  return (
    <CoinContext.Provider value={{ allCoin, currency, setCurrency, user, setUser, fetchAllCoin, loading, error }}>
      {children}
    </CoinContext.Provider>
  );
};

export default CoinContextProvider;