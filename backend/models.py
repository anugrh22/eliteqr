from sqlalchemy.orm import declarative_base
from sqlalchemy import Column,Integer,String

Base = declarative_base()

class QRCode(Base):

    __tablename__ = "qrcodes"

    id = Column(Integer, primary_key=True)

    qr_id = Column(String)

    url = Column(String)

    created_at = Column(String)



class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True)
    email = Column(String, unique=True)
    password_hash = Column(String)