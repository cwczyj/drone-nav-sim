import streamlit as st
from auth_state import AuthManager

st.set_page_config(
    page_title="农业无人机航线导航规划模拟系统",
    page_icon="🚜",
    layout="wide",
    initial_sidebar_state="expanded"
)

AuthManager.init_session_state()

with st.sidebar:
    st.markdown("""
    <div style='text-align: center; padding: 20px 0;'>
        <h1 style='margin: 0;'>🚜</h1>
        <h2 style='margin: 10px 0; font-size: 20px;'>农业无人机</h2>
        <p style='margin: 5px 0; color: #666; font-size: 14px;'>航线导航规划系统</p>
    </div>
    """, unsafe_allow_html=True)
    st.divider()
    
    if st.session_state.is_authenticated:
        st.markdown(f"""
        <div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                   padding: 15px; border-radius: 10px; margin-bottom: 10px;'>
            <p style='color: white; margin: 0; font-size: 16px;'>👤 <b>{st.session_state.user['username']}</b></p>
            <p style='color: rgba(255,255,255,0.8); margin: 5px 0 0 0; font-size: 12px;'>{st.session_state.user['email']}</p>
        </div>
        """, unsafe_allow_html=True)
        
        if st.button("🚪 退出登录", use_container_width=True, type="secondary"):
            AuthManager.logout()
            st.rerun()
    else:
        st.markdown("""
        <div style='text-align: center; padding: 20px; background: #f0f2f6; border-radius: 10px;'>
            <p style='margin: 0; color: #666;'>🔐 请登录或注册</p>
        </div>
        """, unsafe_allow_html=True)
    
    st.divider()
    
    if st.session_state.is_authenticated:
        st.markdown("### 📋 功能菜单")
        
        col1, col2 = st.columns(2)
        with col1:
            if st.button("🌾 农田管理", use_container_width=True, key="nav_management", type="primary"):
                st.session_state.page = "农田管理"
                st.rerun()
        with col2:
            if st.button("🗺️ 农田可视化", use_container_width=True, key="nav_viz", type="secondary"):
                st.session_state.page = "农田可视化"
                st.rerun()
        
        if "page" not in st.session_state:
            st.session_state.page = "农田管理"
        page = st.session_state.page
    else:
        page = "登录"

if page == "登录" and not st.session_state.is_authenticated:
    from pages.login import login_page
    login_page()

elif page == "农田管理" and st.session_state.is_authenticated:
    from pages.farmland_list import farmland_management_page
    AuthManager.check_auth()
    farmland_management_page()

elif page == "农田可视化" and st.session_state.is_authenticated:
    from pages.visualization import visualization_page
    AuthManager.check_auth()
    visualization_page()
