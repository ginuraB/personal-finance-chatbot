import React, { useState, useEffect } from 'react';
import type { Budget as BudgetType } from '../types/api';
import { setBudget, getBudgets } from '../services/api';

const Budget: React.FC = () => {
    const [budgets, setBudgets] = useState<BudgetType[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Form state
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const loadBudgets = async () => {
        try {
            setLoading(true);
            const response = await getBudgets(1); // Using user ID 1 for demo
            setBudgets(response.data.budgets);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load budgets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBudgets();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!category || !amount || !startDate || !endDate) return;

        try {
            setLoading(true);
            await setBudget({
                user_id: 1, // Using user ID 1 for demo
                category,
                amount: parseFloat(amount),
                start_date: startDate,
                end_date: endDate
            });
            
            // Reset form
            setCategory('');
            setAmount('');
            setStartDate('');
            setEndDate('');
            
            // Reload budgets
            await loadBudgets();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to set budget');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Budget Manager</h2>

            {/* Budget Form */}
            <form onSubmit={handleSubmit} className="mb-8 p-4 bg-gray-50 rounded">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-2">Category</label>
                        <input
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full p-2 border rounded"
                            placeholder="e.g., Groceries"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="block mb-2">Amount</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full p-2 border rounded"
                            placeholder="0.00"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="block mb-2">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full p-2 border rounded"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="block mb-2">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full p-2 border rounded"
                            disabled={loading}
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
                >
                    {loading ? 'Saving...' : 'Add Budget'}
                </button>
            </form>

            {error && (
                <div className="p-4 mb-4 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}

            {/* Budgets List */}
            <div className="overflow-x-auto">
                <table className="w-full table-auto">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2 text-left">Category</th>
                            <th className="p-2 text-left">Amount</th>
                            <th className="p-2 text-left">Start Date</th>
                            <th className="p-2 text-left">End Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {budgets.map((budget, index) => (
                            <tr key={index} className="border-b">
                                <td className="p-2">{budget.category}</td>
                                <td className="p-2">${budget.amount.toFixed(2)}</td>
                                <td className="p-2">{budget.start_date}</td>
                                <td className="p-2">{budget.end_date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Budget; 