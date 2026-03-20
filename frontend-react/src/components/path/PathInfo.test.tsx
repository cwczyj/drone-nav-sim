import { render, screen } from '../../test-utils';
import PathInfo from './PathInfo';

describe('PathInfo', () => {
  const mockStats = {
    totalDistance: 1500.5,
    waypointCount: 25,
    estimatedTime: 45.5,
    swathWidth: 2.5,
  };

  test('renders placeholder when no stats provided', () => {
    render(<PathInfo pathStats={null} />);
    expect(screen.getByText(/暂无航线数据/i)).toBeInTheDocument();
  });

  test('renders path statistics correctly', () => {
    render(<PathInfo pathStats={mockStats} />);
    expect(screen.getByText(/航线统计/i)).toBeInTheDocument();
    expect(screen.getByText(/总距离/i)).toBeInTheDocument();
    expect(screen.getByText(/航点数量/i)).toBeInTheDocument();
    expect(screen.getByText(/预计飞行时间/i)).toBeInTheDocument();
    expect(screen.getByText(/行宽/i)).toBeInTheDocument();
  });

  test('displays correct distance formatting for meters', () => {
    const shortDistanceStats = { ...mockStats, totalDistance: 500.3 };
    render(<PathInfo pathStats={shortDistanceStats} />);
    expect(screen.getByText(/500\.3 m/)).toBeInTheDocument();
  });

  test('displays correct distance formatting for kilometers', () => {
    const longDistanceStats = { ...mockStats, totalDistance: 2500.7 };
    render(<PathInfo pathStats={longDistanceStats} />);
    expect(screen.getByText(/2\.50 km/)).toBeInTheDocument();
  });

  test('displays correct waypoint count', () => {
    render(<PathInfo pathStats={mockStats} />);
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  test('displays correct swath width', () => {
    render(<PathInfo pathStats={mockStats} />);
    expect(screen.getByText(/2\.5 m/)).toBeInTheDocument();
  });

  test('container has correct structure', () => {
    render(<PathInfo pathStats={mockStats} />);
    const container = screen.getByText(/航线统计/i).closest('div');
    expect(container).toBeInTheDocument();
    expect(container).toHaveTextContent('航线统计');
    expect(container).toHaveTextContent('总距离');
    expect(container).toHaveTextContent('航点数量');
    expect(container).toHaveTextContent('预计飞行时间');
    expect(container).toHaveTextContent('行宽');
  });
});
