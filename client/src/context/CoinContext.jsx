import { createContext, useEffect, useState, useCallback } from "react";

export const CoinContext = createContext();

const CoinContextProvider = (props) => {
  const [allCoin, setAllCoin] = useState([]); // Ensure it's always an array
  const [currency, setCurrency] = useState({
    name: "usd",
    symbol: "$",
  });

  const fetchAllCoin = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5555/cryptocurrencies");
      if (!response.ok) {
        throw new Error("Failed to fetch data from the backend");
      }
      const data = await response.json();
      setAllCoin(data || []); // Ensure it's always an array
    } catch (error) {
      console.error("Error fetching cryptocurrencies:", error);
      setAllCoin([]); // Prevent undefined issues
    }
  }, []);

  useEffect(() => {
    fetchAllCoin();
  }, [fetchAllCoin]);

  const contextValue = {
    allCoin,
    currency,
    setCurrency,
  };

  return (
    <CoinContext.Provider value={contextValue}>
      {props.children}
    </CoinContext.Provider>
  );
};

export default CoinContextProvider;
