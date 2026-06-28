import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import Layout from "./components/Layout.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Doctors from "./pages/Doctors";
import Appointments from "./pages/Appointments";
import Medicines from "./pages/Medicines";
import Reports from "./pages/Reports";
import Chat from "./pages/Chat";
import Calendar from "./pages/Calendar.jsx";
import Emergency from "./pages/Emergency.jsx";
import NotFound from "./pages/NotFound.jsx";

// Dashboards and Roles split
import PatientDashboard from "./pages/patient/Dashboard.jsx";
import DoctorDashboard from "./pages/doctor/Dashboard.jsx";
import PatientManagement from "./pages/doctor/PatientManagement.jsx";
import ClinicalConversationUI from "./pages/doctor/ClinicalConversationUI.jsx";

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes Layout */}
            <Route path="/" element={<Layout />}>
              {/* Patient Routes */}
              <Route path="dashboard" element={<PatientDashboard />} />
              <Route path="doctors" element={<Doctors />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="medicines" element={<Medicines />} />
              <Route path="reports" element={<Reports />} />
              <Route path="chat" element={<Chat />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="emergency" element={<Emergency />} />

              {/* Doctor Routes */}
              <Route path="doctor/dashboard" element={<DoctorDashboard />} />
              <Route path="doctor/patients" element={<PatientManagement />} />
              <Route path="doctor/clinical-chat" element={<ClinicalConversationUI />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
