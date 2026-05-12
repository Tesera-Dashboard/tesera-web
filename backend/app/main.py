from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import auth, orders, inventory, shipments, ai, test, workflows, notifications
from app.core.database import engine, Base

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-powered operations assistant platform for SMEs",
    version="1.0.0"
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(orders.router, prefix="/api/v1/orders", tags=["orders"])
app.include_router(inventory.router, prefix="/api/v1/inventory", tags=["inventory"])
app.include_router(shipments.router, prefix="/api/v1/shipments", tags=["shipments"])
app.include_router(ai.router, prefix="/api/v1/ai", tags=["ai"])
app.include_router(test.router, prefix="/api/v1/test", tags=["test"])
app.include_router(workflows.router, prefix="/api/v1/workflows", tags=["workflows"])
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["notifications"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Tesera API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
