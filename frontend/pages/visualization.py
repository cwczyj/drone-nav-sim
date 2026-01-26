import streamlit as st
from auth_state import AuthManager
from config import API_ENDPOINTS
import requests
import folium
from streamlit_folium import st_folium
import os

os.environ["NO_PROXY"] = "localhost,127.0.0.1"

def visualization_page():
    st.markdown("""
    <div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
               padding: 30px; border-radius: 15px; margin-bottom: 30px;'>
        <h1 style='margin: 0; color: white; font-size: 36px;'>🗺️ 农田可视化</h1>
        <p style='margin: 10px 0 0 0; color: rgba(255,255,255,0.9);'>
            在地图上查看和管理您的农田分布
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    with st.spinner("加载农田数据..."):
        session = requests.Session()
        session.trust_env = False
        response = session.get(API_ENDPOINTS["farmlands"], headers=AuthManager.get_headers())
    
    if response.status_code == 200:
        farmlands = response.json()
        
        colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F39C12', '#E74C3C', '#9B59B6']
        
        if farmlands:
            col_map, col_stats = st.columns([3, 1])
            
            with col_map:
                st.markdown("### 🗺️ 农田地图")
                
                if len(farmlands) > 0:
                    center_lat = sum(p[0] for f in farmlands for p in f['boundary_coords']) / sum(len(f['boundary_coords']) for f in farmlands)
                    center_lng = sum(p[1] for f in farmlands for p in f['boundary_coords']) / sum(len(f['boundary_coords']) for f in farmlands)
                else:
                    center_lat, center_lng = 30.6742, 104.0667
                
                m = folium.Map(location=[center_lat, center_lng], zoom_start=14)
                
                for idx, farmland in enumerate(farmlands):
                    color = colors[idx % len(colors)]
                    
                    polygon = folium.Polygon(
                        locations=farmland['boundary_coords'],
                        color=color,
                        fill=True,
                        fill_color=color,
                        fill_opacity=0.4,
                        stroke=True,
                        stroke_width=3,
                        popup=f"""
                        <div style='font-family: Arial, sans-serif;'>
                            <h3 style='margin: 0 0 10px 0; color: {color};'>{farmland['name']}</h3>
                            <p style='margin: 5px 0;'><b>🌱 作物:</b> {farmland['crop_type']}</p>
                            <p style='margin: 5px 0;'><b>📐 面积:</b> {farmland['area']} 亩</p>
                            <p style='margin: 5px 0;'><b>📅 创建:</b> {farmland['created_at'][:10]}</p>
                        </div>
                        """
                    )
                    polygon.add_to(m)
                    
                    folium.Marker(
                        location=farmland['boundary_coords'][0],
                        popup=farmland['name'],
                        icon=folium.Icon(color='green', icon='leaf', prefix='fa')
                    ).add_to(m)
                
                    st_folium(m, width=800, height=600)
                
                st.caption("💡 提示：点击地图上的多边形查看农田详细信息")
            
            with col_stats:
                st.markdown("### 📊 农田统计")
                
                st.markdown(f"""
                <div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                           padding: 20px; border-radius: 10px; margin-bottom: 15px;'>
                    <p style='color: white; margin: 0; font-size: 14px;'>农田数量</p>
                    <p style='color: white; margin: 0; font-size: 32px; font-weight: bold;'>{len(farmlands)}</p>
                </div>
                """, unsafe_allow_html=True)
                
                total_area = sum(f['area'] for f in farmlands)
                st.markdown(f"""
                <div style='background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); 
                           padding: 20px; border-radius: 10px; margin-bottom: 15px;'>
                    <p style='color: white; margin: 0; font-size: 14px;'>总面积</p>
                    <p style='color: white; margin: 0; font-size: 32px; font-weight: bold;'>{round(total_area, 2)} 亩</p>
                </div>
                """, unsafe_allow_html=True)
                
                avg_area = total_area / len(farmlands) if farmlands else 0
                st.markdown(f"""
                <div style='background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); 
                           padding: 20px; border-radius: 10px; margin-bottom: 15px;'>
                    <p style='color: #333; margin: 0; font-size: 14px;'>平均面积</p>
                    <p style='color: #333; margin: 0; font-size: 32px; font-weight: bold;'>{round(avg_area, 2)} 亩</p>
                </div>
                """, unsafe_allow_html=True)
                
                st.divider()
                
                st.markdown("### 🎨 农田图例")
                for idx, farmland in enumerate(farmlands):
                    color = colors[idx % len(colors)]
                    st.markdown(f"""
                    <div style='display: flex; align-items: center; margin-bottom: 10px; padding: 8px; 
                               background: #f8f9fa; border-radius: 8px;'>
                        <div style='width: 24px; height: 24px; background-color: {color}; 
                                   border-radius: 4px; margin-right: 10px; border: 2px solid {color};'></div>
                        <span style='font-size: 13px; color: #333;'>{farmland['name']}</span>
                    </div>
                    """, unsafe_allow_html=True)
                
                st.divider()
                
                st.markdown("### 🌱 作物分布")
                crop_types = {}
                for f in farmlands:
                    crop_types[f['crop_type']] = crop_types.get(f['crop_type'], 0) + 1
                
                for crop, count in crop_types.items():
                    st.markdown(f"""
                    <div style='display: flex; align-items: center; justify-content: space-between; 
                               margin-bottom: 8px; padding: 8px 12px; background: #f8f9fa; border-radius: 8px;'>
                        <span style='font-size: 13px; color: #333;'>🌾 {crop}</span>
                        <span style='font-size: 13px; color: #666; font-weight: bold;'>{count} 块</span>
                    </div>
                    """, unsafe_allow_html=True)
        else:
            st.markdown("""
            <div style='text-align: center; padding: 80px 20px; background: #f0f2f6; border-radius: 15px;'>
                <div style='font-size: 100px; margin-bottom: 20px;'>🗺️</div>
                <h3 style='color: #666; margin: 0;'>暂无农田数据</h3>
                <p style='color: #999; margin: 10px 0;'>请先在「农田管理」页面创建农田</p>
            </div>
            """, unsafe_allow_html=True)
    else:
        st.error("❌ 获取农田数据失败，请检查网络连接或重新登录")
