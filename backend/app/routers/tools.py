from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
import yfinance as yf
import requests
from typing import List
import os
from dotenv import load_dotenv
import httpx

load_dotenv()

router = APIRouter()

# Models
class ChatRequest(BaseModel):
    query: str

class ChatResponse(BaseModel):
    message: str
    timestamp: str

class StockResponse(BaseModel):
    symbol: str
    price: float
    currency: str
    timestamp: str

class WebSearchResponse(BaseModel):
    query: str
    results: List[str]
    timestamp: str

class ExchangeRateResponse(BaseModel):
    base: str
    target: str
    rate: float
    timestamp: str

# Chat Agent endpoint
@router.post("/agent", response_model=ChatResponse)
async def chat_with_agent(request: ChatRequest):
    try:
        # Here you would typically call your AI model or service
        # For now, we'll return a simple response based on keywords
        query = request.query.lower()
        if "save" in query or "saving" in query:
            response = "To save money effectively: 1) Create a budget, 2) Track all expenses, 3) Set up automatic savings, 4) Cut unnecessary expenses, 5) Look for better deals on regular bills."
        elif "invest" in query or "investing" in query:
            response = "For investing: 1) Start with emergency fund, 2) Consider low-cost index funds, 3) Diversify your portfolio, 4) Invest regularly through dollar-cost averaging, 5) Consider your risk tolerance."
        elif "budget" in query:
            response = "To create a budget: 1) Track your income, 2) List all expenses, 3) Categorize spending, 4) Set realistic limits, 5) Review and adjust regularly."
        else:
            response = "I recommend: 1) Track your expenses, 2) Create a budget, 3) Save at least 20% of income, 4) Build emergency fund, 5) Invest for long-term goals."
        
        return ChatResponse(
            message=response,
            timestamp=datetime.now().isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Stock Price endpoint
@router.get("/stock-price/{symbol}", response_model=StockResponse)
async def get_stock_price(symbol: str):
    try:
        # Clean and validate the symbol
        symbol = symbol.strip().upper()
        if not symbol.isalpha() or not 1 <= len(symbol) <= 5:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid stock symbol format: {symbol}. Should be 1-5 letters."
            )

        # Get stock info
        stock = yf.Ticker(symbol)
        
        # Force an info refresh to get latest data
        stock.info
        
        # Get current price data
        current = stock.history(period='1d')
        
        if current.empty:
            raise HTTPException(
                status_code=404,
                detail=f"No price data found for symbol {symbol}. Please verify the symbol is correct."
            )
            
        price = current['Close'].iloc[-1]
        currency = stock.info.get('currency', 'USD')
        
        if not price or price <= 0:
            raise HTTPException(
                status_code=404,
                detail=f"Invalid price data for symbol {symbol}. Please try again later."
            )
        
        return StockResponse(
            symbol=symbol,
            price=price,
            currency=currency,
            timestamp=datetime.now().isoformat()
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch stock price for {symbol}: {str(e)}"
        )

# Web Search endpoint
@router.get("/web-search", response_model=WebSearchResponse)
async def search_web(query: str):
    try:
        if not query:
            raise HTTPException(status_code=400, detail="Search query cannot be empty")
            
        # Here we'll provide more realistic mock results based on the query
        query_lower = query.lower()
        if "market" in query_lower:
            results = [
                "Stock Market Today: Major indices show mixed performance",
                "Market Analysis: Tech sector leads gains amid economic recovery",
                "Global Markets: Asian markets rally on strong economic data"
            ]
        elif "crypto" in query_lower or "bitcoin" in query_lower:
            results = [
                "Bitcoin surges past key resistance levels",
                "Cryptocurrency adoption grows among institutional investors",
                "Digital currency regulations: What you need to know"
            ]
        elif "stock" in query_lower:
            results = [
                "Top performing stocks of the quarter",
                "Stock picking strategies for volatile markets",
                "Analyst recommendations for growth stocks"
            ]
        else:
            results = [
                f"Latest financial news related to: {query}",
                "Economic indicators point to continued growth",
                "Investment strategies for current market conditions"
            ]
        
        return WebSearchResponse(
            query=query,
            results=results,
            timestamp=datetime.now().isoformat()
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Exchange Rate endpoint
@router.get("/exchange-rate", response_model=ExchangeRateResponse)
async def get_exchange_rate(base: str, target: str):
    try:
        # Validate currency codes
        base = base.strip().upper()
        target = target.strip().upper()
        
        valid_currencies = {
            'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR',
            'NZD', 'SEK', 'KRW', 'SGD', 'NOK', 'MXN', 'HKD', 'TRY', 'RUB'
        }
        
        if base not in valid_currencies:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid base currency: {base}. Must be one of: {', '.join(sorted(valid_currencies))}"
            )
            
        if target not in valid_currencies:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid target currency: {target}. Must be one of: {', '.join(sorted(valid_currencies))}"
            )
            
        if base == target:
            return ExchangeRateResponse(
                base=base,
                target=target,
                rate=1.0,
                timestamp=datetime.now().isoformat()
            )

        # Using exchangerate-api.com
        api_key = os.getenv("EXCHANGE_RATE_API_KEY", "")
        if not api_key:
            # Provide realistic mock rates
            mock_rates = {
                'USD': {'EUR': 0.85, 'GBP': 0.73, 'JPY': 110.0},
                'EUR': {'USD': 1.18, 'GBP': 0.86, 'JPY': 129.5},
                'GBP': {'USD': 1.37, 'EUR': 1.16, 'JPY': 150.0},
                'JPY': {'USD': 0.0091, 'EUR': 0.0077, 'GBP': 0.0067}
            }
            
            # If we have a direct rate
            if base in mock_rates and target in mock_rates[base]:
                rate = mock_rates[base][target]
            # If we have an inverse rate
            elif target in mock_rates and base in mock_rates[target]:
                rate = 1 / mock_rates[target][base]
            # If we can calculate through USD
            elif base in mock_rates and 'USD' in mock_rates[base] and target in mock_rates['USD']:
                usd_rate = mock_rates[base]['USD']
                target_rate = mock_rates['USD'][target]
                rate = usd_rate * target_rate
            else:
                # Fallback to a reasonable mock rate
                rate = 1.1  # Slightly above 1 to simulate a realistic rate
                
            return ExchangeRateResponse(
                base=base,
                target=target,
                rate=rate,
                timestamp=datetime.now().isoformat()
            )

        url = f"https://v6.exchangerate-api.com/v6/{api_key}/pair/{base}/{target}"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=5.0)
            
        if response.status_code == 200:
            data = response.json()
            return ExchangeRateResponse(
                base=base,
                target=target,
                rate=data["conversion_rate"],
                timestamp=datetime.now().isoformat()
            )
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Failed to fetch exchange rate: {response.text}"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get exchange rate: {str(e)}"
        ) 