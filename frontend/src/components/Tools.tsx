import React, { useState } from 'react';
import { chatWithAgent, getStockPrice, searchWeb, getExchangeRate } from '../services/api';
import axios, { AxiosError } from 'axios';

interface APIErrorResponse {
    detail: string;
}

export const Tools: React.FC = () => {
    const [chatQuery, setChatQuery] = useState('');
    const [chatResponse, setChatResponse] = useState('');
    const [stockTicker, setStockTicker] = useState('');
    const [stockPrice, setStockPrice] = useState<{
        symbol: string;
        price: number;
        currency: string;
    } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<string[]>([]);
    const [exchangeRate, setExchangeRate] = useState({
        base: 'USD',
        target: 'EUR',
        rate: null as number | null,
        amount: '1'
    });
    const [loading, setLoading] = useState({
        chat: false,
        stock: false,
        search: false,
        exchange: false
    });
    const [error, setError] = useState({
        chat: '',
        stock: '',
        search: '',
        exchange: ''
    });

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

    const handleChatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatQuery.trim()) {
            setError(prev => ({ ...prev, chat: 'Please enter a question' }));
            return;
        }
        setLoading(prev => ({ ...prev, chat: true }));
        setError(prev => ({ ...prev, chat: '' }));
        try {
            const response = await chatWithAgent(chatQuery);
            setChatResponse(response.message);
            setChatQuery(''); // Clear input after successful response
        } catch (err) {
            const error = err as AxiosError<APIErrorResponse>;
            setError(prev => ({ 
                ...prev, 
                chat: error.response?.data?.detail || 'Failed to get response from agent' 
            }));
        } finally {
            setLoading(prev => ({ ...prev, chat: false }));
        }
    };

    const handleStockLookup = async (e: React.FormEvent) => {
        e.preventDefault();
        const symbol = stockTicker.trim().toUpperCase();
        if (!symbol) {
            setError(prev => ({ ...prev, stock: 'Please enter a stock symbol' }));
            return;
        }
        
        // Basic symbol validation
        if (!/^[A-Z]{1,5}$/.test(symbol)) {
            setError(prev => ({ ...prev, stock: 'Invalid stock symbol format. Should be 1-5 capital letters.' }));
            return;
        }

        setLoading(prev => ({ ...prev, stock: true }));
        setError(prev => ({ ...prev, stock: '' }));
        try {
            const response = await getStockPrice(symbol);
            setStockPrice({
                symbol: response.symbol,
                price: response.price,
                currency: response.currency
            });
        } catch (err) {
            const error = err as AxiosError<APIErrorResponse>;
            const errorMessage = error.response?.data?.detail || 'Failed to fetch stock price';
            setError(prev => ({ ...prev, stock: errorMessage }));
            setStockPrice(null);
        } finally {
            setLoading(prev => ({ ...prev, stock: false }));
        }
    };

    const handleWebSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            setError(prev => ({ ...prev, search: 'Please enter a search query' }));
            return;
        }
        setLoading(prev => ({ ...prev, search: true }));
        setError(prev => ({ ...prev, search: '' }));
        try {
            const response = await searchWeb(searchQuery);
            setSearchResults(response.results);
        } catch (err) {
            const error = err as AxiosError<APIErrorResponse>;
            setError(prev => ({ 
                ...prev, 
                search: error.response?.data?.detail || 'Failed to perform web search' 
            }));
            setSearchResults([]);
        } finally {
            setLoading(prev => ({ ...prev, search: false }));
        }
    };

    const handleExchangeRate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (exchangeRate.base === exchangeRate.target) {
            setError(prev => ({ ...prev, exchange: 'Please select different currencies' }));
            return;
        }
        setLoading(prev => ({ ...prev, exchange: true }));
        setError(prev => ({ ...prev, exchange: '' }));
        try {
            const response = await getExchangeRate(exchangeRate.base, exchangeRate.target);
            setExchangeRate(prev => ({ ...prev, rate: response.rate }));
        } catch (err) {
            const error = err as AxiosError<APIErrorResponse>;
            setError(prev => ({ 
                ...prev, 
                exchange: error.response?.data?.detail || 'Failed to fetch exchange rate' 
            }));
            setExchangeRate(prev => ({ ...prev, rate: null }));
        } finally {
            setLoading(prev => ({ ...prev, exchange: false }));
        }
    };

    const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR'];

    return (
        <div className="space-y-8">
            {/* Financial Assistant */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Financial Assistant</h3>
                <form onSubmit={handleChatSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Ask me anything about your finances</label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                            <input
                                type="text"
                                value={chatQuery}
                                onChange={(e) => setChatQuery(e.target.value)}
                                className="flex-1 min-w-0 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                placeholder="E.g., How can I save money?"
                            />
                            <button
                                type="submit"
                                disabled={loading.chat}
                                className={`ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                                    loading.chat ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                            >
                                {loading.chat ? 'Thinking...' : 'Ask'}
                            </button>
                        </div>
                    </div>
                    {error.chat && <p className="text-red-600 text-sm">{error.chat}</p>}
                    {chatResponse && (
                        <div className="bg-gray-50 rounded-md p-4">
                            <p className="text-gray-700 whitespace-pre-line">{chatResponse}</p>
                        </div>
                    )}
                </form>
            </div>

            {/* Stock Price Lookup */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Stock Price Lookup</h3>
                <form onSubmit={handleStockLookup} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Enter Stock Symbol</label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                            <input
                                type="text"
                                value={stockTicker}
                                onChange={(e) => setStockTicker(e.target.value.toUpperCase())}
                                className="flex-1 min-w-0 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                placeholder="E.g., AAPL"
                                maxLength={5}
                            />
                            <button
                                type="submit"
                                disabled={loading.stock}
                                className={`ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                                    loading.stock ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                            >
                                {loading.stock ? 'Loading...' : 'Look Up'}
                            </button>
                        </div>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">Common symbols: 
                                {Object.entries(commonStocks).map(([symbol, name], index) => (
                                    <button
                                        key={symbol}
                                        type="button"
                                        onClick={() => setStockTicker(symbol)}
                                        className="ml-2 px-2 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
                                        title={name}
                                    >
                                        {symbol}
                                    </button>
                                ))}
                            </p>
                        </div>
                    </div>
                    {error.stock && <p className="text-red-600 text-sm">{error.stock}</p>}
                    {stockPrice && (
                        <div className="bg-gray-50 rounded-md p-4">
                            <p className="text-gray-700">
                                Current price of {stockPrice.symbol}: {stockPrice.currency} {stockPrice.price.toFixed(2)}
                            </p>
                        </div>
                    )}
                </form>
            </div>

            {/* Exchange Rate Calculator */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Exchange Rate Calculator</h3>
                <form onSubmit={handleExchangeRate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Amount</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={exchangeRate.amount}
                                onChange={(e) => setExchangeRate(prev => ({ ...prev, amount: e.target.value }))}
                                className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Amount"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">From</label>
                            <select
                                value={exchangeRate.base}
                                onChange={(e) => setExchangeRate(prev => ({ ...prev, base: e.target.value }))}
                                className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            >
                                {currencies.map(currency => (
                                    <option key={currency} value={currency}>{currency}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">To</label>
                            <select
                                value={exchangeRate.target}
                                onChange={(e) => setExchangeRate(prev => ({ ...prev, target: e.target.value }))}
                                className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            >
                                {currencies.map(currency => (
                                    <option key={currency} value={currency}>{currency}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading.exchange}
                            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                                loading.exchange ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                        >
                            {loading.exchange ? 'Loading...' : 'Calculate'}
                        </button>
                    </div>
                    {error.exchange && <p className="text-red-600 text-sm">{error.exchange}</p>}
                    {exchangeRate.rate !== null && (
                        <div className="bg-gray-50 rounded-md p-4 space-y-2">
                            <p className="text-gray-700">
                                Exchange Rate: 1 {exchangeRate.base} = {exchangeRate.rate.toFixed(4)} {exchangeRate.target}
                            </p>
                            <p className="text-gray-700 font-medium">
                                {exchangeRate.amount} {exchangeRate.base} = {(Number(exchangeRate.amount) * exchangeRate.rate).toFixed(2)} {exchangeRate.target}
                            </p>
                        </div>
                    )}
                </form>
            </div>

            {/* Web Search */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Financial News Search</h3>
                <form onSubmit={handleWebSearch} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Search Query</label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 min-w-0 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                placeholder="E.g., latest market trends"
                            />
                            <button
                                type="submit"
                                disabled={loading.search}
                                className={`ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                                    loading.search ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                            >
                                {loading.search ? 'Searching...' : 'Search'}
                            </button>
                        </div>
                    </div>
                    {error.search && <p className="text-red-600 text-sm">{error.search}</p>}
                    {searchResults.length > 0 && (
                        <div className="bg-gray-50 rounded-md p-4">
                            <ul className="space-y-2">
                                {searchResults.map((result, index) => (
                                    <li key={index} className="text-gray-700">• {result}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}; 