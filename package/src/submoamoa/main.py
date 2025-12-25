from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi.responses import FileResponse, JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.requests import Request
from .context import master_controller
from . import restapimotors
from . import restapicameras
from . import restapisettings
from . import restapihotzone
from . import restapimanualcontrol

async def onload():
    print("Server loaded")
    # cameras = CameraController().list_cameras()
    #print(cameras)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic goes here
    print("Server starting up...")
    master_controller.start()
    # Ensure cameras are initialized if possible, or handle empty list
    if master_controller.cameras_controller.cameras:
        # Accessing frame to ensure stream starts or similar?
        # Original code: master_controller.cameras_controller.cameras[0].image.frame
        try:
            _ = master_controller.cameras_controller.cameras[0].image.frame
        except IndexError:
            pass
            
    # You can call your onload function here
    await onload()
    yield
    # Shutdown logic goes here
    print("Server shutting down...")
    master_controller.stop()

app = FastAPI(lifespan=lifespan)

# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Include Routers
app.include_router(restapisettings.router)
app.include_router(restapimotors.router)
app.include_router(restapihotzone.router)
app.include_router(restapicameras.router)
app.include_router(restapimanualcontrol.router)


@app.exception_handler(404)
async def spa_fallback_handler(request: Request, exc: StarletteHTTPException):
    """
    Fallback handler for Single Page Application routing.
    If a 404 occurs and the path is NOT an API endpoint, serve index.html.
    This allows React Router to handle the routing client-side.
    """
    if request.url.path.startswith("/api") or request.url.path.startswith("/ws"):
        return JSONResponse(status_code=404, content={"detail": "Not Found"})
    
    # Serve index.html for SPA routes
    index_path = BASE_DIR / "wwwroot/dist/index.html"
    if index_path.exists():
        return FileResponse(index_path)
    
    return JSONResponse(status_code=404, content={"detail": "Not Found"})

# Get the directory of the current file
BASE_DIR = Path(__file__).resolve().parent

app.mount("/", StaticFiles(directory=BASE_DIR / "wwwroot/dist", html=True), name="static")
