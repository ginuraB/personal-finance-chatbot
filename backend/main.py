from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.routes.chatbot_routes import router as chatbot_router
from backend.utils.database import init_db

app = FastAPI(
    title="Finance Chatbot API",
    description="A personal finance chatbot with various financial tools and capabilities",
    version="1.0.0"
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()

# Allow frontend (localhost:5173 from Vite and others)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register chatbot routes
app.include_router(chatbot_router, prefix="/api", tags=["chatbot"])

@app.get("/")
def root():
    return JSONResponse({
        "message": "Finance Bot Backend is running.",
        "status": "active",
        "endpoints": {
            "docs": "/docs",
            "redoc": "/redoc",
            "api": {
                "stock_price": "/api/stock-price/{ticker}",
                "exchange_rate": "/api/exchange-rate",
                "agent": "/api/agent",
                "file_search": "/api/file-search",
                "web_search": "/api/web-search",
                "set_budget": "/api/set-budget",
                "get_budgets": "/api/get-budgets/{user_id}"
            }
        }
    })
