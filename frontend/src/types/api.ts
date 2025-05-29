export interface ChatRequest {
    query: string;
}

export interface ChatResponse {
    message: string;
    timestamp: string;
}

export interface StockResponse {
    symbol: string;
    price: number;
    currency: string;
    timestamp: string;
}

export interface WebSearchResponse {
    query: string;
    results: string[];
    timestamp: string;
}

export interface Budget {
    category: string;
    amount: number;
    start_date: string;
    end_date: string;
    created_at: string;
}

export interface BudgetRequest {
    user_id: number;
    category: string;
    amount: number;
    start_date: string;
    end_date: string;
}

export interface BudgetResponse {
    budget: {
        budget_id: number;
        user_id: number;
        category: string;
        amount: number;
        start_date: string;
        end_date: string;
    };
    message: string;
}

export interface ExchangeRateResponse {
    base: string;
    target: string;
    rate: number;
    timestamp: string;
} 