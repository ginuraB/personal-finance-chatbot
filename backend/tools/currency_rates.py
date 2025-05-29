import requests

def get_exchange_rate(base: str, target: str):
    url = f"https://api.exchangerate.host/latest?base={base.upper()}&symbols={target.upper()}"
    try:
        response = requests.get(url)
        data = response.json()
        if "rates" not in data or target.upper() not in data["rates"]:
            raise ValueError("Unable to fetch exchange rate")
            
        rate = data["rates"][target.upper()]
        return {
            "base": base.upper(),
            "target": target.upper(),
            "rate": round(float(rate), 4),
            "timestamp": data.get("timestamp")
        }
    except Exception as e:
        raise ValueError(f"Error fetching exchange rate: {str(e)}")
