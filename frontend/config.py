import os

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")

API_ENDPOINTS = {
    "register": f"{API_BASE_URL}/api/auth/register",
    "login": f"{API_BASE_URL}/api/auth/login",
    "logout": f"{API_BASE_URL}/api/auth/logout",
    "me": f"{API_BASE_URL}/api/auth/me",
    "farmlands": f"{API_BASE_URL}/api/farmlands",
}

NO_PROXY = "localhost,127.0.0.1"
os.environ["NO_PROXY"] = NO_PROXY
