import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import clsx from 'clsx';
import './styles/App.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';

export type Stock = {
  id: number;
  symbol: string;
  company_name: string;
  last_price: number;
  daily_change_percent: number;
  last_updated: string;
};

export type Trade = {
  id: number;
  stock: number;
  stock_symbol: string;
  company_name: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  notional: number;
  status: string;
  notes: string;
  executed_at: string;
};

export type DashboardSummary = {
  total_symbols: number;
  open_positions: number;
  todays_buys: number;
  todays_sells: number;
  total_notional: number;
  realized_profit: number;
};

type ApiListResponse<T> = {
  results?: T[];
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2
});

const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

async function fetchFromApi<T>(path: string) {
  const url = `${API_BASE_URL}${path}`;
  const response = await axios.get<T>(url);
  return response.data;
}

function normaliseList<T>(payload: ApiListResponse<T> | T[]): T[] {
  if (Array.isArray(payload)) {
    return payload;
  }
  return payload.results ?? [];
}

function App() {
  const stocksQuery = useQuery({
    queryKey: ['stocks'],
    queryFn: async () => normaliseList(await fetchFromApi<Stock[] | ApiListResponse<Stock>>('/stocks/'))
  });

  const tradesQuery = useQuery({
    queryKey: ['trades'],
    queryFn: async () => normaliseList(await fetchFromApi<Trade[] | ApiListResponse<Trade>>('/trades/'))
  });

  const summaryQuery = useQuery({
    queryKey: ['summary'],
    queryFn: () => fetchFromApi<DashboardSummary>('/summary/')
  });

  const loading = stocksQuery.isPending || tradesQuery.isPending || summaryQuery.isPending;
  const error = stocksQuery.error || tradesQuery.error || summaryQuery.error;

  const lastUpdated = useMemo(() => {
    const stocks = stocksQuery.data ?? [];
    if (!stocks.length) {
      return null;
    }
    const timestamps = stocks
      .map((stock) => new Date(stock.last_updated).getTime())
      .filter((value) => Number.isFinite(value));
    if (!timestamps.length) {
      return null;
    }
    return new Date(Math.max(...timestamps)).toLocaleString();
  }, [stocksQuery.data]);

  const renderChange = (value: number) => {
    const formatted = percentFormatter.format(value / 100);
    const changeClass = clsx({
      'change-positive': value > 0,
      'change-negative': value < 0
    });
    return <span className={changeClass}>{formatted}</span>;
  };

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <h1>Stock Trader Pro</h1>
          <p className="app__subtitle">
            Automated paper trading signals for the S&amp;P 500 watchlist
          </p>
        </div>
        {lastUpdated && <p className="app__meta">Last updated: {lastUpdated}</p>}
      </header>

      {loading && <div className="status">Loading dashboard data…</div>}
      {error && (
        <div className="status status--error">
          Unable to load dashboard data. Check that the Django API is running.
        </div>
      )}

      {summaryQuery.data && (
        <section className="summary-grid" aria-label="Trading summary">
          <article className="summary-card">
            <h2>Total symbols tracked</h2>
            <p className="summary-card__value">{summaryQuery.data.total_symbols}</p>
          </article>
          <article className="summary-card">
            <h2>Open positions</h2>
            <p className="summary-card__value">{summaryQuery.data.open_positions}</p>
          </article>
          <article className="summary-card">
            <h2>Today's buys</h2>
            <p className="summary-card__value">{summaryQuery.data.todays_buys}</p>
          </article>
          <article className="summary-card">
            <h2>Today's sells</h2>
            <p className="summary-card__value">{summaryQuery.data.todays_sells}</p>
          </article>
          <article className="summary-card">
            <h2>Total capital deployed</h2>
            <p className="summary-card__value">
              {currencyFormatter.format(summaryQuery.data.total_notional)}
            </p>
          </article>
          <article className="summary-card">
            <h2>Realized profit</h2>
            <p
              className={clsx('summary-card__value', {
                'summary-card__value--positive': summaryQuery.data.realized_profit > 0,
                'summary-card__value--negative': summaryQuery.data.realized_profit < 0
              })}
            >
              {currencyFormatter.format(summaryQuery.data.realized_profit)}
            </p>
          </article>
        </section>
      )}

      <div className="content-grid">
        <section className="panel" aria-label="S&P 500 watchlist">
          <header className="panel__header">
            <h2>S&amp;P 500 watchlist</h2>
            <p className="panel__description">
              Most recent prices and percentage change captured from broker updates.
            </p>
          </header>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th scope="col">Symbol</th>
                  <th scope="col">Company</th>
                  <th scope="col">Price</th>
                  <th scope="col">Change</th>
                </tr>
              </thead>
              <tbody>
                {(stocksQuery.data?.length ?? 0) === 0 && !loading && (
                  <tr>
                    <td colSpan={4} className="table__empty">
                      No stock snapshots yet. Connect the Alpaca sync to start tracking prices.
                    </td>
                  </tr>
                )}
                {stocksQuery.data?.map((stock) => (
                  <tr key={stock.id}>
                    <td>{stock.symbol}</td>
                    <td>{stock.company_name}</td>
                    <td>{currencyFormatter.format(stock.last_price)}</td>
                    <td>{renderChange(stock.daily_change_percent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel" aria-label="Recent trades">
          <header className="panel__header">
            <h2>Recent trades</h2>
            <p className="panel__description">
              Automated $10 notional orders triggered by ±5% intraday moves.
            </p>
          </header>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th scope="col">Time</th>
                  <th scope="col">Symbol</th>
                  <th scope="col">Action</th>
                  <th scope="col">Notional</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {(tradesQuery.data?.length ?? 0) === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="table__empty">
                      No trades recorded yet. Orders will appear here once the automation runs.
                    </td>
                  </tr>
                )}
                {tradesQuery.data?.map((trade) => (
                  <tr key={trade.id}>
                    <td>{new Date(trade.executed_at).toLocaleString()}</td>
                    <td>{trade.stock_symbol}</td>
                    <td>
                      <span
                        className={clsx('pill', {
                          'pill--buy': trade.action === 'BUY',
                          'pill--sell': trade.action === 'SELL'
                        })}
                      >
                        {trade.action}
                      </span>
                    </td>
                    <td>{currencyFormatter.format(trade.notional)}</td>
                    <td>{trade.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
