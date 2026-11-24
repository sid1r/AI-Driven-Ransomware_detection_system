import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Detection from "./pages/Detection";
import History from "./pages/History";
import Analytics from "./pages/Analytics";
import Login from "./pages/Login";

import {
  isAuthenticated,
} from "./services/auth";


function ProtectedRoute({ children }) {

  if (!isAuthenticated()) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}


function App() {

  return (
    <BrowserRouter>

      <Routes>

        {/* LOGIN */}

        <Route
          path="/login"
          element={<Login />}
        />


        {/* PROTECTED APPLICATION */}

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/detection"
          element={
            <ProtectedRoute>
              <Detection />
            </ProtectedRoute>
          }
        />

        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />


        {/* UNKNOWN ROUTE */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}


export default App;