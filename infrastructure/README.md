# TokoBapak Infrastructure

Docker and infrastructure configurations for local development and production.

## Docker Compose

### Start All Services
```bash
cd docker
docker compose up -d
```

### Services Started
- **PostgreSQL** - Port 5432
- **Redis** - Port 6379

### Stop Services
```bash
docker compose down
```

### View Logs
```bash
docker compose logs -f postgres
docker compose logs -f redis
```

## Database Connections

### PostgreSQL
```
Host: localhost
Port: 5432
User: postgres
Password: postgres
Databases: tokobapak_products, tokobapak_catalog
```

### Redis
```
Host: localhost
Port: 6379
```

## Future Infrastructure

- [ ] Kubernetes manifests
- [ ] Helm charts
- [ ] Terraform modules
- [ ] Monitoring (Prometheus/Grafana)
