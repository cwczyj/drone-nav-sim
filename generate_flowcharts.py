import matplotlib.pyplot as plt
import matplotlib.patches as patches

plt.rcParams.update({
    'font.size': 10,
    'font.family': 'serif',
    'axes.labelsize': 10,
    'axes.titlesize': 11,
    'figure.figsize': (8, 10),
    'figure.dpi': 300,
    'savefig.dpi': 300,
    'savefig.bbox': 'tight',
    'savefig.pad_inches': 0.2,
})

def draw_rounded_rect(ax, x, y, width, height, radius=0.3, **kwargs):
    rect = patches.FancyBboxPatch(
        (x, y), width, height,
        boxstyle=f'round,pad=0.05,rounding_size={radius}',
        **kwargs
    )
    ax.add_patch(rect)

def draw_rectangle(ax, x, y, width, height, **kwargs):
    rect = patches.Rectangle((x, y), width, height, **kwargs)
    ax.add_patch(rect)

def draw_diamond(ax, x, y, width, height, **kwargs):
    diamond = patches.Polygon(
        [[x + width/2, y], [x + width, y + height/2], 
         [x + width/2, y + height], [x, y + height/2]],
        **kwargs
    )
    ax.add_patch(diamond)

def draw_parallelogram(ax, x, y, width, height, **kwargs):
    offset = width * 0.15
    parallelogram = patches.Polygon(
        [[x + offset, y], [x + width + offset, y],
         [x + width - offset, y + height], [x - offset, y + height]],
        **kwargs
    )
    ax.add_patch(parallelogram)

def draw_arrow(ax, x1, y1, x2, y2, **kwargs):
    ax.annotate(
        '', xy=(x2, y2), xytext=(x1, y1),
        arrowprops=dict(arrowstyle='->', linewidth=1.5, **kwargs),
    )

