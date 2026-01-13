import Select from 'react-select';
import { useTokenPrices } from '../hooks/useTokenPrices';
import type { TokenPrice } from '../hooks/useTokenPrices';

interface Props {
  value: TokenPrice | null;
  onChange: (token: TokenPrice) => void;
}

const getTokenImageUrl = (symbol: string): string => {
  return `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${symbol}.svg`;
};

const formatOptionLabel = (data: any) => {
  return (
    <div className="flex items-center gap-3 py-1">
      <img 
        src={getTokenImageUrl(data.symbol)} 
        alt={data.symbol}
        className="w-6 h-6 rounded-full flex-shrink-0 object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).style.opacity = '0.3';
        }}
      />
      <div className="flex-1">
        <div className="font-medium text-sm">{data.symbol}</div>
        <div className="text-xs text-gray-500">${data.price?.toFixed(6)}</div>
      </div>
    </div>
  );
};

const formatSingleValue = (data: any) => {
  return (
    <div className="flex items-center gap-2">
      <img 
        src={getTokenImageUrl(data.symbol)} 
        alt={data.symbol}
        className="w-5 h-5 rounded-full flex-shrink-0 object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).style.opacity = '0.3';
        }}
      />
      <span className="font-semibold">{data.symbol}</span>
    </div>
  );
};

const TokenSelect = ({ value, onChange }: Props) => {
  const { prices, loading, error } = useTokenPrices();

  const options = prices.map(token => ({
    label: token.symbol,
    value: token.symbol,
    symbol: token.symbol,
    price: token.price
  }));

  if (error) {
    return <div className="text-red-500 text-sm">Error loading tokens: {error}</div>;
  }

  return (
    <Select
      isLoading={loading}
      options={options}
      value={value ? {
        label: value.symbol,
        value: value.symbol,
        symbol: value.symbol,
        price: value.price
      } : null}
      onChange={(option: any) => {
        if (option) {
          onChange({ symbol: option.symbol, price: option.price });
        }
      }}
      formatOptionLabel={formatOptionLabel}
      formatSingleValue={formatSingleValue}
      styles={{
        option: (base) => ({
          ...base,
          padding: '8px 12px',
          backgroundColor: 'white',
          ':hover': {
            backgroundColor: '#f3f4f6'
          }
        }),
        control: (base) => ({
          ...base,
          minHeight: '48px',
          borderColor: '#e5e7eb',
          ':hover': {
            borderColor: '#3b82f6'
          }
        }),
        singleValue: (base) => ({
          ...base,
          display: 'flex',
          alignItems: 'center'
        })
      }}
      isSearchable
      isClearable
      className="w-full"
      placeholder="Select token..."
    />
  );
};

export default TokenSelect;
