import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfirmProvider } from "./hooks/useConfirm";
import { GlobalLoader } from "./components/GlobalLoader";
import { AlertContainer } from "./components/AlertContainer";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { ModalManager } from "./components/layout/ModalManager";

// Pages
import { Overview } from "./pages/Overview";
import { ProductsPage } from "./pages/ProductsPage";
import { ProcessDefinitionsPage } from "./pages/manufacturing/ProcessDefinitionsPage";
import { ProcessDetailsPage } from "./pages/manufacturing/ProcessDetailsPage";
import { ActiveExecutionsPage } from "./pages/manufacturing/ActiveExecutionsPage";
import { ProductDetailsPage } from "./pages/ProductDetailsPage";
import { JobExecutionDetailsPage } from "./pages/manufacturing/JobExecutionDetailsPage";
import { BrokersPage } from "./pages/vendor/BrokersPage";
import { BrokerDetailPage } from "./pages/vendor/BrokerDetailPage";
import { VendorFinancePage } from "./pages/vendor/VendorFinancePage";
import { LedgerPage } from "./pages/inventory/LedgerPage";

function App() {
  return (
    <BrowserRouter>
      <ConfirmProvider>
        <GlobalLoader />
        <AlertContainer />
        <ModalManager />

        <Routes>
          <Route
            path="/"
            element={
              <DashboardLayout>
                <Overview />
              </DashboardLayout>
            }
          />

          <Route
            path="/inventory/products"
            element={
              <DashboardLayout>
                <ProductsPage tab="products" />
              </DashboardLayout>
            }
          />

          <Route
            path="/inventory/raw"
            element={
              <DashboardLayout>
                <ProductsPage tab="raw" />
              </DashboardLayout>
            }
          />

          <Route
            path="/inventory/scrap"
            element={
              <DashboardLayout>
                <ProductsPage tab="scrap" />
              </DashboardLayout>
            }
          />

          <Route
            path="/inventory/products/:id"
            element={
              <DashboardLayout>
                <ProductDetailsPage />
              </DashboardLayout>
            }
          />

          <Route
            path="/inventory/ledger"
            element={
              <DashboardLayout>
                <LedgerPage />
              </DashboardLayout>
            }
          />

          {/* Manufacturing Routes */}
          <Route
            path="/manufacturing"
            element={
              <DashboardLayout>
                <ActiveExecutionsPage />
              </DashboardLayout>
            }
          />

          <Route
            path="/manufacturing/definitions"
            element={
              <DashboardLayout>
                <ProcessDefinitionsPage />
              </DashboardLayout>
            }
          />

          <Route
            path="/manufacturing/definitions/:id"
            element={
              <DashboardLayout>
                <ProcessDetailsPage />
              </DashboardLayout>
            }
          />

          <Route
            path="/manufacturing/executions/:id"
            element={
              <DashboardLayout>
                <JobExecutionDetailsPage />
              </DashboardLayout>
            }
          />

          <Route
            path="/vendor/brokers"
            element={
              <DashboardLayout>
                <BrokersPage />
              </DashboardLayout>
            }
          />

          <Route
            path="/vendor/brokers/:id"
            element={
              <DashboardLayout>
                <BrokerDetailPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/vendor/brokers/:id/finance"
            element={
              <DashboardLayout>
                <VendorFinancePage />
              </DashboardLayout>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ConfirmProvider>
    </BrowserRouter>
  );
}

export default App;
