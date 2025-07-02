import React from "react";
import { Route, Router, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import FilterManager from "@/components/pages/FilterManager";
import Contacts from "@/components/pages/Contacts";
import ContactDetail from "@/components/pages/ContactDetail";
import Dashboard from "@/components/pages/Dashboard";
import Tasks from "@/components/pages/Tasks";
import Deals from "@/components/pages/Deals";
import Leads from "@/components/pages/Leads";
import Layout from "@/components/organisms/Layout";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Layout>
<Routes>
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/filters" element={<FilterManager />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/contacts/:id" element={<ContactDetail />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/deals" element={<Deals />} />
          </Routes>
        </Layout>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Router>
  );
}

export default App;