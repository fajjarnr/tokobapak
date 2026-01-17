# Build stage
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Install dependencies
RUN apk add --no-cache git

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build binary
RUN CGO_ENABLED=0 GOOS=linux go build -o /shipping-service ./cmd/server

# Production stage
FROM alpine:3.19

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Copy binary
COPY --from=builder /shipping-service .
COPY migrations ./migrations

# Change ownership
RUN chown -R appuser:appgroup /app

USER appuser

ENV PORT=3008
EXPOSE 3008

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3008/health || exit 1

ENTRYPOINT ["./shipping-service"]
