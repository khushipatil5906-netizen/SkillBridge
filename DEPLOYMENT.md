# SkillBridge Production Deployment & Infrastructure Guide

This document details the production deployment architecture, security configuration, environment isolation, and SSL certificate management for **SkillBridge**.

---

## 1. System Architecture Overview

```
                      +-----------------------------+
                      |   Cloudflare / Reverse Proxy |
                      |    (HTTPS / TLS Termination)|
                      +--------------+--------------+
                                     |
                                     v
                       +---------------------------+
                       |    Nginx (Port 80/443)    |
                       |  Security Headers & Gzip  |
                       +-------------+-------------+
                                     |
               +---------------------+---------------------+
               |                                           |
               v                                           v
+-----------------------------+             +-----------------------------+
| Client SPA (Static Assets)  |             | FastAPI Backend (Port 8000) |
| React 18 + Vite (Dist)      |             | Python 3.11 + Uvicorn       |
+-----------------------------+             +--------------+--------------+
                                                           |
                                            +--------------+--------------+
                                            |   Database Storage Layer    |
                                            |   PostgreSQL / SQLite       |
                                            +-----------------------------+
```

---

## 2. Environment Variables & Secret Isolation

All application configuration must be supplied via environment files. **Never commit `.env` or production credentials to source control.**

### Frontend (Client-Scoped):
Only variables prefixed with `VITE_` are bundled into client assets:
```env
VITE_PUBLIC_SITE_URL=https://skillbridge.edu.in
VITE_CONTACT_EMAIL=support@skillbridge.edu.in
VITE_API_BASE_URL=https://skillbridge.edu.in/api
VITE_ANALYTICS_ID=                      # Optional, loaded strictly post-consent
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=skillbridge-6b9dc.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=skillbridge-6b9dc
```

### Backend (Server-Scoped Secrets):
```env
PUBLIC_SITE_URL=https://skillbridge.edu.in
HOST=0.0.0.0
PORT=8000
DATABASE_URL=postgresql://skillbridge_user:your_secure_password@localhost:5432/skillbridge_db
JWT_SECRET=your_high_entropy_jwt_secret_minimum_32_chars
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
CORS_ORIGINS=["https://skillbridge.edu.in"]
```

---

## 3. HTTPS / TLS Configuration (Part 16 & 37)

SkillBridge is designed to operate behind TLS termination. To configure SSL with Let's Encrypt (Certbot):

1. **Obtain Certificate:**
   ```bash
   sudo certbot certonly --standalone -d skillbridge.edu.in -d www.skillbridge.edu.in
   ```

2. **Nginx SSL Server Block:**
   ```nginx
   server {
       listen 443 ssl http2;
       server_name skillbridge.edu.in;

       ssl_certificate /etc/letsencrypt/live/skillbridge.edu.in/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/skillbridge.edu.in/privkey.pem;
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_ciphers HIGH:!aNULL:!MD5;
       ssl_prefer_server_ciphers on;

       # HSTS (Strict-Transport-Security)
       add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
       add_header X-Frame-Options "SAMEORIGIN" always;
       add_header X-Content-Type-Options "nosniff" always;
       add_header Referrer-Policy "strict-origin-when-cross-origin" always;
       add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

       location / {
           root /usr/share/nginx/html;
           try_files $uri $uri/ /index.html;
       }

       location /api/ {
           proxy_pass http://127.0.0.1:8000/api/;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto https;
       }
   }

   # Automatic HTTP to HTTPS Redirect
   server {
       listen 80;
       server_name skillbridge.edu.in www.skillbridge.edu.in;
       return 301 https://$host$request_uri;
   }
   ```

---

## 4. Docker Deployment Instructions

SkillBridge includes production container definitions in `Dockerfile` and `docker-compose.yml`.

### Build & Run Containerized Stack:
```bash
# Build production images
docker compose build --no-cache

# Run in detached daemon mode
docker compose up -d

# Verify container health
docker compose ps
```

Services exposed:
- Frontend Client: `http://localhost:5173` (or port 80 behind reverse proxy)
- FastAPI Server: `http://localhost:8000`

---

## 5. Cookie Consent & Analytics Compliance

- **No Unauthorized Tracking:** All analytics tracking hooks are disabled by default.
- **Consent Gate:** Web analytics scripts only initialize when the user selects `[Accept All]` or enables optional cookies in `[Manage Preferences]`.
- **Zero Sensitive Data:** Passwords, test answer tokens, student contact details, and resume files are strictly excluded from all telemetry payloads.
