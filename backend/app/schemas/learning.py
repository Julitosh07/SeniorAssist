from typing import List, Optional
from pydantic import BaseModel, Field

class StepSchema(BaseModel):
    step_index: int = Field(..., description="Índice del paso (0-indexed)")
    title: str = Field(..., description="Título corto del paso")
    instruction: str = Field(..., description="Instrucción paso a paso para el usuario")
    hint: str = Field(..., description="Pista explicativa accesible")
    target_action: str = Field(..., description="Acción esperada en el simulador")
    completed_explanation: str = Field(..., description="Explicación de refuerzo positivo al completar el paso")

class LessonResponse(BaseModel):
    id: str
    module: str
    title: str
    description: str
    total_steps: int
    order_index: int
    steps: List[StepSchema]

class LearningEventItem(BaseModel):
    id: str
    lesson_id: str
    step_index: int
    event_type: str  # 'success' | 'error' | 'retry' | 'hint_requested'
    time_spent_seconds: float
    error_details: Optional[str] = None

class LearningEventsRequest(BaseModel):
    events: List[LearningEventItem]

class PedagogyAnalysisRequest(BaseModel):
    lesson_id: str
    attempts: int = Field(..., ge=0)
    errors: int = Field(..., ge=0)
    hints_requested: int = Field(..., ge=0)
    total_time_seconds: float = Field(..., ge=0)
    last_step: int = Field(..., ge=0)

class PedagogyAnalysisResponse(BaseModel):
    difficulty_recommended: str  # 'easy' | 'normal' | 'challenging'
    speech_rate: float           # e.g., 0.75 for slower/patient speech, 0.85 for standard
    show_instant_hints: bool
    feedback_message: str
    encouragement_text: str
