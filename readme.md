# Outfit Recommendation App

Mobile-first prototype for managing a digital wardrobe, processing garment images and generating outfit recommendations. The application is composed of three runtime parts:

- **Ionic + Angular frontend**: mobile/web UI used to capture garments, browse the wardrobe, request recommendations and save outfits.
- **Spring Boot backend**: REST API used by the frontend. It stores garments/outfits, receives uploaded images and coordinates the processing pipeline.
- **FastAPI cutout service**: local Python service used by the backend to remove the image background and return a cropped PNG garment cutout.

The frontend must call the backend through the value configured in `src/environments/environment.ts` or `src/environments/environment.prod.ts`. When the app is executed on a physical mobile device, `localhost` does **not** point to the development machine. In that case, expose the backend with a Cloudflare Tunnel and use the generated HTTPS URL as `apiBaseUrl`.

---

## 1. Repository structure

Recommended project layout:

```text
.
|-- frontend/              # Ionic / Angular application
|-- backend/               # Spring Boot REST API
`-- cutout-service/        # FastAPI + rembg background removal service
```

The important frontend environment files are:

```text
frontend/src/environments/environment.ts
frontend/src/environments/environment.prod.ts
```

The important cutout-service files are:

```text
cutout-service/main.py
cutout-service/requirements.txt
```

---

## 2. Required tools

Install the following tools before running the project:

- Node.js and npm.
- Ionic CLI.
- Java and Maven/Gradle, depending on the backend configuration.
- Python 3.10 or higher.
- Docker, if the backend database is launched through Docker.
- `cloudflared`, only when testing the app from a physical mobile device through a public HTTPS tunnel.
- Xcode or Android Studio, only when running the app as a native Capacitor application.

Useful global installation for Ionic:

```bash
npm install -g @ionic/cli
```

---

## 3. Runtime ports used in this README

The following ports are used as examples:

| Service | Default URL |
|---|---|
| Frontend | `http://localhost:8100` |
| Backend | `http://localhost:8080` |
| Cutout service | `http://localhost:8001` |

If your backend or cutout service uses another port, keep the configuration values synchronized.

---

## 4. Start the cutout service

The cutout service must be running before testing garment image uploads. It exposes:

- `GET /health`: health check endpoint.
- `POST /cutout`: receives an image file and returns a cropped PNG with transparent background.

From the `cutout-service` folder:

```bash
cd cutout-service
```

Create and activate a virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

On Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

Start the service:

```bash
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

Check that it is running:

```bash
curl http://localhost:8001/health
```

Expected response:

```json
{"status":"ok"}
```

Optional manual test with an image:

```bash
curl -X POST "http://localhost:8001/cutout?pad=8" \
  -F "image=@sample.jpg" \
  --output cutout.png
```

The generated `cutout.png` should contain the garment cropped with transparency.

> The first execution of `rembg` may take longer because the model can be downloaded or initialized during the first request.

---

## 5. Start the backend

Open a new terminal and go to the backend folder:

```bash
cd backend
```

If the backend uses Maven Wrapper:

```bash
./mvnw spring-boot:run
```

On Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

If Maven is installed globally:

```bash
mvn spring-boot:run
```

The backend should be available at:

```text
http://localhost:8080
```

Basic check:

```bash
curl http://localhost:8080/api/items
```

### Backend connection to the cutout service

The backend must know where the cutout service is running. Configure it with the property name used in your Spring Boot project. For example:

```properties
server.port=8080
app.cutout.base-url=http://localhost:8001
```

If your backend uses a different property name, the important point is that it must point to the same URL used to start FastAPI:

```text
http://localhost:8001
```

The frontend does not call the cutout service directly. The expected flow is:

```text
Mobile/Web app -> Spring Boot backend -> FastAPI cutout service -> Spring Boot backend -> Mobile/Web app
```

---

## 6. Configure frontend environments

The frontend uses `environment.apiBaseUrl` as the base URL for the backend API.

For local browser development on the same machine, use:

```ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080'
};
```

For production builds, update `environment.prod.ts` as well:

```ts
export const environment = {
  production: true,
  apiBaseUrl: 'http://localhost:8080'
};
```

When using a physical mobile device, do **not** use `http://localhost:8080` in the mobile app. On a phone, `localhost` refers to the phone itself, not to the computer where the backend is running.

Use a Cloudflare Tunnel instead, as explained in section 8.

---

## 7. Start the frontend

Open a new terminal and go to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run the Ionic development server:

```bash
ionic serve
```

The app should open at:

```text
http://localhost:8100
```

At this point, for local browser development, the complete development stack should be:

```text
Frontend:       http://localhost:8100
Backend:        http://localhost:8080
Cutout service: http://localhost:8001
```

---

## 8. Run the app on a physical mobile device

When running the app on a real iOS or Android device, the device must be able to reach the backend. The simplest approach is to expose the local backend using a temporary Cloudflare Tunnel.

