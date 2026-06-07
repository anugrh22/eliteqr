from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Backend running"}

@app.post("/create-qr")
def create_qr(data: dict):
    return {
        "url": data["url"],
        "status": "received"
    }
