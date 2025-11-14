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

## Hosting the dashboard on GitHub Pages

This repository includes a GitHub Actions workflow (`.github/workflows/deploy-frontend.yml`) that builds the React dashboard and publishes the static assets to the `gh-pages` branch. The workflow is triggered on every push to the `main` branch (and can also be run manually with the **Run workflow** button). To make the site available at `https://<user>.github.io/<repo>/`:

1. Push the latest changes to `main` so the **Deploy frontend to GitHub Pages** workflow runs successfully.
2. In the repository settings under **Pages**, set the source to **GitHub Actions**. GitHub will automatically serve the deployed artifact once the workflow finishes.

During the workflow run the environment variable `VITE_BASE_PATH` is set to `/<repo>/`, ensuring that all bundled assets are referenced correctly from the GitHub Pages sub-path. If your deployment uses a custom domain or a different repository name, override `VITE_BASE_PATH` (either in the workflow file or via an environment variable) with the appropriate base URL.

If the backend API is hosted anywhere other than `http://localhost:8000/api`, set `VITE_API_BASE_URL` (for example via GitHub repository secrets or environment variables) so the static dashboard knows how to reach the live API.

## Next steps

- Connect to Alpaca's WebSocket/REST feeds to populate prices and trigger trades.
- Store real trade executions and compute realized P/L per position.
- Harden authentication, environment configuration, and deployment tooling.
