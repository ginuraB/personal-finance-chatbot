from openai import OpenAI
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def search_finance_files(query: str):
    try:
        response = client.responses.create(
            model="gpt-4.1",
            tools=[{
                "type": "file_search",
                "vector_store_ids": [os.getenv("VECTOR_STORE_ID", "")],
                "max_num_results": 5
            }],
            input=f"Search for information about: {query}",
            include=["file_search_call.results"]
        )
        
        # Extract text response and citations
        if hasattr(response, 'output_text'):
            return {
                "query": query,
                "results": response.output_text,
                "source": "AI-powered file search"
            }
            
        # If output_text is not available, try to extract from message content
        for output in response.output:
            if output.type == "message":
                for content in output.content:
                    if content.type == "output_text":
                        return {
                            "query": query,
                            "results": content.text,
                            "source": "AI-powered file search"
                        }
        
        return {
            "query": query,
            "results": "No results found",
            "source": "AI-powered file search"
        }
    except Exception as e:
        raise ValueError(f"Error in file search: {str(e)}")

