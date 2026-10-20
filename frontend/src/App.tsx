import type { ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "@/context/AuthContext";

import { ProtectedRoute } from "@/components/ProtectedRoute";

import { DashboardLayout } from "@/components/layout/DashboardLayout";

import { LoginPage } from "@/pages/LoginPage";

import { DashboardPage } from "@/pages/DashboardPage";

import { CustomersPage } from "@/pages/CustomersPage";
import { CustomerCreatePage } from "@/pages/CustomerCreatePage";
import { CustomerEditPage } from "@/pages/CustomerEditPage";

import { DriversPage } from "@/pages/DriversPage";
import { DriverFormPage } from "@/pages/DriverFormPage";

import { VehiclesPage } from "@/pages/VehiclesPage";
import { VehicleFormPage } from "@/pages/VehicleFormPage";

import { ShipmentsPage } from "@/pages/ShipmentsPage";
import { ShipmentFormPage } from "@/pages/ShipmentFormPage";

import { InvoicesPage } from "@/pages/InvoicesPage";
import { InvoiceFormPage } from "@/pages/InvoiceFormPage";
import { InvoicePrintPage } from "@/pages/InvoicePrintPage";

// Halaman yang butuh login dan memakai layout dashboard.
function Protected({ children }: { children: ReactNode }) {
    return (
        <ProtectedRoute>
            <DashboardLayout>
                {children}
            </DashboardLayout>
        </ProtectedRoute>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>

                <Routes>

                    <Route path="/login" element={<LoginPage />} />

                    <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />

                    <Route path="/customers" element={<Protected><CustomersPage /></Protected>} />
                    <Route path="/customers/new" element={<Protected><CustomerCreatePage /></Protected>} />
                    <Route path="/customers/:id/edit" element={<Protected><CustomerEditPage /></Protected>} />

                    <Route path="/drivers" element={<Protected><DriversPage /></Protected>} />
                    <Route path="/drivers/new" element={<Protected><DriverFormPage /></Protected>} />
                    <Route path="/drivers/:id/edit" element={<Protected><DriverFormPage /></Protected>} />

                    <Route path="/vehicles" element={<Protected><VehiclesPage /></Protected>} />
                    <Route path="/vehicles/new" element={<Protected><VehicleFormPage /></Protected>} />
                    <Route path="/vehicles/:id/edit" element={<Protected><VehicleFormPage /></Protected>} />

                    <Route path="/shipments" element={<Protected><ShipmentsPage /></Protected>} />
                    <Route path="/shipments/new" element={<Protected><ShipmentFormPage /></Protected>} />
                    <Route path="/shipments/:id/edit" element={<Protected><ShipmentFormPage /></Protected>} />

                    <Route path="/invoices" element={<Protected><InvoicesPage /></Protected>} />
                    <Route path="/invoices/new" element={<Protected><InvoiceFormPage /></Protected>} />
                    <Route path="/invoices/:id/edit" element={<Protected><InvoiceFormPage /></Protected>} />

                    {/* Tanpa sidebar supaya hasil cetak bersih */}
                    <Route path="/invoices/:id/print" element={<ProtectedRoute><InvoicePrintPage /></ProtectedRoute>} />

                    <Route path="/" element={<Navigate to="/dashboard" replace />} />

                    <Route path="*" element={<Navigate to="/dashboard" replace />} />

                </Routes>

            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
