from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from qr_generator import generate_qr
from models import Base
from database import engine
from database import SessionLocal
from models import QRCode

import uuid
from datetime import datetime

Base.metadata.create_all(bind=engine)

class QRRequest(BaseModel):
    url: str
    width: int = 300


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/create-qr")
def create_qr(data: QRRequest):

    qr_id = str(uuid.uuid4())

    created_at = str(datetime.now())

    db = SessionLocal()

    new_qr = QRCode(
        qr_id=qr_id,
        url=data.url,
        created_at=created_at
    )

    db.add(new_qr)

    db.commit()

    db.close()

    image_data = generate_qr(data.url, data.width)

    return {
        "image": f"data:image/png;base64,{image_data}"
    }


@app.get("/test-qrs")
def test_qrs():

    db = SessionLocal()

    qrs = db.query(QRCode).all()

    db.close()

    return qrs



@app.get("/api/qrs")
def get_qrs():

    db = SessionLocal()

    qrs = db.query(QRCode).all()

    db.close()

    return qrs



@app.delete("/api/qrs/{qr_id}")
def delete_qr(qr_id: int):
    db = SessionLocal()

    qr = db.query(QRCode).filter(QRCode.id == qr_id).first()

    if qr:
        db.delete(qr)
        db.commit()

    db.close()

    return {"message": "QR deleted"}