def figure1_boustrophedon():
    fig, ax = plt.subplots(figsize=(8.5, 11))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 13)
    ax.axis('off')
    
    ax.text(5, 12.5, 'Boustrophedon Decomposition Algorithm', 
            ha='center', va='top', fontsize=12, fontweight='bold')
    
    nodes = {
        'start': (5, 11.5),
        'input': (5, 10.5),
        'validate': (5, 9.3),
        'find_critical': (5, 8.0),
        'decompose': (5, 6.7),
        'generate_paths': (5, 5.4),
        'merge_paths': (5, 4.1),
        'output': (5, 2.8),
        'end': (5, 1.5),
        'error': (8, 9.3),
    }
    
    node_size = {'width': 2.5, 'height': 0.7}
    decision_size = {'width': 2.5, 'height': 1.2}
    
    draw_rounded_rect(ax, nodes['start'][0] - 1, nodes['start'][1] - 0.25, 
                     2, 0.5, radius=0.25, 
                     facecolor='white', edgecolor='black', linewidth=1.5)
    ax.text(nodes['start'][0], nodes['start'][1], 'Start', 
            ha='center', va='center', fontsize=10)
    
    draw_parallelogram(ax, nodes['input'][0] - 1.25, nodes['input'][1] - 0.35,
                       2.5, 0.7,
                       facecolor='white', edgecolor='black', linewidth=1.5)
    ax.text(nodes['input'][0], nodes['input'][1], 'Input Polygon\nBoundary Coordinates',
            ha='center', va='center', fontsize=9, linespacing=1.2)
    
    draw_diamond(ax, nodes['validate'][0] - 1.25, nodes['validate'][1] - 0.6,
                 2.5, 1.2,
                 facecolor='white', edgecolor='black', linewidth=1.5)
    ax.text(nodes['validate'][0], nodes['validate'][1], 'Polygon\nValid?',
            ha='center', va='center', fontsize=9, linespacing=1.2)
    
    draw_rectangle(ax, nodes['find_critical'][0] - 1.25, nodes['find_critical'][1] - 0.35,
                   2.5, 0.7,
                   facecolor='white', edgecolor='black', linewidth=1.5)
    ax.text(nodes['find_critical'][0], nodes['find_critical'][1], 'Find Critical Points',
            ha='center', va='center', fontsize=9)
    
    draw_rectangle(ax, nodes['decompose'][0] - 1.25, nodes['decompose'][1] - 0.35,
                   2.5, 0.7,
                   facecolor='white', edgecolor='black', linewidth=1.5)
    ax.text(nodes['decompose'][0], nodes['decompose'][1], 'Decompose Polygon\nat Critical Points',
            ha='center', va='center', fontsize=9, linespacing=1.2)
    
    draw_rectangle(ax, nodes['generate_paths'][0] - 1.25, nodes['generate_paths'][1] - 0.35,
                   2.5, 0.7,
                   facecolor='white', edgecolor='black', linewidth=1.5)
    ax.text(nodes['generate_paths'][0], nodes['generate_paths'][1], 'Generate Sweep Paths\nfor Each Sub-region',
            ha='center', va='center', fontsize=9, linespacing=1.2)
    
    draw_rectangle(ax, nodes['merge_paths'][0] - 1.25, nodes['merge_paths'][1] - 0.35,
                   2.5, 0.7,
                   facecolor='white', edgecolor='black', linewidth=1.5)
    ax.text(nodes['merge_paths'][0], nodes['merge_paths'][1], 'Merge All Paths',
            ha='center', va='center', fontsize=9)
    
    draw_parallelogram(ax, nodes['output'][0] - 1.25, nodes['output'][1] - 0.35,
                       2.5, 0.7,
                       facecolor='white', edgecolor='black', linewidth=1.5)
    ax.text(nodes['output'][0], nodes['output'][1], 'Output Waypoint\nSequence',
            ha='center', va='center', fontsize=9, linespacing=1.2)
    
    draw_rounded_rect(ax, nodes['end'][0] - 1, nodes['end'][1] - 0.25,
                     2, 0.5, radius=0.25,
                     facecolor='white', edgecolor='black', linewidth=1.5)
    ax.text(nodes['end'][0], nodes['end'][1], 'End',
            ha='center', va='center', fontsize=10)
    
    draw_rectangle(ax, nodes['error'][0] - 1.25, nodes['error'][1] - 0.35,
                   2.5, 0.7,
                   facecolor='white', edgecolor='black', linewidth=1.5, linestyle='--')
    ax.text(nodes['error'][0], nodes['error'][1], 'Error:\nInvalid Polygon',
            ha='center', va='center', fontsize=9, linespacing=1.2)
    
    draw_arrow(ax, nodes['start'][0], nodes['start'][1] - 0.25,
               nodes['input'][0], nodes['input'][1] + 0.35)
    
    draw_arrow(ax, nodes['input'][0], nodes['input'][1] - 0.35,
               nodes['validate'][0], nodes['validate'][1] + 0.6)
    
    draw_arrow(ax, nodes['validate'][0], nodes['validate'][1] - 0.6,
               nodes['find_critical'][0], nodes['find_critical'][1] + 0.35)
    ax.text(nodes['validate'][0] + 1.4, nodes['validate'][1] - 0.3, 'Yes',
            ha='left', va='center', fontsize=9)
    
    draw_arrow(ax, nodes['validate'][0] + 1.25, nodes['validate'][1],
               nodes['error'][0] - 1.25, nodes['error'][1])
    ax.text(nodes['validate'][0] + 2.0, nodes['validate'][1] + 0.15, 'No',
            ha='left', va='center', fontsize=9)
    
    draw_arrow(ax, nodes['error'][0], nodes['error'][1] - 0.35,
               nodes['error'][0], 2.0)
    draw_arrow(ax, nodes['error'][0], 2.0,
               nodes['end'][0] + 1, nodes['end'][1])
    
    draw_arrow(ax, nodes['find_critical'][0], nodes['find_critical'][1] - 0.35,
               nodes['decompose'][0], nodes['decompose'][1] + 0.35)
    
    draw_arrow(ax, nodes['decompose'][0], nodes['decompose'][1] - 0.35,
               nodes['generate_paths'][0], nodes['generate_paths'][1] + 0.35)
    
    draw_arrow(ax, nodes['generate_paths'][0], nodes['generate_paths'][1] - 0.35,
               nodes['merge_paths'][0], nodes['merge_paths'][1] + 0.35)
    
    draw_arrow(ax, nodes['merge_paths'][0], nodes['merge_paths'][1] - 0.35,
               nodes['output'][0], nodes['output'][1] + 0.35)
    
    draw_arrow(ax, nodes['output'][0], nodes['output'][1] - 0.35,
               nodes['end'][0], nodes['end'][1] + 0.25)
    
    plt.savefig('.sisyphus/thesis-materials/images/boustrophedon-flowchart.png', 
                dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    print("✓ Created boustrophedon-flowchart.png")

def figure2_horizontal_sweep():
    fig, ax = plt.subplots(figsize=(10, 8))
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 10)
    ax.axis('off')
    
    ax.text(6, 9.5, 'Horizontal Sweep Line Algorithm',
            ha='center', va='top', fontsize=12, fontweight='bold')
    
    polygon_coords = [
        (2, 2), (4, 1.5), (7, 2), (9, 3.5), (9, 6), (7, 8), (4, 8.5), (2, 7), (1.5, 4)
    ]
    polygon = patches.Polygon(polygon_coords, closed=True,
                              facecolor='#E8F4F8', edgecolor='#2C5F7F', linewidth=2)
    ax.add_patch(polygon)
    
    y_positions = [3.0, 4.5, 6.0, 7.5]
    colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
    
    for i, y in enumerate(y_positions):
        intersections = []
        for j in range(len(polygon_coords)):
            p1 = polygon_coords[j]
            p2 = polygon_coords[(j + 1) % len(polygon_coords)]
            
            if (p1[1] - y) * (p2[1] - y) < 0:  # Line crosses y
                x = p1[0] + (y - p1[1]) * (p2[0] - p1[0]) / (p2[1] - p1[1])
                intersections.append(x)
        
        intersections.sort()
        
        ax.axhline(y=y, xmin=0.05, xmax=0.95, color=colors[i], 
                   linewidth=1.5, linestyle='--', alpha=0.7,
                   label=f'Scan Line {i+1}' if i == 0 else None)
        
        for idx, x in enumerate(intersections):
            if idx % 2 == 0 and idx + 1 < len(intersections):
                ax.plot([x, intersections[idx + 1]], [y, y], 
                       color=colors[i], linewidth=2.5, marker='o',
                       markersize=5, markerfacecolor='white')
    
    ax.annotate('', xy=(10.5, 7), xytext=(10.5, 3),
                arrowprops=dict(arrowstyle='->', linewidth=2, color='#333333'))
    ax.text(10.7, 5, 'Y', ha='left', va='center', fontsize=10, fontweight='bold')
    
    ax.annotate('', xy=(11, y_positions[1]), xytext=(11, y_positions[0]),
                arrowprops=dict(arrowstyle='<->', linewidth=1.5, color='#666666'))
    ax.text(11.3, (y_positions[1] + y_positions[0]) / 2, 'swath_width',
            ha='left', va='center', fontsize=9, style='italic')
    
    ax_inset = fig.add_axes([0.65, 0.15, 0.3, 0.25])
    ax_inset.set_xlim(0, 5)
    ax_inset.set_ylim(0, 4)
    ax_inset.axis('off')
    
    zigzag_x = [0.5, 4.5, 4.5, 0.5, 0.5, 4.5]
    zigzag_y = [0.5, 0.5, 1.5, 1.5, 2.5, 2.5]
    ax_inset.plot(zigzag_x, zigzag_y, 'b-', linewidth=2, marker='o', markersize=6)
    ax_inset.text(2.5, 3.5, 'Zig-Zag Pattern', ha='center', va='top', 
                  fontsize=9, fontweight='bold')
    ax_inset.set_aspect('equal')
    
    ax.text(3, y_positions[0] + 0.15, '→', ha='center', va='bottom', 
            fontsize=12, color=colors[0])
    ax.text(5, y_positions[1] + 0.15, '←', ha='center', va='bottom',
            fontsize=12, color=colors[1])
    ax.text(3, y_positions[2] + 0.15, '→', ha='center', va='bottom',
            fontsize=12, color=colors[2])
    
    ax.text(6, 0.5, 'Legend:', ha='left', va='top', fontsize=9, fontweight='bold')
    ax.text(6, 0.3, '━━ Scan line trajectory', ha='left', va='top', fontsize=8)
    ax.text(8.5, 0.3, '━━ Waypoint path', ha='left', va='top', fontsize=8)
    
    plt.savefig('.sisyphus/thesis-materials/images/horizontal-sweep-diagram.png',
                dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    print("✓ Created horizontal-sweep-diagram.png")

def figure3_waypoint_optimization():
    fig, ax = plt.subplots(figsize=(9, 12))
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 15)
    ax.axis('off')
    
    ax.text(6, 14.5, 'Waypoint Optimization Algorithm',
            ha='center', va='top', fontsize=12, fontweight='bold')
    
    nodes = {
        'start': (6, 13.5),
        'input': (6, 12.5),
        'encode_polygon': (3, 11.3),
        'encode_waypoint': (9, 11.3),
        'concat': (6, 10.2),
        'mlp': (6, 9.0),
        'predict': (6, 7.8),
        'apply': (6, 6.6),
        'iteration': (6, 5.3),
        'output': (6, 3.5),
        'end': (6, 2.2),
    }
    
    draw_rounded_rect(ax, nodes['start'][0] - 1.2, nodes['start'][1] - 0.3,
                     2.4, 0.6, radius=0.3,
                     facecolor='white', edgecolor='black', linewidth=1.5)
    ax.text(nodes['start'][0], nodes['start'][1], 'Start',
            ha='center', va='center', fontsize=10)
    
    draw_parallelogram(ax, nodes['input'][0] - 1.5, nodes['input'][1] - 0.4,
                       3, 0.8,
                       facecolor='white', edgecolor='black', linewidth=1.5)
    ax.text(nodes['input'][0], nodes['input'][1], 'Input Initial\nPath Waypoints',
            ha='center', va='center', fontsize=9, linespacing=1.2)
    
    draw_rectangle(ax, nodes['encode_polygon'][0] - 1.5, nodes['encode_polygon'][1] - 0.4,
                   3, 0.8,
                   facecolor='#E8F8F0', edgecolor='#2E7D32', linewidth=1.5)
    ax.text(nodes['encode_polygon'][0], nodes['encode_polygon'][1],
            'Encode Polygon\nFeatures (6-dim)',
            ha='center', va='center', fontsize=9, linespacing=1.2)
    
    draw_rectangle(ax, nodes['encode_waypoint'][0] - 1.5, nodes['encode_waypoint'][1] - 0.4,
                   3, 0.8,
                   facecolor='#FFF3E0', edgecolor='#EF6C00', linewidth=1.5)
    ax.text(nodes['encode_waypoint'][0], nodes['encode_waypoint'][1],
            'Encode Waypoint\nContext (7-dim)',
            ha='center', va='center', fontsize=9, linespacing=1.2)
    
    draw_rectangle(ax, nodes['concat'][0] - 1.2, nodes['concat'][1] - 0.35,
                   2.4, 0.7,
                   facecolor='white', edgecolor='black', linewidth=1.5)
    ax.text(nodes['concat'][0], nodes['concat'][1], 'Concatenate\n(13-dim)',
            ha='center', va='center', fontsize=9, linespacing=1.2)
    
    draw_rectangle(ax, nodes['mlp'][0] - 1.5, nodes['mlp'][1] - 0.4,
                   3, 0.8,
                   facecolor='#E3F2FD', edgecolor='#1976D2', linewidth=1.5)
    ax.text(nodes['mlp'][0], nodes['mlp'][1], 'MLP Network\n13→64→32→2',
            ha='center', va='center', fontsize=9, linespacing=1.2)
    
    draw_rectangle(ax, nodes['predict'][0] - 1.5, nodes['predict'][1] - 0.4,
                   3, 0.8,
                   facecolor='white', edgecolor='black', linewidth=1.5)
    ax.text(nodes['predict'][0], nodes['predict'][1], 'Predict Adjustment\n(dx, dy)',
            ha='center', va='center', fontsize=9, linespacing=1.2)
    
    draw_rectangle(ax, nodes['apply'][0] - 1.5, nodes['apply'][1] - 0.4,
                   3, 0.8,
                   facecolor='white', edgecolor='black', linewidth=1.5)
    ax.text(nodes['apply'][0], nodes['apply'][1], 'Apply Adjustment\nwith Boundary Constraints',
            ha='center', va='center', fontsize=9, linespacing=1.2)
    
    draw_diamond(ax, nodes['iteration'][0] - 1.5, nodes['iteration'][1] - 0.7,
                 3, 1.4,
                 facecolor='white', edgecolor='black', linewidth=1.5)
    ax.text(nodes['iteration'][0], nodes['iteration'][1], 'More\nIterations?',
            ha='center', va='center', fontsize=9, linespacing=1.2)
    
    draw_parallelogram(ax, nodes['output'][0] - 1.5, nodes['output'][1] - 0.4,
                       3, 0.8,
                       facecolor='white', edgecolor='black', linewidth=1.5)
    ax.text(nodes['output'][0], nodes['output'][1], 'Output Optimized\nPath',
            ha='center', va='center', fontsize=9, linespacing=1.2)
    
    draw_rounded_rect(ax, nodes['end'][0] - 1.2, nodes['end'][1] - 0.3,
                     2.4, 0.6, radius=0.3,
                     facecolor='white', edgecolor='black', linewidth=1.5)
    ax.text(nodes['end'][0], nodes['end'][1], 'End',
            ha='center', va='center', fontsize=10)
    
    draw_arrow(ax, nodes['start'][0], nodes['start'][1] - 0.3,
               nodes['input'][0], nodes['input'][1] + 0.4)
    
    draw_arrow(ax, nodes['input'][0], nodes['input'][1] - 0.4,
               nodes['input'][0], 11.8)
    draw_arrow(ax, nodes['input'][0], 11.8,
               nodes['encode_polygon'][0], nodes['encode_polygon'][1] + 0.4)
    draw_arrow(ax, nodes['input'][0], 11.8,
               nodes['encode_waypoint'][0], nodes['encode_waypoint'][1] + 0.4)
    
    draw_arrow(ax, nodes['encode_polygon'][0] + 1.5, nodes['encode_polygon'][1],
               nodes['concat'][0] - 1.2, nodes['concat'][1] + 0.1)
    
    draw_arrow(ax, nodes['encode_waypoint'][0] - 1.5, nodes['encode_waypoint'][1],
               nodes['concat'][0] + 1.2, nodes['concat'][1] + 0.1)
    
    draw_arrow(ax, nodes['concat'][0], nodes['concat'][1] - 0.35,
               nodes['mlp'][0], nodes['mlp'][1] + 0.4)
    
    draw_arrow(ax, nodes['mlp'][0], nodes['mlp'][1] - 0.4,
               nodes['predict'][0], nodes['predict'][1] + 0.4)
    
    draw_arrow(ax, nodes['predict'][0], nodes['predict'][1] - 0.4,
               nodes['apply'][0], nodes['apply'][1] + 0.4)
    
    draw_arrow(ax, nodes['apply'][0], nodes['apply'][1] - 0.4,
               nodes['iteration'][0], nodes['iteration'][1] + 0.7)
    
    draw_arrow(ax, nodes['iteration'][0] - 1.5, nodes['iteration'][1],
               1.2, nodes['iteration'][1])
    draw_arrow(ax, 1.2, nodes['iteration'][1],
               1.2, 11.7)
    draw_arrow(ax, 1.2, 11.7,
               nodes['encode_polygon'][0] - 1.5, nodes['encode_polygon'][1])
    ax.text(nodes['iteration'][0] - 2.0, nodes['iteration'][1] + 0.2, 'Yes',
            ha='right', va='center', fontsize=9)
    
    draw_arrow(ax, nodes['iteration'][0], nodes['iteration'][1] - 0.7,
               nodes['output'][0], nodes['output'][1] + 0.4)
    ax.text(nodes['iteration'][0] + 1.8, nodes['iteration'][1] - 0.35, 'No',
            ha='left', va='center', fontsize=9)
    
    draw_arrow(ax, nodes['output'][0], nodes['output'][1] - 0.4,
               nodes['end'][0], nodes['end'][1] + 0.3)
    
    plt.savefig('.sisyphus/thesis-materials/images/waypoint-optimization-flowchart.png',
                dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    print("✓ Created waypoint-optimization-flowchart.png")

if __name__ == '__main__':
    print("Generating algorithm flowcharts for thesis Chapter 4...")
    print()
    figure1_boustrophedon()
    figure2_horizontal_sweep()
    figure3_waypoint_optimization()
    print()
    print("All flowcharts generated successfully!")
    print("Output directory: .sisyphus/thesis-materials/images/")
