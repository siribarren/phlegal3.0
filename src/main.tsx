
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import SampleGestionMasivaWorkflow from "./app/samples/GestionMasivaWorkflow.tsx";
  import SampleFlujoCobranza from "./app/samples/FlujoCobranzaDemo.tsx";
  import "./styles/index.css";

  const sampleParam = new URLSearchParams(window.location.search).get("sample");

  function renderSample() {
    if (sampleParam === "flujo") return <SampleFlujoCobranza />;
    if (sampleParam !== null) return <SampleGestionMasivaWorkflow />;
    return <App />;
  }

  createRoot(document.getElementById("root")!).render(renderSample());
  