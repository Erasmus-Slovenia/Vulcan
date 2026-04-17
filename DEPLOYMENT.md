# Vulcan — Server Deployment Guide

This guide covers deploying Vulcan on a Linux VPS (Ubuntu 24.04 recommended).

## Requirements

- Linux VPS with root access (Ubuntu 24.04 recommended)
- Minimum 1 vCPU, 1GB RAM (2GB recommended)
- A domain name pointed to your server's IP (optional but recommended)

---

## 1. Connect to your server

```bash
ssh root@your-server-ip
```

---

## 2. Install Docker

```bash
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker
```

Verify it works:
```bash
docker --version
```

---

## 3. Install Git

```bash
apt update && apt install -y git make
```

---

## 4. Clone the repository

```bash
git clone https://github.com/Erasmus-Slovenia/Vulcan.git
cd Vulcan
```

---

## 5. Configure environment

The `.env` file is auto-created from `.env.example` when you run `make up`, but for production you should set real passwords before starting:

```bash
cp .env.example .env
nano .env
```

Change these to strong passwords:
```
MYSQL_PASSWORD=your_strong_password
MYSQL_ROOT_PASSWORD=your_strong_root_password
BACKEND_PORT=8000
FRONTEND_PORT=5173
```

---

## 6. Start the application

```bash
make up
```

This will:
- Build all Docker containers
- Wait for the database to be ready
- Generate the Laravel app key
- Run all migrations and seed the database

---

## 7. Verify it is running

```bash
docker ps
```

You should see 4 containers running:
- `vulcan-db` — MySQL database
- `vulcan-backend` — Laravel API
- `vulcan-frontend` — React frontend
- `vulcan-phpmyadmin` — phpMyAdmin

Test the API:
```bash
curl http://localhost:8000/api/health
```

---

## 8. Open firewall ports

```bash
ufw allow 8000   # Backend API
ufw allow 5173   # Frontend
ufw allow 8080   # phpMyAdmin (optional, disable in production)
ufw enable
```

---

## 9. Access the application

| Service    | URL                              |
|------------|----------------------------------|
| Frontend   | http://your-server-ip:5173       |
| Backend    | http://your-server-ip:8000       |
| phpMyAdmin | http://your-server-ip:8080       |

Default admin credentials:
- **Email:** admin@vulcan.com
- **Password:** password

> Change the admin password immediately after first login.

---

## 10. Set up a domain with HTTPS (recommended)

Install Caddy as a reverse proxy — it handles HTTPS automatically:

```bash
apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update && apt install caddy
```

Create a Caddyfile:
```bash
nano /etc/caddy/Caddyfile
```

```
yourdomain.com {
    reverse_proxy localhost:5173
}

api.yourdomain.com {
    reverse_proxy localhost:8000
}
```

Then update your frontend `.env` to use the real API domain before running `make up`:
```
VITE_API_URL=https://api.yourdomain.com
```

Restart Caddy:
```bash
systemctl restart caddy
```

Caddy will automatically obtain and renew SSL certificates.

---

## Updating the application

```bash
git pull
make up
```

---

## Useful commands

| Command         | Description                        |
|-----------------|------------------------------------|
| `make up`       | Start / rebuild the stack          |
| `make down`     | Stop everything                    |
| `make logs`     | Follow live logs                   |
| `make migrate`  | Run pending migrations             |
| `make reset`    | Fresh database + seed              |
| `make shell`    | Open shell inside backend container|

---

## Stopping the application

```bash
make down
```

To also delete the database volume (all data lost):
```bash
docker compose down -v
```
