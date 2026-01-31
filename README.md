# Integración Flow API con Node.js

Este proyecto es una implementación de referencia para integrar la pasarela de pagos [Flow](https://www.flow.cl) utilizando Node.js y Express. Permite crear pagos, recibir confirmaciones mediante webhooks y manejar el retorno del cliente tras la transacción.

## 🚀 Características

- **Creación de Pagos:** Genera una orden en Flow y redirige al checkout.
- **Webhook de Confirmación:** Endpoint para recibir notificaciones automáticas del estado del pago.
- **Seguridad:** Implementación de firma HMAC-SHA256 para validar peticiones.
- **Dinámico:** Configuración flexible mediante variables de entorno.

## 🛠️ Tecnologías

- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [Axios](https://axios-http.com/) (para peticiones a la API de Flow)
- [Dotenv](https://www.npmjs.com/package/dotenv) (gestión de variables de entorno)

## 📋 Requisitos Previos

- Node.js instalado (v14 o superior recomendado).
- Cuenta en [Flow](https://www.flow.cl) (puede ser en ambiente Sandbox).
- Tus credenciales de Flow (`API Key` y `Secret Key`).

## ⚙️ Configuración

1.  Clona o descarga el proyecto.
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Crea un archivo `.env` en la raíz del proyecto (puedes basarte en el ejemplo proporcionado) con las siguientes variables:

    ```env
    PORT=3000
    APP_URL=http://localhost:3002

    FLOW_API_KEY=tu_api_key_aqui
    FLOW_SECRET_KEY=tu_secret_key_aqui
    FLOW_BASE_URL=https://sandbox.flow.cl/api
    ```

## 🚀 Uso

### Iniciar el servidor

```bash
npm start
# o si usas nodemon
npm run dev
```

El servidor correrá por defecto en `http://localhost:3000`.

### Endpoints Principales

#### 1. Crear un Pago (`POST /api/flow/crear-pago`)

Crea una transacción en Flow.

- **Cuerpo (JSON):**
  ```json
  {
    "amount": 10000,
    "email": "cliente@test.cl"
  }
  ```
- **Respuesta:** Devuelve una `redirectUrl` para enviar al usuario al portal de pago.

#### 2. Confirmación (Webhook) (`POST /api/flow/confirmacion`)

Este endpoint es llamado automáticamente por Flow cuando el estado del pago cambia.

- Valida el token recibido.
- Consulta el estado actual del pago.
- Permite ejecutar lógica de negocio (ej: actualizar base de datos).

#### 3. Página de Retorno (`POST /pago-finalizado`)

Es la URL donde Flow redirige al usuario una vez finalizado el proceso de pago (independientemente del resultado).

## 💡 Notas Importantes

### Webhooks en Local

Para recibir las notificaciones de Flow (`urlConfirmation`) mientras desarrollas en tu máquina local, necesitas exponer tu servidor local a internet. Puedes usar herramientas como:

- [ngrok](https://ngrok.com/)
- [localtunnel](https://localtunnel.github.io/www/)

Una vez que obtengas la URL pública (ej: `https://tu-tunel.ngrok.io`), actualiza la variable `APP_URL` en tu archivo `.env`.

---

Desarrollado con ❤️ para facilitar integraciones de pagos.
