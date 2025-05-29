import React, { useState } from 'react';
import { Expenses } from './components/Expenses';
import { Budgets } from './components/Budgets';
import { Tools } from './components/Tools';
import type { User } from './types';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { FinancialAssistant } from './pages/FinancialAssistant';
import { StockLookup } from './pages/StockLookup';
import { ExchangeRate } from './pages/ExchangeRate';
import { NewsSearch } from './pages/NewsSearch';
import './App.css';

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'expenses' | 'budgets' | 'tools'>('expenses');
    // TODO: Replace with actual user authentication
    const [user] = useState<User>({
        user_id: 1,
        username: 'demo_user',
        email: 'demo@example.com'
    });

    return (
        <Router>
            <div className="min-h-screen bg-gray-50">
                <nav className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex">
                                <div className="flex-shrink-0 flex items-center">
                                    <Link to="/" className="text-xl font-bold text-blue-600">
                                        Finance Tools
                                    </Link>
                                </div>
                                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                    <Link
                                        to="/assistant"
                                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                                    >
                                        Financial Assistant
                                    </Link>
                                    <Link
                                        to="/stocks"
                                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                                    >
                                        Stock Lookup
                                    </Link>
                                    <Link
                                        to="/exchange"
                                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                                    >
                                        Exchange Rate
                                    </Link>
                                    <Link
                                        to="/news"
                                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                                    >
                                        Financial News
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>

                <main className="py-10">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/assistant" element={<FinancialAssistant />} />
                        <Route path="/stocks" element={<StockLookup />} />
                        <Route path="/exchange" element={<ExchangeRate />} />
                        <Route path="/news" element={<NewsSearch />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
};

const Home: React.FC = () => {
    const tools = [
        {
            title: 'Financial Assistant',
            description: 'Get personalized financial advice and answers to your money questions',
            path: '/assistant',
            icon: '💬'
        },
        {
            title: 'Stock Lookup',
            description: 'Check real-time stock prices and track your favorite companies',
            path: '/stocks',
            icon: '📈'
        },
        {
            title: 'Exchange Rate Calculator',
            description: 'Convert currencies and get up-to-date exchange rates',
            path: '/exchange',
            icon: '💱'
        },
        {
            title: 'Financial News',
            description: 'Stay informed with the latest financial news and market updates',
            path: '/news',
            icon: '📰'
        }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Welcome to Finance Tools
                </h1>
                <p className="text-xl text-gray-600">
                    Your all-in-one platform for financial information and tools
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {tools.map((tool) => (
                    <Link
                        key={tool.path}
                        to={tool.path}
                        className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="text-3xl mb-4">{tool.icon}</div>
                        <h2 className="text-xl font-semibold mb-2">{tool.title}</h2>
                        <p className="text-gray-600">{tool.description}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default App;
