import React, { useState } from 'react';
import { getStockPrice } from '../services/api';

const commonStocks = {
    'AAPL': 'Apple Inc.',
    'MSFT': 'Microsoft Corporation',
    'GOOGL': 'Alphabet Inc.',
    'AMZN': 'Amazon.com Inc.',
    'META': 'Meta Platforms Inc.',
    'TSLA': 'Tesla Inc.',
    'NVDA': 'NVIDIA Corporation',
    'JPM': 'JPMorgan Chase & Co.'
};

export const StockLookup: React.FC = () => {
    const [stockTicker, setStockTicker] = useState('');
    const [stockPrice, setStockPrice] = useState<{
        symbol: string;
        price: number;
        currency: string;
    } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchHistory, setSearchHistory] = useState<Array<{
        symbol: string;
        price: number;
        currency: string;
        timestamp: string;
    }>>([]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const symbol = stockTicker.trim().toUpperCase();
        if (!symbol) {
            setError('Please enter a stock symbol');
            return;
        }
        
        if (!/^[A-Z]{1,5}$/.test(symbol)) {
            setError('Invalid stock symbol format. Should be 1-5 capital letters.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await getStockPrice(symbol);
            setStockPrice({
                symbol: response.symbol,
                price: response.price,
                currency: response.currency
            });
            setSearchHistory(prev => [response, ...prev].slice(0, 10)); // Keep last 10 searches
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || 'Failed to fetch stock price';
            setError(errorMessage);
            setStockPrice(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Stock Price Lookup</h1>
            
            <form onSubmit={handleSubmit} className="mb-8">
                <div className="space-y-4">
                    <div>
                        <label className="block text-lg font-medium mb-2">
                            Enter Stock Symbol
                        </label>
                        <div className="flex space-x-4">
                            <input
                                type="text"
                                value={stockTicker}
                                onChange={(e) => setStockTicker(e.target.value.toUpperCase())}
                                className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="E.g., AAPL"
                                maxLength={5}
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className={`px-6 py-2 rounded-lg text-white font-medium ${
                                    loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                            >
                                {loading ? 'Loading...' : 'Look Up'}
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <span className="text-sm text-gray-600">Common symbols:</span>
                        {Object.entries(commonStocks).map(([symbol, name]) => (
                            <button
                                key={symbol}
                                type="button"
                                onClick={() => setStockTicker(symbol)}
                                className="px-3 py-1 text-sm rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
                                title={name}
                            >
                                {symbol}
                            </button>
                        ))}
                    </div>
                </div>
            </form>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                    {error}
                </div>
            )}

            {stockPrice && (
                <div className="mb-8 p-6 bg-white border rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">Current Price</h2>
                    <div className="text-3xl font-bold text-blue-600">
                        {stockPrice.currency} {stockPrice.price.toFixed(2)}
                    </div>
                    <div className="text-gray-600 mt-2">
                        {commonStocks[stockPrice.symbol] || stockPrice.symbol}
                    </div>
                </div>
            )}

            {searchHistory.length > 0 && (
                <div>
                    <h2 className="text-xl font-semibold mb-4">Recent Searches</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {searchHistory.map((stock, index) => (
                            <div
                                key={`${stock.symbol}-${index}`}
                                className="p-4 border rounded-lg hover:shadow-sm transition-shadow"
                            >
                                <div className="font-medium">{stock.symbol}</div>
                                <div className="text-lg text-blue-600">
                                    {stock.currency} {stock.price.toFixed(2)}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {new Date(stock.timestamp).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}; 