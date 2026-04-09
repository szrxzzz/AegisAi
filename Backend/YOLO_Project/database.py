import os
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean # type: ignore
from sqlalchemy.orm import sessionmaker, declarative_base # type: ignore
from datetime import datetime

# SQLite DB stored in the same folder as this script, regardless of working directory
_HERE = os.path.dirname(os.path.abspath(__file__))
SQLALCHEMY_DATABASE_URL = f"sqlite:///{os.path.join(_HERE, 'energy_data.db')}"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# SQLAlchemy Model (Database Table Structure)
class EnergyLogDB(Base):
    __tablename__ = "energy_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    room = Column(String, index=True)
    quadrant = Column(String, index=True)
    device = Column(String, nullable=True)  # "light" or "fan"
    event = Column(String)  # "ON" or "OFF"
    auto_state = Column(Integer, nullable=True)  # Auto state from YOLO (0 or 1)
    manual_override = Column(Integer, nullable=True)  # Manual override state (0, 1, or None)
    final_state = Column(Integer, nullable=True)  # Final actual state (0 or 1)
    duration_s = Column(Float, nullable=True) # None for "ON" events
    energy_kwh = Column(Float, nullable=True) # None for "ON" events

# Create the database tables
Base.metadata.create_all(bind=engine)
