import axios, { AxiosError } from 'axios';
import type {
    ChatRequest,
    ChatResponse,
    StockResponse,
    WebSearchResponse,
    BudgetRequest,
    BudgetResponse,
    ExchangeRateResponse
} from '../types/api';
import type { Budget, Expense, User, BudgetStatus } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Error handling
const handleError = (error: AxiosError) => {
    if (error.response) {
        // Server responded with error
        throw new Error(error.response.data.detail || 'Server error occurred');
    } else if (error.request) {
        // No response received
        throw new Error('No response from server. Please check your connection.');
    } else {
        // Request setup error
        throw new Error('Error setting up request');
    }
};

export const chatWithAgent = async (query: string): Promise<ChatResponse> => {
    const response = await api.post<ChatResponse>('/agent', { query });
    return response.data;
};

export const getStockPrice = async (ticker: string): Promise<StockResponse> => {
    const response = await api.get<StockResponse>(`/stock-price/${ticker}`);
    return response.data;
};

export const searchWeb = async (query: string): Promise<WebSearchResponse> => {
    const response = await api.get<WebSearchResponse>(`/web-search?query=${encodeURIComponent(query)}`);
    return response.data;
};

export const setBudget = async (budget: BudgetRequest): Promise<BudgetResponse> => {
    const response = await api.post<BudgetResponse>('/set-budget', budget);
    return response.data;
};

export const getBudgets = async (userId: number): Promise<BudgetResponse> => {
    const response = await api.get<BudgetResponse>(`/get-budgets/${userId}`);
    return response.data;
};

export const getExchangeRate = async (base: string, target: string): Promise<ExchangeRateResponse> => {
    const response = await api.get<ExchangeRateResponse>(`/exchange-rate?base=${base}&target=${target}`);
    return response.data;
};

// Expenses API
export const expenseApi = {
    async createExpense(expense: Omit<Expense, 'expense_id'>): Promise<Expense> {
        try {
            const response = await api.post('/expenses', expense);
            return response.data;
        } catch (error) {
            handleError(error as AxiosError);
            throw error;
        }
    },

    async getExpenses(userId: number): Promise<Expense[]> {
        try {
            const response = await api.get(`/expenses/${userId}`);
            return response.data.expenses || [];
        } catch (error) {
            handleError(error as AxiosError);
            throw error;
        }
    },

    async getExpensesByCategory(userId: number): Promise<{ category: string; total: number }[]> {
        try {
            const response = await api.get(`/expenses/${userId}/by-category`);
            return response.data.categories || [];
        } catch (error) {
            handleError(error as AxiosError);
            throw error;
        }
    },

    async deleteExpense(expenseId: number): Promise<void> {
        try {
            await api.delete(`/expenses/${expenseId}`);
        } catch (error) {
            handleError(error as AxiosError);
            throw error;
        }
    }
};

// Budgets API
export const budgetApi = {
    async createBudget(budget: Omit<Budget, 'budget_id'>): Promise<Budget> {
        try {
            const response = await api.post('/set-budget', budget);
            return response.data.budget;
        } catch (error) {
            handleError(error as AxiosError);
            throw error;
        }
    },

    async getBudgets(userId: number): Promise<BudgetStatus[]> {
        try {
            const response = await api.get(`/get-budgets/${userId}`);
            return response.data.budgets || [];
        } catch (error) {
            handleError(error as AxiosError);
            throw error;
        }
    },

    async deleteBudget(budgetId: number): Promise<void> {
        try {
            await api.delete(`/budgets/${budgetId}`);
        } catch (error) {
            handleError(error as AxiosError);
            throw error;
        }
    }
};

// Users API
export const userApi = {
    async createUser(user: Omit<User, 'user_id'>): Promise<User> {
        try {
            const response = await api.post('/users', user);
            return response.data;
        } catch (error) {
            handleError(error as AxiosError);
            throw error;
        }
    },

    async login(username: string, password: string): Promise<{ user: User; token: string }> {
        try {
            const response = await api.post('/login', { username, password });
            return response.data;
        } catch (error) {
            handleError(error as AxiosError);
            throw error;
        }
    }
};

// Chat API
export const chatApi = {
    async sendMessage(message: string): Promise<{ response: string }> {
        const response = await axios.post(`${API_BASE_URL}/agent`, { message });
        return response.data;
    }
}; 