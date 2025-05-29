import React, { useState } from 'react';
import { searchWeb } from '../services/api';

interface SearchResult {
    query: string;
    results: string[];
    timestamp: string;
}

export const NewsSearch: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchHistory, setSearchHistory] = useState<SearchResult[]>([]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            setError('Please enter a search query');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await searchWeb(searchQuery);
            setSearchHistory(prev => [{
                query: searchQuery,
                results: response.results,
                timestamp: response.timestamp
            }, ...prev].slice(0, 5)); // Keep last 5 searches
            setSearchQuery('');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to perform search');
        } finally {
            setLoading(false);
        }
    };

    const suggestedQueries = [
        'market trends',
        'cryptocurrency news',
        'stock market analysis',
        'economic forecast',
        'investment strategies',
        'financial regulations',
        'global markets',
        'tech stocks'
    ];

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Financial News Search</h1>
            
            <form onSubmit={handleSubmit} className="mb-8">
                <div className="space-y-4">
                    <div>
                        <label className="block text-lg font-medium mb-2">
                            Search Financial News
                        </label>
                        <div className="flex space-x-4">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="E.g., latest market trends"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className={`px-6 py-2 rounded-lg text-white font-medium ${
                                    loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                            >
                                {loading ? 'Searching...' : 'Search'}
                            </button>
                        </div>
                    </div>

                    <div>
                        <div className="text-sm text-gray-600 mb-2">Suggested searches:</div>
                        <div className="flex flex-wrap gap-2">
                            {suggestedQueries.map((query) => (
                                <button
                                    key={query}
                                    type="button"
                                    onClick={() => setSearchQuery(query)}
                                    className="px-3 py-1 text-sm rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
                                >
                                    {query}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </form>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                    {error}
                </div>
            )}

            {searchHistory.map((search, index) => (
                <div key={index} className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">
                            Results for "{search.query}"
                        </h2>
                        <span className="text-sm text-gray-500">
                            {new Date(search.timestamp).toLocaleString()}
                        </span>
                    </div>
                    <div className="space-y-4">
                        {search.results.map((result, idx) => (
                            <div
                                key={idx}
                                className="p-4 bg-white border rounded-lg hover:shadow-sm transition-shadow"
                            >
                                <p className="text-gray-700">{result}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}; 