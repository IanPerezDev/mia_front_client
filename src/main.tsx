import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Switch, Route, Router } from "wouter";
import App from "./App.tsx";
import "./index.css";
import { Dashboard } from "./pages/Dashboard.tsx";
import { BillingPage } from "./pages/BillingPage.tsx";
import { Reserva } from "./pages/Reserva.tsx";
import { ResetPassword } from "./pages/ResetPassword.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Switch>
      <Route path={"/factura"}>
        <BillingPage onBack={() => { }} invoiceData={undefined} />
      </Route>
      <Route path={"/reset-password"}>
        <ResetPassword />
      </Route>
      <Route path={"/dashboard"}>
        <Dashboard />
      </Route>
      <Route path={"/reserva/:id"}>
        <Reserva />
      </Route>
      <Route component={App} path={"*"} />
    </Switch>
  </StrictMode>
);
