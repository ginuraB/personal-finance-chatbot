from openai import OpenAI
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def search_finance_files(query: str):
    try:
        # Get vector store ID and validate it
        vector_store_id = os.getenv("VECTOR_STORE_ID")
        if not vector_store_id or not vector_store_id.startswith("vs_"):
            return {
                "query": query,
                "results": "Vector store not properly configured",
                "source": "File search"
            }

        response = client.responses.create(
            model="gpt-4.1",
            tools=[{
                "type": "file_search",
                "vector_store_ids": [vector_store_id],
                "max_num_results": 5
            }],
            input=f"Search for information about: {query}"
        )
        
        # Extract text response and citations
        if hasattr(response, 'output_text'):
            return {
                "query": query,
                "results": response.output_text,
                "source": "File search"
            }
            
        # If output_text is not available, try to extract from message content
        for output in response.output:
            if output.type == "message":
                for content in output.content:
                    if content.type == "output_text":
                        return {
                            "query": query,
                            "results": content.text,
                            "source": "File search"
                        }
        
        return {
            "query": query,
            "results": "No results found",
            "source": "File search"
        }
    except Exception as e:
        raise ValueError(f"Error in file search: {str(e)}")

