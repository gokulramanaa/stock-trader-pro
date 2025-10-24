# Stock Trader Pro

Prototype environment for an automated paper-trading dashboard that monitors S&P 500 movements using Alpaca's paper trading API. The project is split into a Django REST backend and a Vite-powered React (TypeScript) frontend so future iterations can wire in live brokerage logic.

## Project layout

```
stock-trader-pro/
├── backend/              # Django project providing REST APIs
├── frontend/             # React dashboard consuming the APIs
├── requirements.txt      # Python dependencies for the backend
└── README.md             # This file
```

## Backend (Django)

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd backend
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

Key endpoints (all prefixed with `/api/`):

- `stocks/` – CRUD endpoint for tracked S&P 500 symbols.
- `trades/` – Records automated buys/sells.
- `summary/` – Aggregated dashboard metrics used by the frontend.

Run unit tests with:

```bash
cd backend
python manage.py test
```

## Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Set `VITE_API_BASE_URL` in a `.env` file to point at the backend if it differs from the default `http://localhost:8000/api`.

Build and test commands:

```bash
npm run build
npm test
```

The React dashboard polls the API every minute to stay aligned with the automation requirements and highlights trades triggered by ±5% intraday moves.

## Next steps

- Connect to Alpaca's WebSocket/REST feeds to populate prices and trigger trades.
- Store real trade executions and compute realized P/L per position.
- Harden authentication, environment configuration, and deployment tooling.
