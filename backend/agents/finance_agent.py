import os
from openai import OpenAI
from backend.tools.stock_prices import get_stock_price
from backend.tools.currency_rates import get_exchange_rate
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def run_agent(user_query: str):
    try:
        # Define available tools
        tools = [
            {
                "type": "web_search_preview",
                "search_context_size": "medium"
            }
        ]
        
        # Only add file search if we have a valid vector store ID
        vector_store_id = os.getenv("VECTOR_STORE_ID")
        if vector_store_id and vector_store_id.startswith("vs_"):
            tools.append({
                "type": "file_search",
                "vector_store_ids": [vector_store_id],
                "max_num_results": 5
            })

        # Create response using the Responses API
        response = client.responses.create(
            model="gpt-4.1",
            tools=tools,
            instructions="You are a helpful finance assistant. Use web search for market data and news. For calculations and data analysis, explain the process clearly.",
            input=user_query
        )

        # Extract the text response
        if hasattr(response, 'output_text'):
            return response.output_text
        
        # If output_text is not available, try to extract from message content
        for output in response.output:
            if output.type == "message":
                for content in output.content:
                    if content.type == "output_text":
                        return content.text
        
        return "I couldn't process your request at this time."
        
    except Exception as e:
        raise ValueError(f"Error in chat agent: {str(e)}")
