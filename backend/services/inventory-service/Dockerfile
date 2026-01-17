# Build stage
FROM golang:1.22-alpine AS builder

WORKDIR /app
RUN apk add --no-cache git

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /inventory-service ./cmd/server

# Production stage
FROM alpine:3.19
WORKDIR /app

RUN addgroup -g 1001 -S appgroup && adduser -u 1001 -S appuser -G appgroup

COPY --from=builder /inventory-service .
COPY migrations ./migrations

RUN chown -R appuser:appgroup /app
USER appuser

ENV PORT=3011
EXPOSE 3011

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3011/health || exit 1

ENTRYPOINT ["./inventory-service"]
