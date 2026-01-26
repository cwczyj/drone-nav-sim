import streamlit as st
from config import API_ENDPOINTS
import requests
import os

NO_PROXY = "localhost,127.0.0.1"
os.environ["NO_PROXY"] = NO_PROXY


class AuthManager:
    @staticmethod
    def init_session_state():
        if "token" not in st.session_state:
            st.session_state.token = None
        if "user" not in st.session_state:
            st.session_state.user = None
        if "is_authenticated" not in st.session_state:
            st.session_state.is_authenticated = False

    @staticmethod
    def register(username: str, email: str, password: str) -> dict:
        try:
            session = requests.Session()
            session.trust_env = False
            response = session.post(
                API_ENDPOINTS["register"],
                json={"username": username, "email": email, "password": password}
            )
            response.raise_for_status()
            return {"success": True, "message": response.json().get("message")}
        except requests.exceptions.RequestException as e:
            return {"success": False, "message": str(e)}

    @staticmethod
    def login(username: str, password: str) -> dict:
        try:
            session = requests.Session()
            session.trust_env = False
            response = session.post(
                API_ENDPOINTS["login"],
                json={"username": username, "password": password}
            )
            response.raise_for_status()
            data = response.json()
            st.session_state.token = data.get("access_token")
            st.session_state.is_authenticated = True
            AuthManager.get_user_info()
            return {"success": True, "message": "登录成功"}
        except requests.exceptions.RequestException as e:
            return {"success": False, "message": str(e)}

    @staticmethod
    def logout():
        st.session_state.token = None
        st.session_state.user = None
        st.session_state.is_authenticated = False

    @staticmethod
    def get_user_info():
        if not st.session_state.token:
            return None
        try:
            headers = {"Authorization": f"Bearer {st.session_state.token}"}
            session = requests.Session()
            session.trust_env = False
            response = session.get(API_ENDPOINTS["me"], headers=headers)
            response.raise_for_status()
            st.session_state.user = response.json()
            return st.session_state.user
        except requests.exceptions.RequestException:
            AuthManager.logout()
            return None

    @staticmethod
    def get_headers():
        return {"Authorization": f"Bearer {st.session_state.token}"} if st.session_state.token else {}

    @staticmethod
    def check_auth():
        if not st.session_state.is_authenticated:
            st.error("请先登录")
            st.stop()
