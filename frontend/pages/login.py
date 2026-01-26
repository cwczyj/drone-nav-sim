import streamlit as st
from auth_state import AuthManager

def login_page():
    col_left, col_right = st.columns([1, 2])
    
    with col_left:
        st.markdown("""
        <div style='text-align: center; padding: 40px 20px;'>
            <div style='font-size: 80px; margin-bottom: 20px;'>🚜</div>
            <h2 style='color: #667eea; margin: 0;'>农业无人机</h2>
            <p style='color: #666; font-size: 14px; margin: 10px 0;'>智能航线规划系统</p>
        </div>
        """, unsafe_allow_html=True)
        
        st.markdown("""
        <div style='padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;'>
            <p style='color: white; margin: 0; text-align: center;'>
                🌾 高效规划<br>
                🗺️ 可视化管理<br>
                📊 数据分析
            </p>
        </div>
        """, unsafe_allow_html=True)
    
    with col_right:
        tab1, tab2 = st.tabs(["🔐 登录", "📝 注册"])
        
        with tab1:
            st.markdown("### 欢迎回来")
            st.caption("请输入您的账号信息")
            
            username = st.text_input("👤 用户名", key="login_username", placeholder="请输入用户名")
            password = st.text_input("🔑 密码", type="password", key="login_password", placeholder="请输入密码")
            
            if st.button("🚀 登录", use_container_width=True, type="primary"):
                if not username or not password:
                    st.error("⚠️ 请输入用户名和密码")
                else:
                    with st.spinner("登录中..."):
                        result = AuthManager.login(username, password)
                        if result["success"]:
                            st.success("✅ 登录成功！")
                            st.rerun()
                        else:
                            st.error(f"❌ {result['message']}")
        
        with tab2:
            st.markdown("### 创建新账号")
            st.caption("填写以下信息注册")
            
            reg_username = st.text_input("👤 用户名", key="reg_username", placeholder="3-50个字符")
            reg_email = st.text_input("📧 邮箱", key="reg_email", placeholder="example@email.com")
            reg_password = st.text_input("🔑 密码", type="password", key="reg_password", placeholder="至少6个字符")
            reg_confirm_password = st.text_input("🔒 确认密码", type="password", key="reg_confirm_password", placeholder="再次输入密码")
            
            if st.button("📝 注册", use_container_width=True, type="primary"):
                if not reg_username or not reg_email or not reg_password:
                    st.error("⚠️ 请填写所有字段")
                elif len(reg_password) < 6:
                    st.error("⚠️ 密码长度至少6位")
                elif reg_password != reg_confirm_password:
                    st.error("⚠️ 两次密码输入不一致")
                else:
                    with st.spinner("注册中..."):
                        result = AuthManager.register(reg_username, reg_email, reg_password)
                        if result["success"]:
                            st.success("✅ 注册成功！请切换到登录页面")
                        else:
                            st.error(f"❌ {result['message']}")
