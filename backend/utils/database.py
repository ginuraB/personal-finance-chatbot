import pyodbc
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_db_connection():
    """Create a connection to SQL Server"""
    try:
        # Try different connection approaches
        connection_attempts = [
            # Attempt 1: Using TCP/IP
            {
                'server': 'tcp:LAPTOP-F28H3QUD\\SQLEXPRESS01,1433',
                'driver': 'SQL Server'
            },
            # Attempt 2: Using local server name
            {
                'server': 'LAPTOP-F28H3QUD\\SQLEXPRESS01',
                'driver': 'SQL Server'
            },
            # Attempt 3: Using localhost
            {
                'server': '(local)\\SQLEXPRESS01',
                'driver': 'SQL Server'
            }
        ]

        last_error = None
        for attempt in connection_attempts:
            try:
                print(f"\nTrying connection with SERVER={attempt['server']}")
                conn_str = (
                    f"DRIVER={{{attempt['driver']}}};"
                    f"SERVER={attempt['server']};"
                    "DATABASE=FinanceBot;"
                    "Trusted_Connection=yes;"
                )
                print(f"Connection string: {conn_str}")
                conn = pyodbc.connect(conn_str)
                print(f"Successfully connected using {attempt['server']}")
                return conn
            except Exception as e:
                print(f"Failed attempt with {attempt['server']}: {str(e)}")
                last_error = e
                continue

        if last_error:
            raise last_error

    except Exception as e:
        print(f"All connection attempts failed. Last error: {str(e)}")
        raise Exception(f"Failed to connect to database: {str(e)}")

def init_db():
    """Initialize the database with required tables"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # First, ensure the database exists
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'FinanceBot')
            BEGIN
                CREATE DATABASE FinanceBot;
            END
        """)
        conn.commit()
        
        # Switch to the FinanceBot database
        cursor.execute("USE FinanceBot;")
        
        # Create Users table
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'T_SNG_Users')
            BEGIN
                CREATE TABLE dbo.T_SNG_Users (
                    user_id INT IDENTITY(1,1) PRIMARY KEY,
                    username VARCHAR(100) UNIQUE,
                    email VARCHAR(255),
                    password_hash VARCHAR(255)
                )
            END
        """)

        # Create Expenses table
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'T_SNG_Expenses')
            BEGIN
                CREATE TABLE dbo.T_SNG_Expenses (
                    expense_id INT IDENTITY(1,1) PRIMARY KEY,
                    user_id INT NOT NULL,
                    amount DECIMAL(10,2) NOT NULL,
                    category VARCHAR(100),
                    description VARCHAR(255),
                    expense_date DATE
                )
            END
        """)

        # Create Budgets table
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'T_SNG_Budgets')
            BEGIN
                CREATE TABLE dbo.T_SNG_Budgets (
                    budget_id INT IDENTITY(1,1) PRIMARY KEY,
                    user_id INT NOT NULL,
                    category VARCHAR(100),
                    amount DECIMAL(10,2),
                    start_date DATE,
                    end_date DATE
                )
            END
        """)

        # Add foreign key constraints if they don't exist
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Expenses_Users')
            BEGIN
                ALTER TABLE dbo.T_SNG_Expenses
                ADD CONSTRAINT FK_Expenses_Users FOREIGN KEY (user_id)
                REFERENCES dbo.T_SNG_Users(user_id)
            END
        """)

        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Budgets_Users')
            BEGIN
                ALTER TABLE dbo.T_SNG_Budgets
                ADD CONSTRAINT FK_Budgets_Users FOREIGN KEY (user_id)
                REFERENCES dbo.T_SNG_Users(user_id)
            END
        """)

        # Create views
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sys.views WHERE name = 'V_SNG_UserExpenses_L1')
            BEGIN
                EXEC('CREATE VIEW dbo.V_SNG_UserExpenses_L1 AS
                SELECT
                    e.expense_id,
                    e.user_id,
                    e.amount,
                    e.category,
                    e.description,
                    e.expense_date,
                    FORMAT(e.expense_date, ''yyyy-MM'') AS expense_month
                FROM
                    dbo.T_SNG_Expenses AS e')
            END
        """)

        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sys.views WHERE name = 'V_SNG_ExpenseSummaryByCategory_L1')
            BEGIN
                EXEC('CREATE VIEW dbo.V_SNG_ExpenseSummaryByCategory_L1 AS
                SELECT
                    user_id,
                    category,
                    SUM(amount) AS total_amount,
                    COUNT(*) AS entry_count
                FROM
                    dbo.T_SNG_Expenses
                GROUP BY
                    user_id, category')
            END
        """)

        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sys.views WHERE name = 'V_SNG_BudgetStatus_L1')
            BEGIN
                EXEC('CREATE VIEW dbo.V_SNG_BudgetStatus_L1 AS
                SELECT
                    b.user_id,
                    b.category,
                    b.amount AS budgeted_amount,
                    SUM(e.amount) AS actual_spent,
                    (b.amount - ISNULL(SUM(e.amount), 0)) AS remaining_amount,
                    b.start_date,
                    b.end_date
                FROM
                    dbo.T_SNG_Budgets AS b
                LEFT JOIN
                    dbo.T_SNG_Expenses AS e
                    ON b.user_id = e.user_id
                    AND b.category = e.category
                    AND e.expense_date BETWEEN b.start_date AND b.end_date
                GROUP BY
                    b.user_id, b.category, b.amount, b.start_date, b.end_date')
            END
        """)

        conn.commit()
        print("Database and tables created successfully")
        
    except Exception as e:
        print(f"Database initialization error: {str(e)}")
        raise e
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close() 