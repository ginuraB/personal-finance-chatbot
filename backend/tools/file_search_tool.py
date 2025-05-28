import os
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Initialize OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)


def search_finance_files(query: str):
    vector_store_id = "vs_6836df8f306881919cf54b2d7e654e4f"
    response = client.responses.create(
        model="gpt-4o-mini",
        input=query,
        tools=[{
            "type": "file_search",
            "vector_store_ids": [vector_store_id]
        }]
    )
    return response.output[1]["content"][0]["text"]

