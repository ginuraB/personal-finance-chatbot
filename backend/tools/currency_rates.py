import requests

def get_exchange_rate(base: str, target: str):
    url = f"https://api.exchangerate.host/latest?base={base.upper()}&symbols={target.upper()}"
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an error for bad status codes
        data = response.json()
        
        if not data.get("success", True):  # Check if the API indicates failure
            raise ValueError("API returned unsuccessful response")
            
        if "rates" not in data:
            raise ValueError("No rates data in response")
            
        if target.upper() not in data["rates"]:
            raise ValueError(f"Target currency {target.upper()} not found in rates")
            
        rate = data["rates"][target.upper()]
        return {
            "base": base.upper(),
            "target": target.upper(),
            "rate": round(float(rate), 4),
            "timestamp": data.get("timestamp", None)
        }
    except requests.RequestException as e:
        raise ValueError(f"Network error: {str(e)}")
    except (KeyError, TypeError, ValueError) as e:
        raise ValueError(f"Error processing exchange rate: {str(e)}")
    except Exception as e:
        raise ValueError(f"Unexpected error: {str(e)}")
