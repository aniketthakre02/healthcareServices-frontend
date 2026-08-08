# Deployment Guide — Healthcare Management System

Two services: `frontend` (React + Vite + Nginx) and `backend` (Spring Boot 3.3 + MySQL 8). Orchestrated via `docker-compose.yml`.

---

## 1. Prerequisites

- Docker Engine 24+ and Docker Compose v2 (`docker compose version`)
- Ports 80, 8080, 3307 free (or adjust via env)
- For local dev without Docker: Node 20+ and Java 17

---

## 2. Quick Start (Docker)

```bash
# Clone
git clone <this-repo> && cd healthcareServices-frontend

# Copy env (edit secrets!)
cp .env.example .env
# Generate a strong JWT secret (optional)
openssl rand -base64 48 | tr -d '\n' > /tmp/jwt && echo "JWT_SECRET=$(cat /tmp/jwt)" >> .env

# Build & run
docker compose up --build -d

# Follow logs
docker compose logs -f

# Check health
curl http://localhost/actuator/health  # backend via frontend proxy
curl http://localhost/health           # frontend
curl http://localhost:8080/actuator/health  # backend direct
```

Services:

| Service | URL | Health |
|---------|-----|--------|
| Frontend | http://localhost | http://localhost/health |
| Backend | http://localhost:8080 | http://localhost:8080/actuator/health |
| MySQL | localhost:3307 | `docker compose ps` |

Stop:

```bash
docker compose down        # keep volumes
docker compose down -v     # wipe DB
```

---

## 3. Environment Variables

All defaults live in `.env` / `docker-compose.yml`. Override per environment.

| Var | Default | Description |
|-----|---------|-------------|
| `DB_NAME` | healthcareservice | MySQL database |
| `DB_USER` / `DB_PASSWORD` | healthcare_user / healthcare_pass | App DB user (not root) |
| `DB_ROOT_PASSWORD` | rootpassword | MySQL root |
| `DB_PORT_HOST` | 3307 | Host port for MySQL |
| `JWT_SECRET` | base64 demo key (change in prod!) | HS256 key ≥32 bytes |
| `JWT_VALIDITY` | 3600000 | 1 hour ms |
| `CORS_ALLOWED_ORIGINS` | http://localhost:5173,http://localhost,... | Comma-separated |
| `BACKEND_PORT_HOST` | 8080 | Host port for backend |
| `FRONTEND_PORT_HOST` | 80 | Host port for frontend |
| `VITE_API_BASE_URL` | "" (empty → relative) | Set to `http://localhost:8080` for dev `npm run dev` |

---

## 4. Local Development (without Docker)

**Backend:**

```bash
cd backend
# Use local MySQL
# application.yaml defaults to localhost:3306/healthcareservice, user root/dummy
# or set env DB_HOST, DB_USER, etc.
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
# Or build jar
./mvnw clean package -DskipTests
java -jar target/HealthcareService-0.0.1-SNAPSHOT.jar
```

**Frontend:**

```bash
# At repo root
npm ci
# For local dev, point to backend
echo 'VITE_API_BASE_URL=http://localhost:8080' > .env.local
npm run dev   # http://localhost:5173 (proxied via vite.config.js)
npm run build && npm run preview # http://localhost:4173
```

---

## 5. Production Notes

- **Nginx**: `nginx.conf` handles SPA fallback (`try_files $uri /index.html`) and proxies `/api`, `/patient`, `/doctor`, `/admin`, `/appointments`, `/actuator` to `http://backend:8080`. Add TLS termination (e.g., via Traefik, AWS ALB, or certbot) in front.
- **JWT**: Generate a 64-byte base64 secret: `openssl rand -base64 64`. Rotate via env without rebuilding.
- **DB**: `backend/init.sql` creates DB if missing. For prod, set `JPA_DDL_AUTO=validate` and manage schema via Flyway.
- **CORS**: Set `CORS_ALLOWED_ORIGINS` to your exact frontend origin(s), e.g., `https://yourdomain.com`. `allowedOriginPatterns` supports wildcards but `allowCredentials=true` forbids `*`.
- **Healthchecks**: Compose waits for `db` healthy → `backend` healthy → `frontend`. Kubernetes readiness probes should hit `/actuator/health` and `/health`.
- **Resources**: `JAVA_OPTS="-Xms256m -Xmx512m -XX:MaxRAMPercentage=75.0"` set in backend Dockerfile for containers.

---

## 6. Vercel + Render / Separate Hosts

If you deploy frontend (Vercel) and backend (Render/Railway) separately:

- Set frontend `VITE_API_BASE_URL=https://your-backend.onrender.com`
- Build: `VITE_API_BASE_URL=https://... npm run build`
- Set backend `CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app` (exact origin!)

For Docker single-host, keep `VITE_API_BASE_URL=""` (relative) so Nginx proxy works.

---

## 7. Troubleshooting

- **Frontend shows `Failed to load doctors`** → Backend `/patient/allDoctors` now allows any authenticated role; ensure you are logged in and token not expired (auto-redirect to /login on 401).
- **Backend 403 on appointment booking** → Ensure user has `ROLE_PATIENT`; check JWT `role` claim decoded in `AuthContext` (`user.role`).
- **MySQL `Access denied`** → Check `DB_USER`/`DB_PASSWORD` match between `db` and `backend` env; wipe volume `docker volume rm healthcareServices-frontend_db_data` and `up --build`.
- **CORS blocked** → Add your preview host to `CORS_ALLOWED_ORIGINS` env and recreate backend container.
- **Maven offline fail** → Host has no internet to `repo.maven.apache.org`; pre-build image on machine with internet and push to registry.

---

## 8. CI

Optional GitHub Action (`.github/workflows/deploy.yml`) could:

```yaml
- run: npm ci && npm run build
- run: docker compose build
- run: docker compose push # to GHCR
```

---

## 9. Ports & Preview Host (Arena/E2B)

Vite `server.host=0.0.0.0` and `preview.host=0.0.0.0` ensures the E2B preview proxy (`https://{port}-{sandbox}.e2b.app`) works. Backend CORS must allow `https://*.e2b.app` if testing via preview.

Add to `CORS_ALLOWED_ORIGINS`: `https://3000-xxx.e2b.app,https://5173-xxx.e2b.app` or use `*` pattern via `allowedOriginPatterns`.

