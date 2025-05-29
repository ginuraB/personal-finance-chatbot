from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from backend.tools.stock_prices import get_stock_price
from backend.tools.currency_rates import get_exchange_rate
from backend.agents.finance_agent import run_agent
from backend.tools.file_search_tool import search_finance_files
from backend.tools.web_search_tool import search_financial_news
from backend.tools.budgets import set_budget, get_budgets

router = APIRouter()

class ChatQuery(BaseModel):
    query: str

class BudgetCreate(BaseModel):
    user_id: int
    category: str
    amount: float
    start_date: str
    end_date: str

@router.get("/stock-price/{ticker}")
async def get_stock(ticker: str):
    try:
        result = get_stock_price(ticker)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/exchange-rate")
async def get_rate(base: str, target: str):
    try:
        result = get_exchange_rate(base, target)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/agent")
async def chat_with_agent(query: ChatQuery):
    try:
        response = run_agent(query.query)
        return {"status": "success", "response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/file-search")
async def file_search(query: str):
    try:
        result = search_finance_files(query)
        return {"status": "success", "response": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/web-search")
async def web_search(query: str):
    try:
        result = search_financial_news(query)
        return {"status": "success", "response": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/set-budget")
async def set_budget_route(budget: BudgetCreate):
    try:
        result = set_budget(
            budget.user_id,
            budget.category,
            budget.amount,
            budget.start_date,
            budget.end_date
        )
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/get-budgets/{user_id}")
async def get_budgets_route(user_id: int):
    try:
        result = get_budgets(user_id)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
