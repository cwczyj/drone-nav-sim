import './DrawingControls.css';

export type DrawingMode = 'view' | 'draw' | 'edit' | 'delete';

export interface DrawingControlsProps {
  mode: DrawingMode;
  onModeChange: (mode: DrawingMode) => void;
  disabled?: boolean;
}

export default function DrawingControls({
  mode,
  onModeChange,
  disabled = false,
}: DrawingControlsProps) {
  const getButtonClass = (buttonMode: DrawingMode) => {
    const baseClass = 'drawing-control-btn';
    if (disabled) {
      return `${baseClass} disabled`;
    }
    if (mode === buttonMode) {
      return `${baseClass} active`;
    }
    return baseClass;
  };

  const getModeLabel = () => {
    switch (mode) {
      case 'draw':
        return '绘制模式';
      case 'edit':
        return '编辑模式';
      case 'delete':
        return '删除模式';
      default:
        return '查看模式';
    }
  };

  const getModeColor = () => {
    switch (mode) {
      case 'draw':
        return '#4ade80';
      case 'edit':
        return '#facc15';
      case 'delete':
        return '#f87171';
      default:
        return '#9ca3af';
    }
  };

  return (
    <div className="drawing-controls">
      <div className="mode-indicator">
        <span
          className="mode-dot"
          style={{ backgroundColor: getModeColor() }}
        />
        <span className="mode-label">{getModeLabel()}</span>
      </div>
      
      <div className="drawing-buttons">
        <button
          className={getButtonClass('view')}
          onClick={() => onModeChange('view')}
          disabled={disabled}
          title="查看模式"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
        
        <button
          className={getButtonClass('draw')}
          onClick={() => onModeChange('draw')}
          disabled={disabled}
          title="绘制多边形"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 19l7-7 3 3-7 7-3-3z" />
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
            <path d="M2 2l7.586 7.586" />
            <circle cx="11" cy="11" r="2" />
          </svg>
        </button>
        
        <button
          className={getButtonClass('edit')}
          onClick={() => onModeChange('edit')}
          disabled={disabled}
          title="编辑多边形"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        
        <button
          className={getButtonClass('delete')}
          onClick={() => onModeChange('delete')}
          disabled={disabled}
          title="删除多边形"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </button>
      </div>
    </div>
  );
}
