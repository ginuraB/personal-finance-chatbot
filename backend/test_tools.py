import unittest
import requests

BASE_URL = "http://localhost:8000/api"

class TestToolsAPI(unittest.TestCase):
    def test_chat_agent(self):
        response = requests.post(f"{BASE_URL}/agent", json={"query": "How can I save money?"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("message", data)
        self.assertIn("timestamp", data)

    def test_stock_price(self):
        response = requests.get(f"{BASE_URL}/stock-price/AAPL")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("symbol", data)
        self.assertIn("price", data)
        self.assertIn("currency", data)
        self.assertIn("timestamp", data)

    def test_web_search(self):
        response = requests.get(f"{BASE_URL}/web-search?query=stock market news")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("query", data)
        self.assertIn("results", data)
        self.assertIn("timestamp", data)

    def test_exchange_rate(self):
        response = requests.get(f"{BASE_URL}/exchange-rate?base=USD&target=EUR")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("base", data)
        self.assertIn("target", data)
        self.assertIn("rate", data)
        self.assertIn("timestamp", data)

if __name__ == "__main__":
    unittest.main() 