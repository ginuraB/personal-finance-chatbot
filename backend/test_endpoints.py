import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

def test_root():
    print("\n🔍 Testing root endpoint...")
    response = requests.get(f"{BASE_URL}/")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

def test_stock_price():
    print("\n🔍 Testing stock price endpoint...")
    ticker = "AAPL"
    response = requests.get(f"{BASE_URL}/api/stock-price/{ticker}")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

def test_exchange_rate():
    print("\n🔍 Testing exchange rate endpoint...")
    base = "USD"
    target = "EUR"
    response = requests.get(f"{BASE_URL}/api/exchange-rate?base={base}&target={target}")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

def test_chat_agent():
    print("\n🔍 Testing chat agent endpoint...")
    query = "What's the current price of Apple stock?"
    response = requests.post(
        f"{BASE_URL}/api/agent",
        json={"query": query}
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

def test_file_search():
    print("\n🔍 Testing file search endpoint...")
    query = "budget expenses"
    response = requests.get(f"{BASE_URL}/api/file-search?query={query}")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

def test_budget_operations():
    print("\n🔍 Testing budget operations...")
    
    # Test setting a budget
    budget_data = {
        "user_id": 1,
        "category": "groceries",
        "amount": 500.00,
        "start_date": datetime.now().strftime("%Y-%m-%d"),
        "end_date": "2024-12-31"
    }
    
    response = requests.post(
        f"{BASE_URL}/api/set-budget",
        json=budget_data
    )
    print("\nSetting budget:")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    # Test getting budgets
    response = requests.get(f"{BASE_URL}/api/get-budgets/1")
    print("\nGetting budgets:")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

def run_all_tests():
    try:
        test_root()
        test_stock_price()
        test_exchange_rate()
        test_chat_agent()
        test_file_search()
        test_budget_operations()
        print("\n✅ All tests completed!")
    except Exception as e:
        print(f"\n❌ Error during testing: {str(e)}")

if __name__ == "__main__":
    run_all_tests() 