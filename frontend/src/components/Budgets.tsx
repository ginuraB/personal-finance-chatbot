import React, { useState, useEffect } from 'react';
import { budgetApi } from '../services/api';
import type { BudgetStatus } from '../types';

interface BudgetsProps {
    userId: number;
}

export const Budgets: React.FC<BudgetsProps> = ({ userId }) => {
    const [budgets, setBudgets] = useState<BudgetStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newBudget, setNewBudget] = useState({
        category: '',
        amount: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
    });

    useEffect(() => {
        loadBudgets();
    }, [userId]);

    const loadBudgets = async () => {
        try {
            setLoading(true);
            const data = await budgetApi.getBudgets(userId);
            setBudgets(data);
            setError(null);
        } catch (err) {
            setError('Failed to load budgets');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await budgetApi.createBudget({
                user_id: userId,
                category: newBudget.category,
                amount: parseFloat(newBudget.amount),
                start_date: newBudget.start_date,
                end_date: newBudget.end_date
            });
            setNewBudget({
                category: '',
                amount: '',
                start_date: new Date().toISOString().split('T')[0],
                end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
            });
            await loadBudgets();
            setError(null);
        } catch (err) {
            setError('Failed to create budget');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const calculateProgress = (spent: number, total: number) => {
        const percentage = (spent / total) * 100;
        return Math.min(percentage, 100);
    };

    const getStatusColor = (spent: number, total: number) => {
        const percentage = (spent / total) * 100;
        if (percentage >= 100) return 'red';
        if (percentage >= 75) return 'yellow';
        return 'green';
    };

    return (
        <div className="space-y-6">
            {/* Budget Summary */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Budget Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-md">
                        <h4 className="font-medium text-green-700">Total Budgeted</h4>
                        <p className="text-2xl font-bold text-green-600">
                            ${budgets.reduce((sum, b) => sum + b.budgeted_amount, 0).toFixed(2)}
                        </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-md">
                        <h4 className="font-medium text-blue-700">Total Spent</h4>
                        <p className="text-2xl font-bold text-blue-600">
                            ${budgets.reduce((sum, b) => sum + b.actual_spent, 0).toFixed(2)}
                        </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-md">
                        <h4 className="font-medium text-purple-700">Total Remaining</h4>
                        <p className="text-2xl font-bold text-purple-600">
                            ${budgets.reduce((sum, b) => sum + b.remaining_amount, 0).toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Add New Budget Form */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Create New Budget</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <input
                                type="text"
                                placeholder="e.g., Groceries"
                                value={newBudget.category}
                                onChange={e => setNewBudget({...newBudget, category: e.target.value})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Amount</label>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={newBudget.amount}
                                onChange={e => setNewBudget({...newBudget, amount: e.target.value})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Start Date</label>
                            <input
                                type="date"
                                value={newBudget.start_date}
                                onChange={e => setNewBudget({...newBudget, start_date: e.target.value})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">End Date</label>
                            <input
                                type="date"
                                value={newBudget.end_date}
                                onChange={e => setNewBudget({...newBudget, end_date: e.target.value})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-4 py-2 rounded-md text-white font-medium ${
                                loading
                                    ? 'bg-blue-300 cursor-not-allowed'
                                    : 'bg-blue-500 hover:bg-blue-600'
                            }`}
                        >
                            {loading ? 'Creating...' : 'Create Budget'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {/* Budgets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span className="ml-2">Loading budgets...</span>
                    </div>
                ) : budgets.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        No budgets found. Create your first budget above.
                    </div>
                ) : (
                    budgets.map((budget, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-bold text-lg text-gray-900">{budget.category}</h3>
                                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                                        getStatusColor(budget.actual_spent, budget.budgeted_amount) === 'red'
                                            ? 'bg-red-100 text-red-800'
                                            : getStatusColor(budget.actual_spent, budget.budgeted_amount) === 'yellow'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-green-100 text-green-800'
                                    }`}>
                                        {(budget.actual_spent / budget.budgeted_amount * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Budgeted</span>
                                        <span className="font-medium">${budget.budgeted_amount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Spent</span>
                                        <span className="font-medium">${budget.actual_spent.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Remaining</span>
                                        <span className={`font-medium ${
                                            budget.remaining_amount < 0 ? 'text-red-600' : 'text-green-600'
                                        }`}>
                                            ${budget.remaining_amount.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${
                                                getStatusColor(budget.actual_spent, budget.budgeted_amount) === 'red'
                                                    ? 'bg-red-500'
                                                    : getStatusColor(budget.actual_spent, budget.budgeted_amount) === 'yellow'
                                                    ? 'bg-yellow-500'
                                                    : 'bg-green-500'
                                            }`}
                                            style={{
                                                width: `${calculateProgress(
                                                    budget.actual_spent,
                                                    budget.budgeted_amount
                                                )}%`
                                            }}
                                        ></div>
                                    </div>
                                    <div className="text-xs text-gray-500 pt-2">
                                        {new Date(budget.start_date).toLocaleDateString()} - {new Date(budget.end_date).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}; 