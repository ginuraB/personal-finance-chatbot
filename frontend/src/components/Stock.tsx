import React, { useState } from 'react';
import { getStockPrice } from '../services/api';

const Stock: React.FC = () => {
    const [ticker, setTicker] = useState('');
    const [stockData, setStockData] = useState<{ ticker: string; price: number; currency: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticker.trim()) return;

        setLoading(true);
        setError('');
        setStockData(null);

        try {
            const result = await getStockPrice(ticker);
            setStockData(result.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch stock price');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Stock Price Checker</h2>

            <form onSubmit={handleSubmit} className="mb-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={ticker}
                        onChange={(e) => setTicker(e.target.value.toUpperCase())}
                        placeholder="Enter stock ticker (e.g., AAPL)"
                        className="flex-1 p-2 border rounded"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                    >
                        {loading ? 'Loading...' : 'Check Price'}
                    </button>
                </div>
            </form>

            {error && (
                <div className="p-4 mb-4 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}

            {stockData && (
                <div className="p-4 bg-green-50 rounded">
                    <h3 className="text-lg font-semibold mb-2">{stockData.ticker}</h3>
                    <p className="text-2xl text-green-700">
                        {stockData.currency} {stockData.price.toFixed(2)}
                    </p>
                </div>
            )}
        </div>
    );
};

export default Stock; 