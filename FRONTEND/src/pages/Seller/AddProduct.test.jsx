import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

if (!globalThis.URL.createObjectURL) {
  globalThis.URL.createObjectURL = () => 'blob:test-preview';
}

if (!globalThis.URL.revokeObjectURL) {
  globalThis.URL.revokeObjectURL = () => {};
}

const mockNavigate = vi.fn();
const mockGetShop = vi.fn();
const mockUploadProductImage = vi.fn();
const mockAnalyze = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../lib/api.js', () => ({
  ownerApi: {
    getShop: (...args) => mockGetShop(...args),
  },
  uploadApi: {
    uploadProductImage: (...args) => mockUploadProductImage(...args),
  },
  onboardingApi: {
    analyze: (...args) => mockAnalyze(...args),
  },
}));

import AddProduct from './AddProduct.jsx';

describe('AddProduct page', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockGetShop.mockReset();
    mockUploadProductImage.mockReset();
    mockAnalyze.mockReset();
  });

  test('uploads an image and routes to AI review with backend analysis', async () => {
    mockGetShop.mockResolvedValue({ id: 'shop-1', name: 'Demo Shop' });
    mockUploadProductImage.mockResolvedValue({ imageUrl: 'http://localhost:4000/uploads/product-demo.png' });
    mockAnalyze.mockResolvedValue({ extracted: { name: 'Colgate', category: 'personal-care' } });
    const user = userEvent.setup();

    const { container } = render(
      <MemoryRouter>
        <AddProduct />
      </MemoryRouter>
    );

    await waitFor(() => expect(mockGetShop).toHaveBeenCalledTimes(1));

    await user.type(screen.getByPlaceholderText(/maggi 2-minute noodles/i), 'Colgate Strong Teeth');
    await user.type(screen.getByPlaceholderText(/paste label text/i), 'toothpaste oral care');

    const fileInput = container.querySelector('input[type="file"]');
    const file = new File(['demo'], 'colgate.png', { type: 'image/png' });
    await user.upload(fileInput, file);
    await user.click(screen.getByRole('button', { name: /analyze with ai/i }));

    await waitFor(() => expect(mockUploadProductImage).toHaveBeenCalledTimes(1));
    expect(mockAnalyze).toHaveBeenCalledWith({
      imageUrl: 'http://localhost:4000/uploads/product-demo.png',
      rawText: 'toothpaste oral care',
      manualHint: 'Colgate Strong Teeth toothpaste oral care',
      shopId: 'shop-1',
    });
    expect(mockNavigate).toHaveBeenCalledWith('/seller/ai-review', {
      state: {
        analysis: { extracted: { name: 'Colgate', category: 'personal-care' } },
        draft: {
          name: 'Colgate Strong Teeth',
          price: '',
          stock: 1,
          desc: 'toothpaste oral care',
        },
        imageUrl: 'http://localhost:4000/uploads/product-demo.png',
      },
    });
  });
});
