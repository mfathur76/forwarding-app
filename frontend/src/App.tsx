import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "@/context/AuthContext";

import { ProtectedRoute } from "@/components/ProtectedRoute";

import { DashboardLayout } from "@/components/layout/DashboardLayout";

import { LoginPage } from "@/pages/LoginPage";

import { DashboardPage } from "@/pages/DashboardPage";

import { CustomersPage } from "@/pages/CustomersPage";
import { CustomerCreatePage } from "@/pages/CustomerCreatePage";
import { CustomerEditPage } from "@/pages/CustomerEditPage";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>

                <Routes>

                    <Route
                        path="/login"
                        element={<LoginPage />}
                    />

                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>

                                <DashboardLayout>

                                    <DashboardPage />

                                </DashboardLayout>

                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/customers"
                        element={
                            <ProtectedRoute>

                                <DashboardLayout>

                                    <CustomersPage />

                                </DashboardLayout>

                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/customers/new"
                        element={
                            <ProtectedRoute>

                                <DashboardLayout>

                                    <CustomerCreatePage />

                                </DashboardLayout>

                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/customers/:id/edit"
                        element={
                            <ProtectedRoute>

                                <DashboardLayout>

                                    <CustomerEditPage />

                                </DashboardLayout>

                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/"
                        element={
                            <Navigate
                                to="/dashboard"
                                replace
                            />
                        }
                    />

                </Routes>

            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;