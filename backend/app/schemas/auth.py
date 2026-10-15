from pydantic import BaseModel
from typing import Optional

class DeviceAuthRequest(BaseModel):
    device_id: str
    app_version: Optional[str] = "1.0.0"
    platform: Optional[str] = "android"

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in_days: int
    device_id: str
