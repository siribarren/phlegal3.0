import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { router } from "./src/routes.js";

const PORT = process.env.BFF_PORT || 4001;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5176";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));

app.use("/bff", router);

app.get("/bff/health", (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`BFF Procurador escuchando en http://localhost:${PORT}`);
});
