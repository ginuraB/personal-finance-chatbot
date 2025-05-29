import React, { useState } from 'react';
import { chatWithAgent } from '../services/api';

export const FinancialAssistant: React.FC = () => {
    const [chatQuery, setChatQuery] = useState('');
    const [chatHistory, setChatHistory] = useState<Array<{ query: string; response: string }>>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatQuery.trim()) {
            setError('Please enter a question');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await chatWithAgent(chatQuery);
            setChatHistory(prev => [...prev, { query: chatQuery, response: response.message }]);
            setChatQuery('');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to get response from agent');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Financial Assistant</h1>
            
            <form onSubmit={handleSubmit} className="mb-8">
                <div className="flex flex-col space-y-4">
                    <label className="text-lg font-medium">
                        Ask me anything about your finances
                    </label>
                    <div className="flex space-x-4">
                        <input
                            type="text"
                            value={chatQuery}
                            onChange={(e) => setChatQuery(e.target.value)}
                            className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="E.g., How can I save money?"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-6 py-2 rounded-lg text-white font-medium ${
                                loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                        >
                            {loading ? 'Thinking...' : 'Ask'}
                        </button>
                    </div>
                </div>
            </form>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                    {error}
                </div>
            )}

            <div className="space-y-6">
                {chatHistory.map((chat, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-50 p-4 border-b">
                            <p className="font-medium">You asked:</p>
                            <p className="text-gray-700">{chat.query}</p>
                        </div>
                        <div className="p-4">
                            <p className="font-medium">Assistant's response:</p>
                            <p className="text-gray-700 whitespace-pre-line">{chat.response}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}; 