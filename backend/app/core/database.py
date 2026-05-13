from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings

engine_args: dict = {}

if settings.DATABASE_URL.startswith("sqlite"):
    engine_args["connect_args"] = {"check_same_thread": False}
else:
    # ── PostgreSQL / Render Free Tier Ayarları ───────────────────────────────
    # Render free DB, ~5 dakika hareketsizlik sonrası TCP bağlantısını keser.
    # pool_pre_ping tek başına yetmez; aşağıdaki ayarlar SSL EOF hatasını önler:
    #
    #   pool_recycle   : 300s — bağlantıları 5dk'da bir yenile (Render timeout'undan önce)
    #   pool_timeout   : 30s  — yeni bağlantı beklemesi için max süre
    #   keepalives_*   : TCP seviyesinde bağlantı canlı tutma (psycopg2)
    engine_args["pool_size"] = 10
    engine_args["max_overflow"] = 20
    engine_args["pool_recycle"] = 300        # 5 dakikada bir bağlantıyı yenile
    engine_args["pool_timeout"] = 30         # bağlantı beklemesi için max 30s
    engine_args["connect_args"] = {
        "keepalives": 1,
        "keepalives_idle": 60,       # 60s hareketsizlik sonrası keepalive gönder
        "keepalives_interval": 10,   # keepalive paketi arası 10s
        "keepalives_count": 5,       # 5 başarısız keepalive → bağlantı kopar
        "connect_timeout": 10,       # bağlantı kurma timeout'u
    }

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,   # her checkout'ta bağlantıyı test et
    **engine_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""
    pass


def get_db():
    """FastAPI dependency — yields a DB session and guarantees cleanup."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
