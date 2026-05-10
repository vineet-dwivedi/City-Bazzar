import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const mockSearchProducts = vi.fn();

vi.mock('gsap', () => ({
  default: {
    context(callback) {
      callback();
      return { revert() {} };
    },
    fromTo: vi.fn(),
  },
}));

vi.mock('../../hooks/useUserLocation.js', () => ({
  useUserLocation: () => ({
    location: {
      lat: 12.9716,
      lng: 77.5946,
      radiusKm: 5,
      label: 'Koramangala, Bangalore',
    },
  }),
}));

vi.mock('../../lib/api.js', () => ({
  discoveryApi: {
    searchProducts: (...args) => mockSearchProducts(...args),
    listShops: vi.fn(),
    getShop: vi.fn(),
  },
}));

import BuyerSearch from './BuyerSearch.jsx';

describe('BuyerSearch page', () => {
  beforeEach(() => {
    mockSearchProducts.mockReset();
  });

  test('loads paginated buyer search results from the backend query params', async () => {
    mockSearchProducts.mockResolvedValue({
      results: [
        {
          product: { id: 'prod-1', name: 'Colgate Strong Teeth Toothpaste', category: 'personal-care' },
          nearbyShops: [
            {
              shopId: 'shop-1',
              shopName: 'Urban Health Store',
              distanceKm: 0.4,
              price: 95,
              quantity: 4,
              stockStatus: 'in_stock',
            },
          ],
        },
      ],
      pagination: {
        page: 2,
        pageSize: 8,
        totalItems: 9,
        totalPages: 2,
      },
    });

    render(
      <MemoryRouter initialEntries={['/search?q=colgate&page=2']}>
        <Routes>
          <Route path="/search" element={<BuyerSearch />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockSearchProducts).toHaveBeenCalledWith({
        query: 'colgate',
        lat: 12.9716,
        lng: 77.5946,
        radiusKm: 5,
        page: 2,
        pageSize: 8,
      });
    });

    expect(await screen.findByText(/colgate strong teeth toothpaste/i)).toBeInTheDocument();
    expect(screen.getByText(/page 2 of 2/i)).toBeInTheDocument();
  });
});
