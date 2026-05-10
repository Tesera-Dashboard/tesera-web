from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import auth, orders, inventory, shipments, test, ai, workflows
from app.core.database import engine, Base
from app.models import ai_chat, workflow

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-powered operations assistant platform for SMEs",
    version="1.0.0",
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(orders.router, prefix=f"{settings.API_V1_STR}/orders", tags=["orders"])
app.include_router(inventory.router, prefix=f"{settings.API_V1_STR}/inventory", tags=["inventory"])
app.include_router(shipments.router, prefix=f"{settings.API_V1_STR}/shipments", tags=["shipments"])
app.include_router(test.router, prefix=f"{settings.API_V1_STR}/test", tags=["test"])
app.include_router(ai.router, prefix=f"{settings.API_V1_STR}/ai", tags=["ai"])
app.include_router(workflows.router, prefix=f"{settings.API_V1_STR}/workflows", tags=["workflows"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Tesera API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
