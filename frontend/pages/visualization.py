import streamlit as st
from auth_state import AuthManager
from config import API_ENDPOINTS
import requests
import plotly.graph_objects as go
import os

os.environ["NO_PROXY"] = "localhost,127.0.0.1"

CROP_COLORS = {
    '水稻': '#4CAF50',
    '小麦': '#FFC107',
    '玉米': '#FF9800',
    '大豆': '#8BC34A',
    '棉花': '#E91E63',
    '油菜': '#FFEB3B',
    '其他': '#607D8B'
}

def hex_to_rgba(hex_color, alpha=0.25):
    hex_color = hex_color.lstrip('#')
    r = int(hex_color[0:2], 16)
    g = int(hex_color[2:4], 16)
    b = int(hex_color[4:6], 16)
    return f'rgba({r}, {g}, {b}, {alpha})'

def visualization_page():
    st.markdown("""
    <div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
               padding: 30px; border-radius: 15px; margin-bottom: 30px;'>
        <h1 style='margin: 0; color: white; font-size: 36px;'>🗺️ 农田可视化</h1>
        <p style='margin: 10px 0 0 0; color: rgba(255,255,255,0.9);'>
            在统一坐标系下查看农田分布与作物布局
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    with st.spinner("加载农田数据..."):
        session = requests.Session()
        session.trust_env = False
        response = session.get(API_ENDPOINTS["farmlands"], headers=AuthManager.get_headers())
    
    if response.status_code == 200:
        farmlands = response.json()
        
        if farmlands:
            col_map, col_stats = st.columns([3, 1])
            
            with col_map:
                st.markdown("### 📐 农田坐标图")
                
                fig = go.Figure()
                
                for farmland in farmlands:
                    coords = farmland['boundary_coords']
                    x_coords = [coord[1] for coord in coords] + [coords[0][1]]
                    y_coords = [coord[0] for coord in coords] + [coords[0][0]]
                    
                    color = CROP_COLORS.get(farmland['crop_type'], CROP_COLORS['其他'])
                    fill_color = hex_to_rgba(color, 0.25)
                    
                    fig.add_trace(go.Scatter(
                        x=x_coords,
                        y=y_coords,
                        mode='lines',
                        fill='toself',
                        fillcolor=fill_color,
                        line=dict(color=color, width=3),
                        name=farmland['name'],
                        hovertemplate=f"<b>{farmland['name']}</b><br>" +
                                    f"作物: {farmland['crop_type']}<br>" +
                                    f"面积: {farmland['area']} 亩<br>" +
                                    f"创建时间: {farmland['created_at'][:10]}<br>" +
                                    f"<extra></extra>",
                        legendgroup=farmland['crop_type'],
                        showlegend=True
                    ))
                    
                    center_x = sum(x_coords[:-1]) / len(x_coords[:-1])
                    center_y = sum(y_coords[:-1]) / len(y_coords[:-1])
                    
                    fig.add_trace(go.Scatter(
                        x=[center_x],
                        y=[center_y],
                        mode='text',
                        text=[farmland['name']],
                        textfont=dict(size=10, color='black', family='Arial'),
                        textposition='middle center',
                        hoverinfo='skip',
                        showlegend=False
                    ))
                
                fig.update_layout(
                    title="",
                    xaxis_title="经度 (X轴)",
                    yaxis_title="纬度 (Y轴)",
                    hovermode='closest',
                    showlegend=True,
                    legend=dict(
                        orientation="v",
                        yanchor="top",
                        y=0.99,
                        xanchor="left",
                        x=1.02,
                        bgcolor='rgba(255,255,255,0.9)',
                        bordercolor='#ddd',
                        borderwidth=1,
                        font=dict(size=11)
                    ),
                    margin=dict(l=60, r=160, t=40, b=60),
                    height=600,
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
                
                st.caption("💡 提示：鼠标悬停在农田上可查看详细信息，图例显示各农田名称")
            
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
                
                st.markdown("### 🎨 作物图例")
                unique_crops = {}
                for f in farmlands:
                    if f['crop_type'] not in unique_crops:
                        unique_crops[f['crop_type']] = {
                            'count': 1,
                            'areas': [f['area']]
                        }
                    else:
                        unique_crops[f['crop_type']]['count'] += 1
                        unique_crops[f['crop_type']]['areas'].append(f['area'])
                
                for crop, data in unique_crops.items():
                    color = CROP_COLORS.get(crop, CROP_COLORS['其他'])
                    avg_area = sum(data['areas']) / len(data['areas'])
                    st.markdown(f"""
                    <div style='margin-bottom: 12px;'>
                        <div style='display: flex; align-items: center; margin-bottom: 5px;'>
                            <div style='width: 20px; height: 20px; background-color: {color}; 
                                       border-radius: 4px; margin-right: 10px; border: 2px solid {color};'></div>
                            <span style='font-size: 14px; color: #333; font-weight: 500;'>{crop}</span>
                        </div>
                        <div style='margin-left: 30px; font-size: 12px; color: #666;'>
                            {data['count']} 块 · 平均 {round(avg_area, 2)} 亩
                        </div>
                    </div>
                    """, unsafe_allow_html=True)
                
                st.divider()
                
                st.markdown("### 📈 坐标范围")
                all_coords = [coord for f in farmlands for coord in f['boundary_coords']]
                if all_coords:
                    min_y = min(c[0] for c in all_coords)
                    max_y = max(c[0] for c in all_coords)
                    min_x = min(c[1] for c in all_coords)
                    max_x = max(c[1] for c in all_coords)
                    
                    st.markdown(f"""
                    <div style='background: #f8f9fa; padding: 12px; border-radius: 8px; font-size: 13px;'>
                        <div style='display: flex; justify-content: space-between; margin-bottom: 5px;'>
                            <span style='color: #666;'>X轴 (经度):</span>
                            <span style='color: #333; font-weight: 500;'>{round(min_x, 6)} ~ {round(max_x, 6)}</span>
                        </div>
                        <div style='display: flex; justify-content: space-between;'>
                            <span style='color: #666;'>Y轴 (纬度):</span>
                            <span style='color: #333; font-weight: 500;'>{round(min_y, 6)} ~ {round(max_y, 6)}</span>
                        </div>
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
