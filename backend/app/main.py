from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.routers.auth import router as auth_router
from backend.app.routers.voice import router as voice_router
from backend.app.routers.learning import router as learning_router

app = FastAPI(
    title="SeniorAssist Backend Gateway",
    description="API intermedia segura con autenticación JWT transparente y conector NLU/IA para adultos mayores.",
    version="1.0.0",
)

# Habilitar CORS para peticiones desde la app móvil y entorno web
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar Routers
app.include_router(auth_router)
app.include_router(voice_router)
app.include_router(learning_router)

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "ok",
        "service": "SeniorAssist Backend Gateway",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
