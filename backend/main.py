from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from qr_generator import generate_qr


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
    image_data = generate_qr(data.url, data.width)
    return {"image": f"data:image/png;base64,{image_data}"}
