from datetime import datetime
from typing import Dict, List
from backend.utils.database import get_db_connection

def set_budget(user_id: int, category: str, amount: float, start_date: str, end_date: str):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Insert new budget
        cursor.execute("""
            INSERT INTO dbo.T_SNG_Budgets (user_id, category, amount, start_date, end_date)
            VALUES (?, ?, ?, ?, ?)
        """, (user_id, category, amount, start_date, end_date))
        
        conn.commit()
        
        # Get the inserted budget using the view
        cursor.execute("""
            SELECT 
                category,
                budgeted_amount,
                actual_spent,
                remaining_amount,
                start_date,
                end_date
            FROM dbo.V_SNG_BudgetStatus_L1
            WHERE user_id = ? AND category = ?
        """, (user_id, category))
        
        row = cursor.fetchone()
        
        if row:
            budget = {
                "category": row[0],
                "budgeted_amount": float(row[1]),
                "actual_spent": float(row[2]) if row[2] is not None else 0.0,
                "remaining_amount": float(row[3]) if row[3] is not None else float(row[1]),
                "start_date": row[4].strftime("%Y-%m-%d"),
                "end_date": row[5].strftime("%Y-%m-%d")
            }
            
            return {
                "user_id": user_id,
                "budget": budget,
                "message": "Budget successfully created"
            }
        
        raise ValueError("Failed to retrieve created budget")
        
    except Exception as e:
        raise ValueError(f"Error setting budget: {str(e)}")
    finally:
        cursor.close()
        conn.close()

def get_budgets(user_id: int):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get all budgets for user using the view
        cursor.execute("""
            SELECT 
                category,
                budgeted_amount,
                actual_spent,
                remaining_amount,
                start_date,
                end_date
            FROM dbo.V_SNG_BudgetStatus_L1
            WHERE user_id = ?
            ORDER BY start_date DESC
        """, (user_id,))
        
        budgets = []
        for row in cursor.fetchall():
            budget = {
                "category": row[0],
                "budgeted_amount": float(row[1]),
                "actual_spent": float(row[2]) if row[2] is not None else 0.0,
                "remaining_amount": float(row[3]) if row[3] is not None else float(row[1]),
                "start_date": row[4].strftime("%Y-%m-%d"),
                "end_date": row[5].strftime("%Y-%m-%d")
            }
            budgets.append(budget)
        
        return {
            "user_id": user_id,
            "budgets": budgets,
            "count": len(budgets)
        }
        
    except Exception as e:
        raise ValueError(f"Error getting budgets: {str(e)}")
    finally:
        cursor.close()
        conn.close()
