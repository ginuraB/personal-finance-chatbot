import requests

def get_exchange_rate(base: str, target: str):
    url = f"https://api.exchangerate.host/latest?base={base.upper()}&symbols={target.upper()}"
    try:
        response = requests.get(url)
        data = response.json()
        rate = data["rates"][target.upper()]
        return {
            "base": base.upper(),
            "target": target.upper(),
            "rate": rate
        }
    except Exception as e:
        return {"error": str(e)}
