// Function serverless de Vercel: reutiliza el mismo router Express del BFF
// (server/src/routes.js) que en local corre parado como proceso propio
// (server/index.js, vía run.sh). vercel.json reescribe /bff/* -> /api/bff/*
// para que el frontend (src/lib/api.ts) no necesite saber cuál de los dos
// entornos lo está sirviendo.

import express from "express";
import cookieParser from "cookie-parser";
import { router } from "../../server/src/routes.js";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/bff", router);

export default app;
