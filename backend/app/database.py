from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import pyodbc

# Function to get connection string
def get_connection_string():
    servers_to_try = [
        f"tcp:{os.getenv('DB_SERVER', 'localhost')}\\SQLEXPRESS,1433",
        f"{os.getenv('DB_SERVER', 'localhost')}\\SQLEXPRESS"
    ]
    
    for server in servers_to_try:
        conn_str = (
            f"DRIVER={{SQL Server}};"
            f"SERVER={server};"
            f"DATABASE={os.getenv('DB_NAME', 'FinanceBot')};"
            "Trusted_Connection=yes;"
        )
        print(f"\nTrying connection with SERVER={server}")
        print(f"Connection string: {conn_str}")
        
        try:
            engine = create_engine(f"mssql+pyodbc:///?odbc_connect={conn_str}")
            # Test the connection
            with engine.connect() as connection:
                connection.execute("SELECT 1")
            print(f"Successfully connected using {server}")
            return f"mssql+pyodbc:///?odbc_connect={conn_str}"
        except Exception as e:
            print(f"Failed attempt with {server}: {str(e)}")
            continue
    
    raise Exception("Could not connect to any SQL Server instance")

# Create SQLAlchemy engine
try:
    SQLALCHEMY_DATABASE_URL = get_connection_string()
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
except Exception as e:
    print(f"Error creating database engine: {str(e)}")
    # Fallback to SQLite for development/testing
    SQLALCHEMY_DATABASE_URL = "sqlite:///./finance.db"
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 