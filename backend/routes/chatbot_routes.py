from tools.stocks import get_stock_price
from tools.currency import get_exchange_rate
from agents.finance_agent import run_agent

@router.get("/stock-price/{ticker}")
def get_stock(ticker: str):
    return get_stock_price(ticker)

@router.get("/exchange-rate")
def get_rate(base: str, target: str):
    return get_exchange_rate(base, target)

@router.post("/agent")
def chat_with_agent(query: str):
    return {"response": run_agent(query)}




from tools.file_search import search_finance_files

@router.get("/file-search")
def file_search(query: str):
    return {"response": search_finance_files(query)}
