from fastapi import FastAPI
from qr_generator import generate_qr

app = FastAPI()

@app.post("/create-qr")
def create_qr(data: dict):

    url = data["url"]

    generate_qr(url)

    return {
        "message": "QR created"
    }