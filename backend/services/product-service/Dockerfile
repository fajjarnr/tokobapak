# syntax=docker/dockerfile:1
FROM docker.io/library/golang:1.27-alpine AS builder
WORKDIR /app
COPY go.mod go.sum* ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /server ./cmd/server

FROM gcr.io/distroless/static-debian12:nonroot
WORKDIR /app
COPY --from=builder /server /app/server
COPY migrations ./migrations
USER 1001:1001
EXPOSE 8080
EXPOSE 3001
ENV PORT=3001
ENTRYPOINT ["/app/server"]
