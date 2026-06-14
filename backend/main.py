from fastapi import FastAPI, Depends, HTTPException, status  # Updated
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from qr_generator import generate_qr
from models import Base, QRCode, User                      # Cleaned up duplicates
from database import engine, SessionLocal                  # Cleaned up duplicates
from schemas import UserCreate, UserLogin
from auth import hash_password, verify_password
from jose import jwt, JWTError                              # Updated
from datetime import timedelta, datetime, timezone         # Updated
from fastapi.security import OAuth2PasswordBearer
import uuid

Base.metadata.create_all(bind=engine)

SECRET_KEY = "eliteqr-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/login"
)


def create_access_token(data: dict):
    to_encode = data.copy()
    
    # Updated for Python 3.13 timezone-aware safety
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


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



@app.post("/register")
def register(user: UserCreate):

    db = SessionLocal()

    # ADD THIS HERE
    existing_user = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if existing_user:
        db.close()
        return {"error": "Email already exists"}

    new_user = User(
        username=user.username,
        email=user.email,
        password_hash=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()

    db.close()

    return {
        "message": "User registered successfully"
    }


@app.post("/login")
def login(user: UserLogin):

    db = SessionLocal()

    existing_user = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if not existing_user:
        db.close()
        return {"error": "Invalid email or password"}

    if not verify_password(
        user.password,
        existing_user.password_hash
    ):
        db.close()
        return {"error": "Invalid email or password"}

    db.close()

    token = create_access_token(
    {"sub": existing_user.email}
)

    return {
    "access_token": token,
    "token_type": "bearer"
}

def get_current_user(token: str = Depends(oauth2_scheme)):
    # Added try/except block to handle invalid/expired tokens safely
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Invalid token payload"
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Could not validate credentials"
        )

    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    db.close()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="User not found"
        )

    return user

@app.get("/test-token")
def test_token(
    current_user: User = Depends(get_current_user)
):
    return {
        "email": current_user.email
    }