from typing import Optional
from models import User, Farmland

users_db = {}
farmlands_db = {}


def get_user_by_username(username: str) -> Optional[User]:
    for user in users_db.values():
        if user.username == username:
            return user
    return None


def get_user_by_id(user_id: str) -> Optional[User]:
    return users_db.get(user_id)


def create_user(user: User):
    users_db[user.id] = user


def get_farmland_by_id(farmland_id: str) -> Optional[Farmland]:
    return farmlands_db.get(farmland_id)


def create_farmland(farmland: Farmland):
    farmlands_db[farmland.id] = farmland


def update_farmland(farmland: Farmland):
    if farmland.id in farmlands_db:
        farmlands_db[farmland.id] = farmland


def delete_farmland(farmland_id: str):
    if farmland_id in farmlands_db:
        del farmlands_db[farmland_id]


def get_user_farmlands(user_id: str) -> list:
    return [f for f in farmlands_db.values() if f.user_id == user_id]
