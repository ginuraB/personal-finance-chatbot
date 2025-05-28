from openai import OpenAI

client = OpenAI()

def search_financial_news(query: str):
    response = client.responses.create(
        model="gpt-4.1",
        tools=[{"type": "web_search_preview"}],
        input=query
    )
    return response.output_text
