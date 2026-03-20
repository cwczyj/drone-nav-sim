import { render, screen, waitFor } from '@testing-library/react';
import PathVisualization from './PathVisualization';
import { pathPlanningAPI } from '../../services/api';

jest.mock('react-leaflet', () => ({
  MapContainer: ({ children, ...props }: any) => <div data-testid="map-container" {...props}>{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Polygon: ({ children, ...props }: any) => <div data-testid="polygon" {...props}>{children}</div>,
  Polyline: () => <div data-testid="polyline" />,
  CircleMarker: ({ children, ...props }: any) => <div data-testid="circle-marker" {...props}>{children}</div>,
  Popup: ({ children, ...props }: any) => <div data-testid="popup" {...props}>{children}</div>,
}));

jest.mock('../../services/api', () => ({
  pathPlanningAPI: {
    generate: jest.fn(),
  },
}));

const mockBoundaryCoords = [
  [30.6742, 104.0667],
  [30.6752, 104.0687],
  [30.6762, 104.0667],
  [30.6742, 104.0667],
];

const mockPathResponse = {
  data: {
    path: [
      [100, 100],
      [200, 150],
      [300, 200],
      [400, 250],
    ],
    totalDistance: 1500.5,
    estimatedTime: 45.5,
  },
};

describe('PathVisualization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders container', () => {
    render(
      <PathVisualization
        farmlandId=""
        boundaryCoords={mockBoundaryCoords}
      />
    );

    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  test('calls pathPlanningAPI.generate with correct parameters', async () => {
    (pathPlanningAPI.generate as jest.Mock).mockResolvedValue(mockPathResponse);

    render(
      <PathVisualization
        farmlandId="test-id"
        boundaryCoords={mockBoundaryCoords}
        swathWidth={3.5}
        useDl={true}
      />
    );

    await waitFor(() => {
      expect(pathPlanningAPI.generate).toHaveBeenCalledWith({
        farmlandId: 'test-id',
        swathWidth: 3.5,
        useDl: true,
      });
    });
  });

  test('does not fetch path if farmlandId is not provided', () => {
    render(
      <PathVisualization
        farmlandId=""
        boundaryCoords={mockBoundaryCoords}
      />
    );

    expect(pathPlanningAPI.generate).not.toHaveBeenCalled();
  });

  test('fetches path when farmlandId changes', async () => {
    (pathPlanningAPI.generate as jest.Mock).mockResolvedValue(mockPathResponse);

    const { rerender } = render(
      <PathVisualization
        farmlandId="first-id"
        boundaryCoords={mockBoundaryCoords}
      />
    );

    await waitFor(() => {
      expect(pathPlanningAPI.generate).toHaveBeenCalledTimes(1);
    });

    rerender(
      <PathVisualization
        farmlandId="second-id"
        boundaryCoords={mockBoundaryCoords}
      />
    );

    await waitFor(() => {
      expect(pathPlanningAPI.generate).toHaveBeenCalledTimes(2);
    });
  });

  test('shows error state when API call fails', async () => {
    (pathPlanningAPI.generate as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(
      <PathVisualization
        farmlandId="test-id"
        boundaryCoords={mockBoundaryCoords}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/生成航线失败/i)).toBeInTheDocument();
    });
  });
});
