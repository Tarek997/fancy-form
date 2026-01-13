import { useState, useMemo } from 'react';
import TokenSelect from './TokenSelect';
import Loader from './Loader';
import { IoSwapVertical } from 'react-icons/io5';
import { MdCheckCircle, MdError } from 'react-icons/md';

const SwapForm = () => {
  const [fromToken, setFromToken] = useState<any>(null);
  const [toToken, setToToken] = useState<any>(null);
  const [fromAmount, setFromAmount] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Calculate exchange rate in real-time
  const exchangeRate = useMemo(() => {
    if (fromToken && toToken && fromToken.price && toToken.price) {
      return fromToken.price / toToken.price;
    }
    return null;
  }, [fromToken, toToken]);

  const toAmount = useMemo(() => {
    if (exchangeRate && fromAmount) {
      return (Number(fromAmount) * exchangeRate).toFixed(6);
    }
    return '';
  }, [fromAmount, exchangeRate]);

  // Validation
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!fromToken) newErrors.fromToken = 'Please select a token to swap from';
    if (!toToken) newErrors.toToken = 'Please select a token to swap to';
    if (!fromAmount || Number(fromAmount) <= 0) newErrors.amount = 'Enter a valid amount';
    if (fromToken && toToken && fromToken.symbol === toToken.symbol) {
      newErrors.sameToken = 'Please select different tokens';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidAmount = fromAmount && Number(fromAmount) > 0;
  const canSwap = fromToken && toToken && isValidAmount && !loading && fromToken.symbol !== toToken.symbol;
  const showConversion = fromToken && toToken && exchangeRate;
  const isSameToken = fromToken && toToken && fromToken.symbol === toToken.symbol;

  const handleSwap = () => {
    if (!validateForm()) return;

    setLoading(true);
    setSuccessMessage('');

    setTimeout(() => {
      const message = `Successfully swapped ${fromAmount} ${fromToken.symbol} → ${toAmount} ${toToken.symbol}`;
      setSuccessMessage(message);
      setFromAmount('');
      setErrors({});
      setLoading(false);

      setTimeout(() => setSuccessMessage(''), 4000);
    }, 1500);
  };

  const swapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount('');
    setErrors({});
  };

  const getTokenImageUrl = (symbol: string): string => {
    return `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${symbol}.svg`;
  };

  return (
    <div className="w-full max-w-lg">
      {/* Main Card */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-8 py-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20"></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-2">Token Swap</h1>
            <p className="text-blue-100 text-sm">Instant exchange powered by blockchain</p>
          </div>
        </div>

        <div className="px-8 py-8">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-300 rounded-xl flex items-start gap-3 animate-in slide-in-from-top">
              <MdCheckCircle className="text-green-500 text-2xl flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-900 font-semibold text-sm">Swap Successful!</p>
                <p className="text-green-800 text-xs mt-1">{successMessage}</p>
              </div>
            </div>
          )}

          {/* From Token Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-gray-700">From</label>
              {fromToken && (
                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  Balance: ${(fromToken.price * 100).toFixed(2)}
                </span>
              )}
            </div>
            <div className={`p-4 rounded-2xl border-2 transition ${
              errors.fromToken ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-blue-300'
            }`}>
              <TokenSelect value={fromToken} onChange={(token) => {
                setFromToken(token);
                setErrors({ ...errors, fromToken: '' });
              }} />
            </div>
            {errors.fromToken && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-xs">
                <MdError size={16} />
                {errors.fromToken}
              </div>
            )}
            {fromToken && (
              <p className="text-xs text-gray-600 mt-2">Price: <span className="font-semibold">${fromToken.price?.toFixed(4)}</span></p>
            )}
          </div>

          {/* Amount Input */}
          <div className="mb-8">
            <label className="text-sm font-bold text-gray-700 block mb-3">Amount</label>
            <div className={`relative p-4 rounded-2xl border-2 transition ${
              errors.amount ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus-within:border-blue-500 focus-within:bg-blue-50'
            }`}>
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => {
                  const val = e.target.value;
                  setFromAmount(val === '' ? '' : Number(val));
                  setErrors({ ...errors, amount: '' });
                }}
                className="w-full bg-transparent text-2xl font-bold focus:outline-none placeholder-gray-400"
                placeholder="0.00"
                min="0"
                step="0.000001"
                disabled={!fromToken}
              />
              {fromAmount && isValidAmount && (
                <p className="text-xs text-gray-600 mt-2">
                  ≈ ${(Number(fromAmount) * (fromToken?.price || 0)).toFixed(2)}
                </p>
              )}
            </div>
            {errors.amount && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-xs">
                <MdError size={16} />
                {errors.amount}
              </div>
            )}
          </div>

          {/* Swap Button */}
          <div className="flex justify-center mb-8">
            <button
              onClick={swapTokens}
              disabled={!fromToken || !toToken}
              className="group relative p-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-xl transition transform hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
              title="Swap tokens"
            >
              <IoSwapVertical size={24} className="group-hover:rotate-180 transition duration-300" />
            </button>
          </div>

          {/* To Token Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-gray-700">To</label>
              {toToken && (
                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  Price: ${toToken.price?.toFixed(4)}
                </span>
              )}
            </div>
            <div className={`p-4 rounded-2xl border-2 transition ${
              errors.toToken ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-blue-300'
            }`}>
              <TokenSelect value={toToken} onChange={(token) => {
                setToToken(token);
                setErrors({ ...errors, toToken: '' });
              }} />
            </div>
            {errors.toToken && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-xs">
                <MdError size={16} />
                {errors.toToken}
              </div>
            )}
          </div>

          {/* Exchange Rate Info */}
          {showConversion && !isSameToken && (
            <div className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-600 font-medium">Exchange Rate</p>
                {fromToken && toToken && (
                  <div className="flex gap-2">
                    <img src={getTokenImageUrl(fromToken.symbol)} alt={fromToken.symbol} className="w-4 h-4 rounded-full" onError={(e) => (e.currentTarget.style.opacity = '0.3')} />
                    <img src={getTokenImageUrl(toToken.symbol)} alt={toToken.symbol} className="w-4 h-4 rounded-full" onError={(e) => (e.currentTarget.style.opacity = '0.3')} />
                  </div>
                )}
              </div>
              <p className="text-sm font-bold text-gray-900 mb-3">
                1 <span className="text-blue-600">{fromToken.symbol}</span> = <span className="text-purple-600">{exchangeRate.toFixed(6)}</span> {toToken.symbol}
              </p>
              {fromAmount && (
                <div className="pt-3 border-t border-blue-200">
                  <p className="text-xs text-gray-600 mb-1">You will receive</p>
                  <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    {toAmount} {toToken.symbol}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Error Messages */}
          {isSameToken && fromToken && toToken && (
            <div className="mb-8 p-4 bg-yellow-50 border border-yellow-300 rounded-xl flex items-start gap-3">
              <MdError className="text-yellow-600 text-xl flex-shrink-0 mt-0.5" />
              <p className="text-yellow-900 text-sm">Please select different tokens to proceed</p>
            </div>
          )}

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            disabled={!canSwap}
            className={`w-full py-4 rounded-2xl font-bold text-white transition transform text-lg ${
              canSwap
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-xl hover:scale-105 active:scale-95'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="loader border-2 border-white border-t-transparent rounded-full w-5 h-5 animate-spin"></div>
                <span>Processing Swap...</span>
              </div>
            ) : (
              'Swap Now'
            )}
          </button>

          {/* Footer Info */}
          <p className="text-xs text-gray-500 text-center mt-6 leading-relaxed">
            💡 Rates update in real-time • No hidden fees • Instant settlement
          </p>
        </div>
      </div>
    </div>
  );
};

export default SwapForm;
