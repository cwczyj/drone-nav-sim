from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from models import Farmland, FarmlandCreate, FarmlandUpdate, FarmlandResponse
from auth import get_current_user
from database import get_farmland_by_id as db_get_farmland_by_id, create_farmland as db_create_farmland, update_farmland as db_update_farmland, delete_farmland as db_delete_farmland, get_user_farmlands

router = APIRouter(prefix="/api/farmlands", tags=["farmlands"])


def check_farmland_ownership(farmland: Farmland, user_id: str):
    if farmland.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权操作此农田"
        )


@router.get("", response_model=List[FarmlandResponse])
async def get_farmlands(current_user=Depends(get_current_user)):
    user_farmlands = get_user_farmlands(current_user.id)
    return user_farmlands


@router.get("/{farmland_id}", response_model=FarmlandResponse)
async def get_farmland(farmland_id: str, current_user=Depends(get_current_user)):
    farmland = db_get_farmland_by_id(farmland_id)
    if not farmland:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="农田不存在"
        )
    check_farmland_ownership(farmland, current_user.id)
    return farmland


@router.post("", response_model=FarmlandResponse, status_code=status.HTTP_201_CREATED)
async def create_farmland_endpoint(farmland_data: FarmlandCreate, current_user=Depends(get_current_user)):
    new_farmland = Farmland(
        **farmland_data.model_dump(),
        user_id=current_user.id
    )
    db_create_farmland(new_farmland)
    return new_farmland


@router.put("/{farmland_id}", response_model=FarmlandResponse)
async def update_farmland_endpoint(
    farmland_id: str,
    farmland_data: FarmlandUpdate,
    current_user=Depends(get_current_user)
):
    farmland = db_get_farmland_by_id(farmland_id)
    if not farmland:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="农田不存在"
        )
    check_farmland_ownership(farmland, current_user.id)
    
    update_data = farmland_data.model_dump(exclude_unset=True)
    if update_data:
        for field, value in update_data.items():
            setattr(farmland, field, value)
        db_update_farmland(farmland)
    
    return farmland


@router.delete("/{farmland_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_farmland_endpoint(farmland_id: str, current_user=Depends(get_current_user)):
    farmland = db_get_farmland_by_id(farmland_id)
    if not farmland:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="农田不存在"
        )
    check_farmland_ownership(farmland, current_user.id)
    db_delete_farmland(farmland_id)
