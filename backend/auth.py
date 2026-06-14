import bcrypt

def hash_password(password: str) -> str:
    # Convert string password to bytes
    password_bytes = password.encode('utf-8')
    # Generate a salt and hash the password
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    # Convert back to string to store in the database
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Convert both string parameters back to bytes for checking
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))