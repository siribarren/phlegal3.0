// Function serverless de Vercel: reutiliza el mismo router Express del BFF
// (server/src/routes.js) que en local corre parado como proceso propio
// (server/index.js, vía run.sh). vercel.json reescribe /bff/* -> /api (esta
// misma función siempre, sin path-based routing de Vercel) para que el
// frontend (src/lib/api.ts) no necesite saber cuál de los dos entornos lo
// está sirviendo.
//
// No se usa un catch-all por nombre de archivo (api/bff/[...path].js) porque
// Vercel solo lo invocaba para requests de un único segmento de path — con
// dos o más (ej. /bff/causas/123) la request nunca llegaba a la función
// (404 de la plataforma, ni siquiera de Express). Una función fija, con
// Express resolviendo el sub-path vía req.url, evita ese problema.

import express from "express";
import cookieParser from "cookie-parser";
import { router } from "../server/src/routes.js";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/bff", router);

export default app;
