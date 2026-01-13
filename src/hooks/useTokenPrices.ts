import { useState, useEffect } from 'react';
import axios from 'axios';

export interface TokenPrice {
  symbol: string;
  price: number;
}

export const useTokenPrices = () => {
  const [prices, setPrices] = useState<TokenPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios.get('https://interview.switcheo.com/prices.json')
      .then(res => {
        let data: TokenPrice[] = [];
        
        if (Array.isArray(res.data)) {
          // Deduplicate by currency - keep the first occurrence
          const seenCurrencies = new Set<string>();
          data = res.data
            .filter(item => item.price && item.currency)
            .filter(item => {
              if (seenCurrencies.has(item.currency)) {
                return false;
              }
              seenCurrencies.add(item.currency);
              return true;
            })
            .map(item => ({
              symbol: item.currency,
              price: item.price
            }));
        } else {
          data = Object.keys(res.data)
            .filter(key => res.data[key].price)
            .map(key => ({
              symbol: key,
              price: res.data[key].price
            }));
        }
        
        setPrices(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('API Error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { prices, loading, error };
};
