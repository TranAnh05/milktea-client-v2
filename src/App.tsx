import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppRoutes } from "@/routes/AppRoutes";
import { CartProvider } from "./contexts/CartContext";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <CartProvider>
                    <AppRoutes />

                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 3000,
                            style: {
                                background: "#333",
                                color: "#fff",
                            },
                        }}
                    />
                </CartProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
