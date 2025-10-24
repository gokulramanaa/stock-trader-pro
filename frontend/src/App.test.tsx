import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import type { ReactElement } from 'react';
import axios from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

vi.mock('axios');

const mockedAxios = axios as unknown as {
  get: ReturnType<typeof vi.fn>;
};

function renderWithClient(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('App dashboard', () => {
  beforeEach(() => {
    mockedAxios.get = vi.fn((url: string) => {
      if (url.endsWith('/stocks/')) {
        return Promise.resolve({
          data: [
            {
              id: 1,
              symbol: 'AAPL',
              company_name: 'Apple Inc.',
              last_price: 175.25,
              daily_change_percent: 2.35,
              last_updated: new Date('2024-01-01T15:30:00Z').toISOString()
            }
          ]
        });
      }

      if (url.endsWith('/trades/')) {
        return Promise.resolve({
          data: [
            {
              id: 1,
              stock: 1,
              stock_symbol: 'AAPL',
              company_name: 'Apple Inc.',
              action: 'BUY',
              quantity: 1,
              notional: 10,
              status: 'filled',
              notes: '',
              executed_at: new Date('2024-01-01T15:31:00Z').toISOString()
            }
          ]
        });
      }

      if (url.endsWith('/summary/')) {
        return Promise.resolve({
          data: {
            total_symbols: 1,
            open_positions: 1,
            todays_buys: 1,
            todays_sells: 0,
            total_notional: 10,
            realized_profit: 1.5
          }
        });
      }

      return Promise.reject(new Error(`Unhandled url: ${url}`));
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the dashboard with summary data', async () => {
    renderWithClient(<App />);

    await waitFor(() => expect(screen.getByText('Stock Trader Pro')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('Total symbols tracked')).toBeInTheDocument());
    const symbolCells = await screen.findAllByText('AAPL');
    expect(symbolCells).toHaveLength(2);
    expect(screen.getByText('BUY')).toBeInTheDocument();
  });
});
