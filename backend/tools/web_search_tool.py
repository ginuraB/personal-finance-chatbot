from openai import OpenAI
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def search_financial_news(query: str):
    try:
        response = client.responses.create(
            model="gpt-4.1",
            tools=[{
                "type": "web_search_preview",
                "search_context_size": "medium",
                "user_location": {
                    "type": "approximate",
                    "country": "US",
                    "timezone": "America/New_York"
                }
            }],
            input=query,
            include=["web_search_call.results"]
        )
        
        # Extract text response and citations
        if hasattr(response, 'output_text'):
            return {
                "query": query,
                "results": response.output_text,
                "source": "Web search"
            }
            
        # If output_text is not available, try to extract from message content
        for output in response.output:
            if output.type == "message":
                for content in output.content:
                    if content.type == "output_text":
                        return {
                            "query": query,
                            "results": content.text,
                            "source": "Web search"
                        }
        
        return {
            "query": query,
            "results": "No results found",
            "source": "Web search"
        }
    except Exception as e:
        raise ValueError(f"Error in web search: {str(e)}")
