from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from models import User, RegisterRequest, LoginRequest, TokenResponse, UserResponse
from auth import get_current_user, get_password_hash, authenticate_user, create_access_token
from farmland import router as farmland_router
from path_planning.routes import router as path_planning_router

app = FastAPI(title="农业无人机航线导航规划模拟系统")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from database import create_user, init_data

@app.on_event("startup")
async def startup_event():
    init_data()


@app.post("/api/auth/register")
async def register(request: RegisterRequest):
    from database import get_user_by_username
    if get_user_by_username(request.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户名已存在"
        )
    
    new_user = User(
        username=request.username,
        email=request.email,
        password_hash=get_password_hash(request.password)
    )
    create_user(new_user)
    
    return {"message": "注册成功", "user_id": new_user.id}


@app.post("/api/auth/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    user = authenticate_user(request.username, request.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.username, "user_id": user.id})
    return TokenResponse(access_token=access_token, token_type="bearer")


@app.post("/api/auth/logout")
async def logout():
    return {"message": "退出成功"}


@app.get("/api/auth/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        created_at=current_user.created_at
    )


app.include_router(farmland_router)
app.include_router(path_planning_router)

@app.get("/")
async def root():
    return {
        "message": "农业无人机航线导航规划模拟系统 API",
        "version": "1.0.0"
    }
