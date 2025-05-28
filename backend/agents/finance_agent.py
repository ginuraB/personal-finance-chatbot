import os
from openai import OpenAI
from tools.stocks import get_stock_price
from tools.currency import get_exchange_rate

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

functions = [
    {
        "name": "get_stock_price",
        "description": "Get the current stock price",
        "parameters": {
            "type": "object",
            "properties": {
                "ticker": {"type": "string"}
            },
            "required": ["ticker"]
        }
    },
    {
        "name": "get_exchange_rate",
        "description": "Get currency conversion rate",
        "parameters": {
            "type": "object",
            "properties": {
                "base": {"type": "string"},
                "target": {"type": "string"}
            },
            "required": ["base", "target"]
        }
    }
]

def run_agent(user_query: str):
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are a helpful finance assistant."},
            {"role": "user", "content": user_query}
        ],
        tools=[
            {
                "type": "function",
                "function": f
            } for f in functions
        ]
    )
    return response.choices[0].message.content
