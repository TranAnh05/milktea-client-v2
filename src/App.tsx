import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { AppRoutes } from "@/routes/AppRoutes";

function App() {
    return (
        <BrowserRouter>
            <Provider store={store}>
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
            </Provider>
        </BrowserRouter>
    );
}

export default App;
