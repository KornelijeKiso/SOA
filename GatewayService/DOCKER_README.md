# Run the system with Docker Compose

Run these commands from GatewayService. Docker's Linux engine must be running.
The sibling directories Stakeholders, Blogs, TourService, and frontend must
contain their Dockerfiles. The frontend Dockerfile must consume the
VITE_API_BASE_URL build argument and serve the built app on port 80.

## Setup

Copy the template once (PowerShell):

```powershell
Copy-Item .env.example .env
```

Edit .env with reachable external MongoDB connection strings and admin
credentials. Replace JWT_SECRET with a securely generated value of at least
32 UTF-8 bytes; Compose supplies the same value to Stakeholders and Gateway.
Do not commit .env. No MongoDB containers are included. Container localhost
does not refer to the host machine.

## Validate, start, stop

```powershell
docker compose --env-file .env config --quiet
docker compose --env-file .env up -d --build
docker compose --env-file .env down
```

Frontend: http://localhost:5173
Gateway API: http://localhost:8080/api
Gateway health: http://localhost:8080/actuator/health

Frontend, gateway, and Grafana ports are published. All services share the
soa-network bridge network and restart unless stopped.
depends_on controls startup order, not backend readiness.

## Logs in Grafana

Grafana: http://localhost:3000 (use Grafana's initial login and change the
password when prompted). Loki is provisioned as the default data source.
Open Explore, select Loki, and run:

```logql
{service=~"stakeholders|blogs|tours|gateway|frontend"}
```

Use `{service="tours"}` to view one app. Set the time range to the last 15
minutes. Alloy reads the five app containers' stdout/stderr through the Docker
socket. Loki and Alloy have no published ports. Grafana and Loki use named
volumes; `docker compose down -v` deletes their stored data.

To validate the template without real credentials or image builds:

```powershell
docker compose --env-file .env.example config
```
