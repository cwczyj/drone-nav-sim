import streamlit as st
from auth_state import AuthManager
from config import API_ENDPOINTS
import requests
import json
import plotly.graph_objects as go
import os

os.environ["NO_PROXY"] = "localhost,127.0.0.1"

FARMLAND_SHAPES = {
    "矩形": {
        "description": "规则的长方形农田",
        "coords": [[100, 100], [200, 100], [200, 200], [100, 200], [100, 100]]
    },
    "梯形": {
        "description": "上窄下宽的农田",
        "coords": [[150, 100], [250, 100], [300, 200], [100, 200], [150, 100]]
    },
    "五边形": {
        "description": "不规则五边形农田",
        "coords": [[150, 100], [250, 120], [280, 180], [200, 220], [120, 180], [150, 100]]
    },
    "六边形": {
        "description": "规则六边形农田",
        "coords": [[200, 100], [260, 140], [260, 200], [200, 240], [140, 200], [140, 140], [200, 100]]
    },
    "不规则1": {
        "description": "左侧凸出的不规则农田",
        "coords": [[150, 100], [250, 110], [280, 160], [250, 200], [150, 210], [120, 160], [150, 100]]
    },
    "不规则2": {
        "description": "右侧凹陷的不规则农田",
        "coords": [[120, 100], [220, 100], [260, 140], [220, 180], [240, 220], [160, 220], [120, 180], [140, 140], [120, 100]]
    },
    "L形": {
        "description": "L型农田",
        "coords": [[100, 100], [200, 100], [200, 150], [150, 150], [150, 200], [100, 200], [100, 100]]
    },
    "凹形": {
        "description": "中间凹陷的农田",
        "coords": [[100, 100], [250, 100], [250, 200], [200, 200], [200, 150], [150, 150], [150, 200], [100, 200], [100, 100]]
    }
}

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
            crop_type = st.selectbox(
                "🌱 作物类型",
                ["水稻", "小麦", "玉米", "大豆", "棉花", "油菜", "其他"],
                key="create_crop_type"
            )
        with col2:
            area = st.number_input("📐 面积 (亩)", min_value=0.1, step=0.1, value=1.0, key="create_area")
        
        st.markdown("### 🎨 农田形状")
        st.caption("选择预设形状或手动输入坐标（坐标系范围：0-500 x 0-500）")
        
        shape_option = st.radio(
            "选择输入方式",
            ["预设形状", "手动输入坐标"],
            horizontal=True
        )
        
        if shape_option == "预设形状":
            col_shape_preview, col_shape_info = st.columns([2, 1])
            
            with col_shape_preview:
                selected_shape = st.selectbox(
                    "选择农田形状",
                    list(FARMLAND_SHAPES.keys()),
                    key="create_shape"
                )
                
                shape_data = FARMLAND_SHAPES[selected_shape]
                
                fig = go.Figure()
                
                coords = shape_data["coords"]
                x_coords = [c[0] for c in coords]
                y_coords = [c[1] for c in coords]
                
                fig.add_trace(go.Scatter(
                    x=x_coords,
                    y=y_coords,
                    mode='lines+markers',
                    fill='toself',
                    fillcolor='rgba(102, 126, 234, 0.3)',
                    line=dict(color='#667eea', width=2),
                    marker=dict(size=6, color='#667eea'),
                    name=selected_shape,
                    hovertemplate='点 %{pointIndex}: (%{x}, %y)<extra></extra>'
                ))
                
                fig.update_layout(
                    title=f"形状预览：{selected_shape}",
                    xaxis_title="X 坐标 (0-500)",
                    yaxis_title="Y 坐标 (0-500)",
                    xaxis=dict(range=[0, 500], scaleanchor="y", scaleratio=1),
                    yaxis=dict(range=[0, 500]),
                    height=400,
                    margin=dict(l=60, r=20, t=60, b=60),
                    showlegend=False,
                    plot_bgcolor='white',
                    paper_bgcolor='white'
                )
                
                fig.update_xaxes(
                    gridcolor='#e0e0e0',
                    gridwidth=1,
                    zeroline=True,
                    zerolinewidth=2,
                    zerolinecolor='#333'
                )
                
                fig.update_yaxes(
                    gridcolor='#e0e0e0',
                    gridwidth=1,
                    zeroline=True,
                    zerolinewidth=2,
                    zerolinecolor='#333'
                )
                
                st.plotly_chart(fig, use_container_width=True)
            
            with col_shape_info:
                st.markdown("### 📝 形状信息")
                st.info(shape_data["description"])
                
                st.markdown("### 📋 坐标数据")
                coords_json = json.dumps(shape_data["coords"], ensure_ascii=False)
                st.code(coords_json, language='json')
                
                st.markdown(f"**坐标点数：** {len(shape_data['coords'])} 个")
        else:
            st.markdown("### 📝 手动输入坐标")
            st.caption("请输入 JSON 格式的坐标数组，格式：[[x1, y1], [x2, y2], ...]")
            st.caption("注意：坐标系范围为 0-500，最后一个点应与第一个点相同以闭合形状")
            
            boundary_input = st.text_area(
                "",
                placeholder='[[100, 100], [200, 100], [200, 200], [100, 200], [100, 100]]',
                key="create_boundary_manual",
                height=120
            )
            
            if boundary_input:
                try:
                    coords = json.loads(boundary_input)
                    col_preview, col_coords = st.columns([2, 1])
                    
                    with col_preview:
                        
                        fig = go.Figure()
                        
                        x_coords = [c[0] for c in coords]
                        y_coords = [c[1] for c in coords]
                        
                        fig.add_trace(go.Scatter(
                            x=x_coords,
                            y=y_coords,
                            mode='lines+markers',
                            fill='toself',
                            fillcolor='rgba(102, 126, 234, 0.3)',
                            line=dict(color='#667eea', width=2),
                            marker=dict(size=6, color='#667eea'),
                            name='自定义形状',
                            hovertemplate='点 %{pointIndex}: (%{x}, %{y})<extra></extra>'
                        ))
                        
                        fig.update_layout(
                            title="坐标预览",
                            xaxis_title="X 坐标",
                            yaxis_title="Y 坐标",
                            height=400,
                            margin=dict(l=60, r=20, t=60, b=60),
                            showlegend=False,
                            plot_bgcolor='white',
                            paper_bgcolor='white'
                        )
                        
                        fig.update_xaxes(
                            gridcolor='#e0e0e0',
                            gridwidth=1
                        )
                        
                        fig.update_yaxes(
                            gridcolor='#e0e0e0',
                            gridwidth=1
                        )
                        
                        st.plotly_chart(fig, use_container_width=True)
                    
                    with col_coords:
                        st.success(f"✅ 坐标有效，共 {len(coords)} 个点")
                        if len(coords) < 3:
                            st.warning(f"⚠️ 建议至少 3 个点")
                        
                        # 检查是否闭合
                        if coords[0] != coords[-1]:
                            st.info("💡 提示：最后一个点与第一个点不同，形状未自动闭合")
                
                except json.JSONDecodeError:
                    st.error("❌ 坐标格式错误，请使用有效的 JSON 格式")
        
        col_create, col_example = st.columns([1, 1])
        with col_create:
            if st.button("✅ 创建农田", use_container_width=True, type="primary"):
                if not all([name, area, crop_type]):
                    st.error("⚠️ 请填写所有字段")
                else:
                    if shape_option == "预设形状":
                        boundary_coords = FARMLAND_SHAPES[selected_shape]["coords"]
                    else:
                        try:
                            boundary_coords = json.loads(boundary_input)
                            if len(boundary_coords) < 3:
                                st.error("⚠️ 边界坐标至少需要3个点")
                                return
                        except json.JSONDecodeError:
                            st.error("❌ 边界坐标格式错误")
                            return
                    
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
        
        with col_example:
            if st.button("📋 填入示例数据", use_container_width=True, type="secondary"):
                st.session_state.create_name = "示例农田1"
                st.session_state.create_crop_type = "水稻"
                st.session_state.create_area = 5.5
                st.session_state.create_shape = "五边形"
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
                                height=80
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
