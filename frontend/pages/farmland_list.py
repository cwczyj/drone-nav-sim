import streamlit as st
from auth_state import AuthManager
from config import API_ENDPOINTS
import requests
import json
import os

os.environ["NO_PROXY"] = "localhost,127.0.0.1"

def farmland_management_page():
    st.markdown("""
    <div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
               padding: 30px; border-radius: 15px; margin-bottom: 30px;'>
        <h1 style='margin: 0; color: white; font-size: 36px;'>🌾 农田管理</h1>
        <p style='margin: 10px 0 0 0; color: rgba(255,255,255,0.9);'>
            管理您的农田信息，包括创建、编辑和删除农田
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    with st.expander("➕ 创建新农田", expanded=False):
        col1, col2 = st.columns(2)
        with col1:
            name = st.text_input("📍 农田名称", key="create_name", placeholder="如：东田1号")
            crop_type = st.text_input("🌱 作物类型", key="create_crop_type", placeholder="如：水稻")
        with col2:
            area = st.number_input("📐 面积 (亩)", min_value=0.1, step=0.1, value=1.0, key="create_area")
        
        st.markdown("### 🗺️ 边界坐标")
        st.caption("请输入边界坐标的JSON格式数组（至少3个点）")
        boundary_input = st.text_area(
            "",
            placeholder='[[30.6742, 104.0667], [30.6752, 104.0687], [30.6762, 104.0667], [30.6742, 104.0667]]',
            key="create_boundary",
            height=100
        )
        
        col_create, col_example = st.columns([1, 1])
        with col_create:
            if st.button("✅ 创建农田", use_container_width=True, type="primary"):
                if not all([name, area, crop_type, boundary_input]):
                    st.error("⚠️ 请填写所有字段")
                else:
                    try:
                        boundary_coords = json.loads(boundary_input)
                        if len(boundary_coords) < 3:
                            st.error("⚠️ 边界坐标至少需要3个点")
                        else:
                            with st.spinner("创建中..."):
                                session = requests.Session()
                                session.trust_env = False
                                response = session.post(
                                    API_ENDPOINTS["farmlands"],
                                    headers=AuthManager.get_headers(),
                                    json={
                                        "name": name,
                                        "area": area,
                                        "crop_type": crop_type,
                                        "boundary_coords": boundary_coords
                                    }
                                )
                                if response.status_code == 201:
                                    st.success("✅ 农田创建成功！")
                                    st.rerun()
                                else:
                                    try:
                                        error_detail = response.json().get('detail', response.text)
                                    except:
                                        error_detail = response.text
                                    st.error(f"❌ 创建失败: {error_detail}")
                    except json.JSONDecodeError:
                        st.error("❌ 边界坐标格式错误，请使用有效的JSON格式")
        with col_example:
            if st.button("📋 填入示例数据", use_container_width=True, type="secondary"):
                st.session_state.create_name = "示例农田1"
                st.session_state.create_crop_type = "水稻"
                st.session_state.create_area = 5.5
                st.session_state.create_boundary = "[[30.6742, 104.0667], [30.6752, 104.0687], [30.6762, 104.0667], [30.6762, 104.0657], [30.6742, 104.0667]]"
                st.rerun()
    
    st.divider()
    
    session = requests.Session()
    session.trust_env = False
    response = session.get(API_ENDPOINTS["farmlands"], headers=AuthManager.get_headers())
    if response.status_code == 200:
        farmlands = response.json()
        
        if farmlands:
            st.markdown(f"### 📋 农田列表 ({len(farmlands)} 块)")
            
            for idx, farmland in enumerate(farmlands):
                with st.container(border=True):
                    st.markdown(f"""
                    <div style='background: linear-gradient(90deg, {idx % 2 == 0 and "#667eea" or "#764ba2"} 0%, {idx % 2 == 0 and "#764ba2" or "#667eea"} 100%); 
                               padding: 15px; border-radius: 10px 10px 0 0; margin: -10px -10px 15px -10px;'>
                        <h3 style='margin: 0; color: white; font-size: 24px;'>🌾 {farmland['name']}</h3>
                        <p style='margin: 5px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;'>
                            🌱 {farmland['crop_type']} | 📐 {farmland['area']} 亩 | 📅 {farmland['created_at'][:10]}
                        </p>
                    </div>
                    """, unsafe_allow_html=True)
                    
                    col_edit, col_delete = st.columns(2)
                    with col_edit:
                        edit_key = f"edit_mode_{farmland['id']}"
                        if st.button("✏️ 编辑", key=f"edit_{farmland['id']}", use_container_width=True):
                            st.session_state[edit_key] = True
                            st.rerun()
                    
                    with col_delete:
                        delete_key = f"confirm_delete_{farmland['id']}"
                        if not st.session_state.get(delete_key, False):
                            if st.button("🗑️ 删除", key=f"delete_{farmland['id']}", use_container_width=True):
                                st.session_state[delete_key] = True
                                st.rerun()
                        else:
                            st.warning(f"⚠️ 确定要删除「{farmland['name']}」吗？")
                            col_yes, col_no = st.columns(2)
                            with col_yes:
                                if st.button("✅ 确认", key=f"confirm_yes_{farmland['id']}", use_container_width=True):
                                    with st.spinner("删除中..."):
                                        session = requests.Session()
                                        session.trust_env = False
                                        delete_response = session.delete(
                                            f"{API_ENDPOINTS['farmlands']}/{farmland['id']}",
                                            headers=AuthManager.get_headers()
                                        )
                                        if delete_response.status_code == 204:
                                            st.success("✅ 删除成功")
                                            st.session_state[delete_key] = False
                                            st.rerun()
                                        else:
                                            try:
                                                error_detail = delete_response.json().get('detail', delete_response.text)
                                            except:
                                                error_detail = delete_response.text
                                            st.error(f"❌ 删除失败: {error_detail}")
                            with col_no:
                                if st.button("❌ 取消", key=f"confirm_no_{farmland['id']}", use_container_width=True):
                                    st.session_state[delete_key] = False
                                    st.rerun()
                    
                    edit_key = f"edit_mode_{farmland['id']}"
                    if st.session_state.get(edit_key, False):
                        with st.expander("✏️ 编辑农田", expanded=True):
                            col1, col2 = st.columns(2)
                            with col1:
                                edit_name = st.text_input("📍 农田名称", value=farmland['name'], key=f"edit_name_{farmland['id']}")
                                edit_crop_type = st.text_input("🌱 作物类型", value=farmland['crop_type'], key=f"edit_crop_{farmland['id']}")
                            with col2:
                                edit_area = st.number_input("📐 面积 (亩)", min_value=0.1, step=0.1, value=farmland['area'], key=f"edit_area_{farmland['id']}")
                            
                            st.markdown("### 🗺️ 边界坐标")
                            edit_boundary = st.text_area(
                                "",
                                value=str(farmland['boundary_coords']),
                                key=f"edit_boundary_{farmland['id']}",
                                height=100
                            )
                            
                            col_save, col_cancel = st.columns(2)
                            with col_save:
                                if st.button("💾 保存", key=f"save_{farmland['id']}", use_container_width=True, type="primary"):
                                    try:
                                        boundary_coords = json.loads(edit_boundary)
                                        update_data = {
                                            "name": edit_name,
                                            "area": edit_area,
                                            "crop_type": edit_crop_type,
                                            "boundary_coords": boundary_coords
                                        }
                                        with st.spinner("保存中..."):
                                            session = requests.Session()
                                            session.trust_env = False
                                            update_response = session.put(
                                                f"{API_ENDPOINTS['farmlands']}/{farmland['id']}",
                                                headers=AuthManager.get_headers(),
                                                json=update_data
                                            )
                                            if update_response.status_code == 200:
                                                st.success("✅ 更新成功")
                                                st.session_state[edit_key] = False
                                                st.rerun()
                                            else:
                                                try:
                                                    error_detail = update_response.json().get('detail', update_response.text)
                                                except:
                                                    error_detail = update_response.text
                                                st.error(f"❌ 更新失败: {error_detail}")
                                    except json.JSONDecodeError:
                                        st.error("❌ 边界坐标格式错误")
                            
                            with col_cancel:
                                if st.button("❌ 取消", key=f"cancel_{farmland['id']}", use_container_width=True):
                                    st.session_state[edit_key] = False
                                    st.rerun()
        else:
            st.markdown("""
            <div style='text-align: center; padding: 60px 20px; background: #f0f2f6; border-radius: 15px;'>
                <div style='font-size: 80px; margin-bottom: 20px;'>🌾</div>
                <h3 style='color: #666; margin: 0;'>暂无农田数据</h3>
                <p style='color: #999; margin: 10px 0;'>请点击上方「创建新农田」开始添加</p>
            </div>
            """, unsafe_allow_html=True)
    else:
        st.error("❌ 获取农田列表失败，请检查网络连接")
