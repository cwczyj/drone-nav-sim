import { render, screen } from '../../test-utils';
import MapCanvas from './MapCanvas';
import type { PolygonData } from './MapCanvas';

jest.mock('react-leaflet', () => ({
  MapContainer: ({ children, bounds, style }: any) => (
    <div data-testid="map-container" data-bounds={JSON.stringify(bounds)} style={style}>
      {children}
    </div>
  ),
  Polygon: ({ positions }: { positions: [number, number][] }) => (
    <div data-testid="polygon" data-positions={JSON.stringify(positions)} />
  ),
  Polyline: ({ positions }: { positions: [number, number][] }) => (
    <div data-testid="polyline" data-positions={JSON.stringify(positions)} />
  ),
}));

jest.mock('react-leaflet-draw', () => ({
  EditControl: () => <div data-testid="edit-control" />,
  FeatureGroup: ({ children }: any) => <div data-testid="feature-group">{children}</div>,
}));

jest.mock('leaflet', () => ({
  CRS: {
    Simple: 'Simple',
  },
  Icon: {
    Default: {
      prototype: {},
      mergeOptions: jest.fn(),
    },
  },
}));

jest.mock('leaflet-draw', () => ({}));

jest.mock('leaflet-draw/dist/leaflet.draw.css', () => ({}));

describe('MapCanvas', () => {
  const mockPolygons: PolygonData[] = [
    {
      id: '1',
      coordinates: [
        [100, 100],
        [200, 100],
        [200, 200],
        [100, 200],
      ],
      color: '#aa3bff',
      fillColor: '#aa3bff',
      fillOpacity: 0.2,
    },
    {
      id: '2',
      coordinates: [
        [300, 300],
        [400, 300],
        [400, 400],
        [300, 400],
      ],
      color: '#aa3bff',
      fillColor: '#aa3bff',
      fillOpacity: 0.2,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders map container with grid overlay and boundary', () => {
    render(<MapCanvas />);

    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  test('displays polygons when provided', () => {
    render(<MapCanvas polygons={mockPolygons} />);

    const polygons = screen.getAllByTestId('polygon');
    expect(polygons).toHaveLength(2);
  });

  test('displays polygons with correct coordinates', () => {
    render(<MapCanvas polygons={mockPolygons} />);

    const polygons = screen.getAllByTestId('polygon');
    const firstPolygon = polygons[0];
    const positions = JSON.parse(firstPolygon.getAttribute('data-positions') || '[]');

    expect(positions).toEqual([
      [100, 100],
      [100, 200],
      [200, 200],
      [200, 100],
    ]);
  });

  test('renders without polygons by default', () => {
    render(<MapCanvas />);

    const polygons = screen.queryAllByTestId('polygon');
    expect(polygons).toHaveLength(0);
  });

  test('accepts editable prop', () => {
    render(<MapCanvas editable={true} polygons={mockPolygons} />);

    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  test('handles empty polygons array', () => {
    render(<MapCanvas polygons={[]} />);

    const polygons = screen.queryAllByTestId('polygon');
    expect(polygons).toHaveLength(0);
  });
});