### 8.1 Start the backend locally

Make sure the backend is already running on the development machine:

```text
http://localhost:8080
```

### 8.2 Start a Cloudflare Tunnel for the backend

Open a new terminal and run:

```bash
cloudflared tunnel --url http://localhost:8080
```

Cloudflare will print a public HTTPS URL similar to:

```text
https://example-random-name.trycloudflare.com
```

Keep this terminal open. The tunnel only works while this process is running.

### 8.3 Update the frontend environment

Replace `apiBaseUrl` with the generated Cloudflare URL:

```ts
export const environment = {
  production: false,
  apiBaseUrl: 'https://example-random-name.trycloudflare.com'
};
```

For production/native builds, also update `environment.prod.ts`:

```ts
export const environment = {
  production: true,
  apiBaseUrl: 'https://example-random-name.trycloudflare.com'
};
```

Important: a quick Cloudflare Tunnel URL usually changes every time the tunnel is restarted. If the URL changes, update the environment file and rebuild/sync the mobile app again.

### 8.4 Run on iOS

```bash
ionic build
ionic cap sync ios
ionic cap open ios
```

Then run the app from Xcode on the selected device.

For live reload during development:

```bash
ionic cap run ios -l --external
```

### 8.5 Run on Android

```bash
ionic build
ionic cap sync android
ionic cap open android
```

Then run the app from Android Studio on the selected device.

For live reload during development:

```bash
ionic cap run android -l --external
```

---

## 9. CORS configuration

The backend must allow requests from the origins used by the frontend. In development, the most common origins are:

```text
http://localhost:8100
http://localhost:4200
capacitor://localhost
ionic://localhost
https://*.trycloudflare.com
```

A development-oriented Spring Boot CORS configuration may use `allowedOriginPatterns` instead of fixed origins, especially because Cloudflare quick tunnel URLs are generated dynamically.

Example pattern list:

```text
http://localhost:*
http://127.0.0.1:*
capacitor://localhost
ionic://localhost
https://*.trycloudflare.com
```

For a final deployment, restrict the allowed origins to the exact domains used by the application.

---

## 10. Recommended startup order

Use four terminals during development:

### Terminal 1 - Cutout service

```bash
cd cutout-service
source .venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

### Terminal 2 - Backend

```bash
cd backend
./mvnw spring-boot:run
```

### Terminal 3 - Cloudflare Tunnel, only for physical mobile devices

```bash
cloudflared tunnel --url http://localhost:8080
```

### Terminal 4 - Frontend

```bash
cd frontend
ionic serve
```

For native execution, replace `ionic serve` with the corresponding Capacitor commands.

---

## 11. Troubleshooting

### The frontend shows HTTP status `0`

This usually means that the request did not reach the backend correctly. Check:

- The backend is running.
- `environment.apiBaseUrl` points to the correct backend or Cloudflare URL.
- The Cloudflare Tunnel terminal is still open.
- The backend CORS configuration allows the current frontend origin.
- The mobile device has internet connection.

### Image upload fails

Check:

- The cutout service is running at `http://localhost:8001` or at the URL configured in the backend.
- The backend property for the cutout service matches the FastAPI port.
- The uploaded file is a valid image.
- The first `rembg` request has completed successfully.

### The app works in the browser but not on the phone

Check:

- The mobile app is not using `http://localhost:8080` as `apiBaseUrl`.
- The mobile app is using the current Cloudflare Tunnel URL.
- The environment file was updated before running `ionic build` and `ionic cap sync`.
- The backend CORS configuration accepts `capacitor://localhost` or `ionic://localhost`.

### Images are not displayed

The frontend builds full image URLs using `environment.apiBaseUrl` when the backend returns relative image paths. If images do not load, verify that:

- The backend returns valid image paths.
- The configured `apiBaseUrl` is reachable from the device.
- The backend exposes static uploaded files correctly.

---

## 12. Version control notes

Do not commit generated or local runtime folders such as:

```text
cutout-service/.venv/
cutout-service/__pycache__/
node_modules/
dist/
www/
```

Recommended `.gitignore` entries:

```gitignore
node_modules/
dist/
www/
.angular/

cutout-service/.venv/
cutout-service/__pycache__/
*.pyc

.DS_Store
```

---

## 13. Minimal execution checklist

Before testing the full flow, verify the following:

- [ ] `GET http://localhost:8001/health` returns `{ "status": "ok" }`.
- [ ] The backend starts without errors.
- [ ] `GET http://localhost:8080/api/items` returns a valid response.
- [ ] `environment.apiBaseUrl` points to the backend URL used by the device.
- [ ] If using a phone, the Cloudflare Tunnel is running.
- [ ] The backend CORS configuration allows the frontend origin.
- [ ] Camera/photo permissions are granted on the mobile device.
