FROM golang:1.22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache git
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /media-service ./cmd/server

FROM alpine:3.19
WORKDIR /app
RUN addgroup -g 1001 -S appgroup && adduser -u 1001 -S appuser -G appgroup
COPY --from=builder /media-service .
RUN mkdir -p /app/uploads && chown -R appuser:appgroup /app
USER appuser

ENV PORT=3015
EXPOSE 3015

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3015/health || exit 1

ENTRYPOINT ["./media-service"]
