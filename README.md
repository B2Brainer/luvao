# luvao
Plataforma web que permite a los usuarios consultar, buscar y comparar productos de distintos supermercados en una sola aplicación. El objetivo es ofrecer una experiencia centralizada, donde las personas puedan encontrar precios actualizados, disponibilidad y tiendas de origen sin tener que revisar cada supermercado por separado.

## Despliegue rapido

La salida mas rapida hoy es desplegar el frontend en Vercel y exponer temporalmente el backend local mediante el `orchestrator`.

### Frontend en Vercel

Configura el proyecto con raiz `Front`, comando de build `npm run build` y output `dist`.

Debes definir la variable de entorno:

```bash
VITE_API_BASE_URL=https://tu-backend-publico/api
```

Si no defines esa variable, el frontend usara:

- `http://localhost:3006/api` cuando corra en localhost
- `${window.location.origin}/api` cuando corra en un dominio publicado detras de un proxy

### Backend temporal para demo

Levanta el backend localmente desde `Back/` y expone el puerto `3006` del `orchestrator` con un tunel HTTPS.

Ejemplo con Cloudflare Tunnel o ngrok:

```bash
docker compose -f docker-compose.dev.yml up --build
```

El `orchestrator` publica la API bajo el prefijo `/api`, por ejemplo:

```text
https://tu-backend-publico/api/docs
https://tu-backend-publico/api/orchestrator/dashboard
```

### CORS del Orchestrator

El `orchestrator` ahora acepta por defecto origenes locales (`localhost` y `127.0.0.1`) y puede aceptar dominios publicos mediante la variable:

```bash
ALLOWED_ORIGINS=https://tu-app.vercel.app,https://tu-dominio.com
```

Tambien soporta comodines simples, por ejemplo:

```bash
ALLOWED_ORIGINS=https://*.vercel.app
```

Esto es util para pruebas previas, aunque para produccion conviene usar dominios explicitos.
