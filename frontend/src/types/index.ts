export interface User {
    user_id: number;
    username: string;
    email: string;
}

export interface Expense {
    expense_id: number;
    user_id: number;
    amount: number;
    category: string;
    description: string;
    expense_date: string;
}

export interface Budget {
    budget_id: number;
    user_id: number;
    category: string;
    amount: number;
    start_date: string;
    end_date: string;
}

export interface BudgetStatus {
    category: string;
    budgeted_amount: number;
    actual_spent: number;
    remaining_amount: number;
    start_date: string;
    end_date: string;
} 