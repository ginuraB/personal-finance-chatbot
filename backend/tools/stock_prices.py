import yfinance as yf

def get_stock_price(ticker: str):
    try:
        stock = yf.Ticker(ticker)
        price = stock.history(period="1d")["Close"].iloc[-1]
        return {
            "ticker": ticker.upper(),
            "price": round(price, 2),
            "currency": "USD"
        }
    except Exception as e:
        return {"error": str(e)}
