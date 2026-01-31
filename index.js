const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const dotenv = require("dotenv");

dotenv.config({ path: "./.env" });

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//configuracion de flow 
const config = {
  apiKey: process.env.FLOW_API_KEY, // Clave publica de flow
  secretKey: process.env.FLOW_SECRET_KEY, // Clave secreta de flow
  baseUrl: process.env.FLOW_BASE_URL, // URI de flow
  appUrl: process.env.APP_URL || "http://localhost:3000" // URI de la aplicacion
};

//configuracion de pagos
const pagoStatus = {
  1: "Pendiente",
  2: "Aprobado",
  3: "Rechazado",
  4: "Cancelado",
  5: "Expirado"
};

//funcion para firmar los parametros 
function signParams(params, secretKey) {
  const sortedKeys = Object.keys(params).sort();
  let toSign = "";
  sortedKeys.forEach((key) => {
    toSign += key + params[key];
  });
  return crypto.createHmac("sha256", secretKey).update(toSign).digest("hex");
}

/* ===============================
   CREAR PAGO
================================= */
app.post("/api/flow/crear-pago", async (req, res) => {
  try {
    const { amount, email } = req.body;

    console.log(amount, email);
     
    const params = {
      apiKey: config.apiKey,
      commerceOrder: crypto.randomUUID(),
      subject: "Pago de prueba Flow",
      currency: "CLP",
      amount: amount || 10000,
      email: email || "cliente@test.cl",
      urlConfirmation: `${config.appUrl}/api/flow/confirmacion`,
      urlReturn: `${config.appUrl}/pago-finalizado`
    };

    params.s = signParams(params, config.secretKey); 

    const response = await axios.post(
      `${config.baseUrl}/payment/create`,
      new URLSearchParams(params).toString()
    );

    console.log("checkout url", `${response.data.url}?token=${response.data.token}`);

    res.json({
      redirectUrl: response.data.url + "?token=" + response.data.token,
      order: params.commerceOrder
    });

  } catch (error) {
    console.log(error);
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Error al crear el pago" });
  }
});

/* ===============================
   CONFIRMACIÓN DE FLOW (WEBHOOK)
================================= */
app.post("/api/flow/confirmacion", async (req, res) => {
  try {
    const { token } = req.body;

    const params = {
      apiKey: process.env.FLOW_API_KEY,
      token
    };

    params.s = signParams(params, process.env.FLOW_SECRET_KEY);

    const response = await axios.get(
      `${process.env.FLOW_BASE_URL}/payment/getStatus`,
      { params }
    );

    const pago = response.data;
 
    console.log("Estado del pago:", pago);

     
    const status = pagoStatus[pago.status]

    console.log("Estado del pago:", status);

    if (status === "Aprobado") {
      console.log("✅ Pago aprobado:", pago.commerceOrder);
      // 👉 Aquí actualizas tu BD
    }

    res.send("OK");
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).send("ERROR");
  }
});

/* ===============================
   PÁGINA DE RETORNO (FRONT)
================================= */
app.post("/pago-finalizado", (req, res) => {
  res.send(`
    <h1>Pago finalizado</h1>
    <p>Gracias por tu compra.</p>
    <p>El estado final se valida por webhook.</p>
  `);
});

/* ===============================
   SERVER
================================= */
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`❌ El puerto ${PORT} ya está en uso. Intenta cerrando otros procesos o cambia el puerto en el archivo .env`);
  } else {
    console.error("❌ Error al iniciar el servidor:", error);
  }
});
