from db.connection import get_db

def add_expense(user_id: int, amount: float, category: str, description: str, date: str):
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO Expenses (user_id, amount, category, description, date)
            VALUES (?, ?, ?, ?, ?)
        """, (user_id, amount, category, description, date))
        conn.commit()
        return {"status": "success", "message": "Expense added successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        conn.close()
