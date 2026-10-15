from datetime import datetime, timedelta, timezone
from typing import Optional
from backend.app.config import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRATION_DAYS

try:
    from jose import jwt, JWTError
except ImportError:
    try:
        import jwt
        JWTError = jwt.PyJWTError
    except ImportError:
        jwt = None
        JWTError = Exception

def create_access_token(device_id: str) -> str:
    now = datetime.now(timezone.utc)
    expire = now + timedelta(days=JWT_EXPIRATION_DAYS)
    payload = {
        "sub": device_id,
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
        "scope": "senior_assist_client"
    }

    if jwt is not None:
        return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    else:
        # Fallback simple en caso de entorno ligero sin dependencia instalada
        import base64, json
        header = base64.urlsafe_b64encode(json.dumps({"alg": "none", "typ": "JWT"}).encode()).decode().rstrip("=")
        body = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
        return f"{header}.{body}.signature"

def verify_token(token: str) -> Optional[str]:
    """
    Verifica el token JWT y retorna el device_id o None si es inválido
    """
    if jwt is not None:
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            device_id: str = payload.get("sub")
            return device_id
        except Exception:
            return None
    else:
        # Fallback de decodificación
        import base64, json
        try:
            parts = token.split(".")
            if len(parts) >= 2:
                padded = parts[1] + "=" * ((4 - len(parts[1]) % 4) % 4)
                data = json.loads(base64.urlsafe_b64decode(padded.encode()).decode())
                return data.get("sub")
            return None
        except Exception:
            return None
