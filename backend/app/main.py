from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import expenses, budgets, tools
from app.database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(expenses.router, prefix="/api", tags=["expenses"])
app.include_router(budgets.router, prefix="/api", tags=["budgets"])
app.include_router(tools.router, prefix="/api", tags=["tools"])

@app.get("/")
async def root():
    return {"message": "Welcome to Personal Finance Manager API"} 