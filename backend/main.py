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
from fastapi.responses import RedirectResponse
from urllib.parse import urlparse

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


class UpdateQRRequest(BaseModel):
    url: str


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


def is_valid_url(url):
    result = urlparse(url)

    return (
        result.scheme in ["http", "https"]
        and result.netloc
    )


@app.post("/create-qr")
def create_qr(
    data: QRRequest,
    current_user: User = Depends(get_current_user)
):

    qr_id = str(uuid.uuid4())

    created_at = str(datetime.now())

    db = SessionLocal()

    if not is_valid_url(data.url):
        return {"error": "Invalid URL"}

    new_qr = QRCode(
        qr_id=qr_id,
        url=data.url,
        created_at=created_at,
        owner_id=current_user.id
    )

    db.add(new_qr)

    db.commit()

    db.close()

    dynamic_url = f"http://172.20.10.3:8001/r/{qr_id}"

    image_data = generate_qr(
        dynamic_url,
        data.width
    )

    return {
        "image": f"data:image/png;base64,{image_data}"
    }






@app.get("/api/qrs")
def get_qrs(
    current_user: User = Depends(get_current_user)
):

    db = SessionLocal()

    qrs = (
        db.query(QRCode)
        .filter(QRCode.owner_id == current_user.id)
        .all()
    )

    db.close()

    return qrs



@app.delete("/api/qrs/{qr_id}")
def delete_qr(
    qr_id: int,
    current_user: User = Depends(get_current_user)
):
    db = SessionLocal()

    qr = db.query(QRCode).filter(QRCode.id == qr_id).first()

    if not qr:
        return {"error": "QR not found"}

    if qr.owner_id != current_user.id:
        return {"error": "Not authorized"}

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
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        )

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
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not verify_password(
        user.password,
        existing_user.password_hash
    ):
        db.close()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    db.close()

    token = create_access_token(
        {"sub": existing_user.email}
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }



@app.get("/test-token")
def test_token(
    current_user: User = Depends(get_current_user)
):
    return {
        "email": current_user.email
    }


@app.get("/r/{qr_id}")
def redirect_qr(qr_id: str):

    db = SessionLocal()

    qr = (
        db.query(QRCode)
        .filter(QRCode.qr_id == qr_id)
        .first()
    )

    if not qr:
        db.close()
        return {"error": "QR not found"}

    qr.scan_count += 1

    db.commit()

    url = qr.url

    db.close()

    return RedirectResponse(url=url)



@app.put("/api/qrs/{qr_id}")
def update_qr(
    qr_id: int,
    data: UpdateQRRequest,
    current_user: User = Depends(get_current_user)
):
    db = SessionLocal()

    qr = db.query(QRCode).filter(QRCode.id == qr_id).first()

    if not qr:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="QR not found"
        )

    if qr.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this QR"
        )

    if not is_valid_url(data.url):
        raise HTTPException(
            status_code=400,
            detail="Invalid URL"
        )

    qr.url = data.url
    db.commit()
    db.close()

    return {"message": "QR updated"}





