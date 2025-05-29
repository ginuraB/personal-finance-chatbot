import React, { useState, useEffect } from 'react';
import { expenseApi } from '../services/api';
import type { Expense } from '../types';

interface ExpensesProps {
    userId: number;
}

export const Expenses: React.FC<ExpensesProps> = ({ userId }) => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [categoryTotals, setCategoryTotals] = useState<{ category: string; total: number }[]>([]);
    const [newExpense, setNewExpense] = useState({
        amount: '',
        category: '',
        description: '',
        expense_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        loadExpenses();
        loadCategoryTotals();
    }, [userId]);

    const loadExpenses = async () => {
        try {
            setLoading(true);
            const data = await expenseApi.getExpenses(userId);
            setExpenses(data);
            setError(null);
        } catch (err) {
            setError('Failed to load expenses');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadCategoryTotals = async () => {
        try {
            const data = await expenseApi.getExpensesByCategory(userId);
            setCategoryTotals(data);
        } catch (err) {
            console.error('Failed to load category totals:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await expenseApi.createExpense({
                user_id: userId,
                amount: parseFloat(newExpense.amount),
                category: newExpense.category,
                description: newExpense.description,
                expense_date: newExpense.expense_date
            });
            setNewExpense({
                amount: '',
                category: '',
                description: '',
                expense_date: new Date().toISOString().split('T')[0]
            });
            await Promise.all([loadExpenses(), loadCategoryTotals()]);
            setError(null);
        } catch (err) {
            setError('Failed to create expense');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (expenseId: number) => {
        try {
            setLoading(true);
            await expenseApi.deleteExpense(expenseId);
            await Promise.all([loadExpenses(), loadCategoryTotals()]);
            setError(null);
        } catch (err) {
            setError('Failed to delete expense');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Category Summary */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Category Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {categoryTotals.map((cat) => (
                        <div key={cat.category} className="bg-gray-50 p-4 rounded-md">
                            <h4 className="font-medium text-gray-700">{cat.category}</h4>
                            <p className="text-2xl font-bold text-blue-600">
                                ${cat.total.toFixed(2)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add New Expense Form */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Add New Expense</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Amount</label>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={newExpense.amount}
                                onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <input
                                type="text"
                                placeholder="e.g., Groceries"
                                value={newExpense.category}
                                onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <input
                                type="text"
                                placeholder="Brief description"
                                value={newExpense.description}
                                onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date</label>
                            <input
                                type="date"
                                value={newExpense.expense_date}
                                onChange={e => setNewExpense({...newExpense, expense_date: e.target.value})}
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
                            {loading ? 'Adding...' : 'Add Expense'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Expenses List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold">Recent Expenses</h3>
                </div>
                {error && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-500">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                            <span className="ml-2">Loading expenses...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : expenses.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                        No expenses found. Add your first expense above.
                                    </td>
                                </tr>
                            ) : (
                                expenses.map(expense => (
                                    <tr key={expense.expense_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(expense.expense_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {expense.category}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {expense.description}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            ${expense.amount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleDelete(expense.expense_id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}; 