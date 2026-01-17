# Recommendation Service

ML-based Product Recommendations for TokoBapak powered by FastAPI.

## Features

- **Personalized Recommendations**: Content-based filtering
- **Similar Products**: Find products similar to a given product
- **Trending Products**: Popular product suggestions
- **User Interactions**: Track views, purchases, cart adds
- **Real-time Updates**: Record interactions for training

## Tech Stack

- Python 3.12
- FastAPI
- Pydantic 2.x
- NumPy / Scikit-learn

## API Endpoints

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/api/v1/recommendations/personalized` | Get personalized recommendations |
| POST | `/api/v1/recommendations/similar` | Get similar products |
| GET | `/api/v1/recommendations/trending` | Get trending products |
| POST | `/api/v1/interactions` | Record user interaction |
| POST | `/api/v1/products` | Add product to engine |
| GET | `/health` | Health check |

## Running Locally

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 3014
```

## Environment Variables

| Variable | Default | Description |
| -------- | ------- | ----------- |
| PORT | 3014 | Service port |
