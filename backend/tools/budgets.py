from datetime import datetime
from typing import Dict, List

# Simple in-memory storage
budgets_db: Dict[int, List[Dict]] = {}

def set_budget(user_id: int, category: str, amount: float, start_date: str, end_date: str):
    try:
        budget = {
            "category": category,
            "amount": amount,
            "start_date": start_date,
            "end_date": end_date,
            "created_at": datetime.now().isoformat()
        }
        
        if user_id not in budgets_db:
            budgets_db[user_id] = []
            
        budgets_db[user_id].append(budget)
        
        return {
            "user_id": user_id,
            "budget": budget,
            "message": "Budget successfully created"
        }
    except Exception as e:
        raise ValueError(f"Error setting budget: {str(e)}")

def get_budgets(user_id: int):
    try:
        if user_id not in budgets_db:
            return {
                "user_id": user_id,
                "budgets": [],
                "message": "No budgets found for this user"
            }
            
        return {
            "user_id": user_id,
            "budgets": budgets_db[user_id],
            "count": len(budgets_db[user_id])
        }
    except Exception as e:
        raise ValueError(f"Error getting budgets: {str(e)}")
