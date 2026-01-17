# Media Service

Image & Video Processing Microservice for TokoBapak built with Go.

## Features

- **File Upload**: Upload images and videos
- **File Storage**: Local file system storage (S3/R2 ready)
- **File Serving**: Serve uploaded media files
- **Format Validation**: Allowed formats: JPG, PNG, GIF, WebP, MP4, WebM
- **Size Limits**: Max 10MB per file

## Tech Stack

- Go 1.22
- Chi Router

## API Endpoints

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/api/v1/media/upload` | Upload a file |
| GET | `/api/v1/media` | List uploaded files |
| DELETE | `/api/v1/media/{filename}` | Delete a file |
| GET | `/media/{filename}` | Serve a file |
| GET | `/health` | Health check |

## Upload Request

```bash
curl -X POST http://localhost:3015/api/v1/media/upload \
  -F "file=@image.jpg" \
  -F "ownerId=product-123" \
  -F "ownerType=product"
```

## Running Locally

```bash
export STORAGE_PATH="./uploads"
export PORT="3015"

go run cmd/server/main.go
```

## Environment Variables

| Variable | Default | Description |
| -------- | ------- | ----------- |
| PORT | 3015 | Service port |
| STORAGE_PATH | ./uploads | File storage path |
