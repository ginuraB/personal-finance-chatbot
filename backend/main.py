from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.chatbot_routes import router as chatbot_router

app = FastAPI()

# Allow frontend (localhost:5173 from Vite)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register chatbot routes
app.include_router(chatbot_router)

@app.get("/")
def root():
    return {"message": "Finance Bot Backend is running."}
