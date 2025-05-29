import React, { useState } from 'react';
import { getExchangeRate } from '../services/api';

const currencies = {
    USD: 'US Dollar',
    EUR: 'Euro',
    GBP: 'British Pound',
    JPY: 'Japanese Yen',
    AUD: 'Australian Dollar',
    CAD: 'Canadian Dollar',
    CHF: 'Swiss Franc',
    CNY: 'Chinese Yuan',
    INR: 'Indian Rupee',
    NZD: 'New Zealand Dollar',
    SEK: 'Swedish Krona',
    KRW: 'South Korean Won',
    SGD: 'Singapore Dollar',
    NOK: 'Norwegian Krone',
    MXN: 'Mexican Peso',
    HKD: 'Hong Kong Dollar',
    TRY: 'Turkish Lira',
    RUB: 'Russian Ruble'
} as const;

type CurrencyCode = keyof typeof currencies;

interface ConversionResult {
    from: CurrencyCode;
    to: CurrencyCode;
    amount: number;
    rate: number;
    result: number;
    timestamp: string;
}

export const ExchangeRate: React.FC = () => {
    const [amount, setAmount] = useState('1');
    const [fromCurrency, setFromCurrency] = useState<CurrencyCode>('USD');
    const [toCurrency, setToCurrency] = useState<CurrencyCode>('EUR');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [conversionHistory, setConversionHistory] = useState<ConversionResult[]>([]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (fromCurrency === toCurrency) {
            setError('Please select different currencies');
            return;
        }

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await getExchangeRate(fromCurrency, toCurrency);
            const result: ConversionResult = {
                from: fromCurrency,
                to: toCurrency,
                amount: numAmount,
                rate: response.rate,
                result: numAmount * response.rate,
                timestamp: response.timestamp
            };
            setConversionHistory(prev => [result, ...prev].slice(0, 10)); // Keep last 10 conversions
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to fetch exchange rate');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Exchange Rate Calculator</h1>
            
            <form onSubmit={handleSubmit} className="mb-8">
                <div className="grid gap-6 md:grid-cols-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Amount
                        </label>
                        <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter amount"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            From
                        </label>
                        <select
                            value={fromCurrency}
                            onChange={(e) => setFromCurrency(e.target.value as CurrencyCode)}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            {Object.entries(currencies).map(([code, name]) => (
                                <option key={code} value={code}>
                                    {code} - {name}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            To
                        </label>
                        <select
                            value={toCurrency}
                            onChange={(e) => setToCurrency(e.target.value as CurrencyCode)}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            {Object.entries(currencies).map(([code, name]) => (
                                <option key={code} value={code}>
                                    {code} - {name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-6 py-2 rounded-lg text-white font-medium ${
                            loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {loading ? 'Converting...' : 'Convert'}
                    </button>
                </div>
            </form>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                    {error}
                </div>
            )}

            {conversionHistory.length > 0 && (
                <div>
                    <h2 className="text-xl font-semibold mb-4">Conversion History</h2>
                    <div className="space-y-4">
                        {conversionHistory.map((conversion, index) => (
                            <div
                                key={index}
                                className="p-4 border rounded-lg hover:shadow-sm transition-shadow"
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm text-gray-600">From</div>
                                        <div className="font-medium">
                                            {conversion.amount.toFixed(2)} {conversion.from}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600">To</div>
                                        <div className="font-medium text-blue-600">
                                            {conversion.result.toFixed(2)} {conversion.to}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-2 text-sm text-gray-500">
                                    Rate: 1 {conversion.from} = {conversion.rate.toFixed(4)} {conversion.to}
                                </div>
                                <div className="text-xs text-gray-400">
                                    {new Date(conversion.timestamp).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}; 