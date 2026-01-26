from typing import Optional
from models import User, Farmland
from pydantic import BaseModel
from datetime import datetime
import json
import os

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
USERS_FILE = os.path.join(DATA_DIR, "users.json")
FARMLANDS_FILE = os.path.join(DATA_DIR, "farmlands.json")

os.makedirs(DATA_DIR, exist_ok=True)

users_db = {}
farmlands_db = {}


def save_users():
    with open(USERS_FILE, 'w', encoding='utf-8') as f:
        json.dump([u.model_dump() for u in users_db.values()], f, ensure_ascii=False, indent=2, default=str)


def load_users():
    global users_db
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'r', encoding='utf-8') as f:
            users_data = json.load(f)
            users_db = {u['id']: User(**u) for u in users_data}


def save_farmlands():
    with open(FARMLANDS_FILE, 'w', encoding='utf-8') as f:
        json.dump([f.model_dump() for f in farmlands_db.values()], f, ensure_ascii=False, indent=2, default=str)


def load_farmlands():
    global farmlands_db
    if os.path.exists(FARMLANDS_FILE):
        with open(FARMLANDS_FILE, 'r', encoding='utf-8') as f:
            farmlands_data = json.load(f)
            farmlands_db = {f['id']: Farmland(**f) for f in farmlands_data}


def init_data():
    load_users()
    load_farmlands()


def get_user_by_username(username: str) -> Optional[User]:
    for user in users_db.values():
        if user.username == username:
            return user
    return None


def get_user_by_id(user_id: str) -> Optional[User]:
    return users_db.get(user_id)


def create_user(user: User):
    users_db[user.id] = user
    save_users()


def get_farmland_by_id(farmland_id: str) -> Optional[Farmland]:
    return farmlands_db.get(farmland_id)


def create_farmland(farmland: Farmland):
    farmlands_db[farmland.id] = farmland
    save_farmlands()


def update_farmland(farmland: Farmland):
    if farmland.id in farmlands_db:
        farmlands_db[farmland.id] = farmland
        save_farmlands()


def delete_farmland(farmland_id: str):
    if farmland_id in farmlands_db:
        del farmlands_db[farmland_id]
        save_farmlands()


def get_user_farmlands(user_id: str) -> list:
    return [f for f in farmlands_db.values() if f.user_id == user_id]
