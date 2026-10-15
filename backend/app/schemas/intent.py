from pydantic import BaseModel
from typing import Optional, Dict, Any

class IntentRequest(BaseModel):
    text: str
    context: Optional[Dict[str, Any]] = None

class IntentParameters(BaseModel):
    contact: Optional[str] = None
    phone_number: Optional[str] = None
    message: Optional[str] = None
    medication: Optional[str] = None
    time: Optional[str] = None
    frequency: Optional[str] = "daily"
    station: Optional[str] = None
    module: Optional[str] = None

class IntentResponse(BaseModel):
    action: str
    parameters: Dict[str, Any]
    confidence: float
    spoken_response: str
    action_allowed: bool
