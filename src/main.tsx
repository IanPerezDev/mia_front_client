import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Switch, Route } from "wouter";
import App from "./App.tsx";
import "./index.css";
import { Dashboard } from "./pages/Dashboard.tsx";
import { BillingPage } from "./pages/BillingPage.tsx";
import { Reserva } from "./pages/Reserva.tsx";
import { UserProvider } from "./context/authContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <UserProvider>
      <Switch>
        <Route path={"/factura/:id"}>
          <BillingPage onBack={() => {}} invoiceData={undefined} />
        </Route>
        <Route path={"/dashboard"}>
          <Dashboard />
        </Route>
        <Route path={"/reserva/:id"}>
          <Reserva />
        </Route>
        <Route component={App} path={"*"} />
      </Switch>
    </UserProvider>
  </StrictMode>
);
