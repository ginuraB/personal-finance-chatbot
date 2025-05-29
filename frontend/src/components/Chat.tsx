import React, { useState } from 'react';
import { chatWithAgent } from '../services/api';

const Chat: React.FC = () => {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError('');

        try {
            const result = await chatWithAgent(query);
            setResponse(result.response);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Finance Assistant</h2>
            
            <form onSubmit={handleSubmit} className="mb-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ask about stocks, budgets, or financial news..."
                        className="flex-1 p-2 border rounded"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                    >
                        {loading ? 'Thinking...' : 'Ask'}
                    </button>
                </div>
            </form>

            {error && (
                <div className="p-4 mb-4 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}

            {response && (
                <div className="p-4 bg-gray-100 rounded">
                    <pre className="whitespace-pre-wrap">{response}</pre>
                </div>
            )}
        </div>
    );
};

export default Chat; 