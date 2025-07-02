import React, { Suspense } from 'react'
import { Route, BrowserRouter, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import FilterManager from '@/components/pages/FilterManager'
import Contacts from '@/components/pages/Contacts'
import ContactDetail from '@/components/pages/ContactDetail'
import Dashboard from '@/components/pages/Dashboard'
import Tasks from '@/components/pages/Tasks'
import Deals from '@/components/pages/Deals'
import Leads from '@/components/pages/Leads'
import Layout from '@/components/organisms/Layout'

// Error Boundary Component
class RouterErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Router Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-error mb-4">Navigation Error</h1>
            <p className="text-secondary mb-4">
              There was a problem with the application routing.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading Component
const AppLoading = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-secondary">Loading FlowCRM...</p>
    </div>
  </div>
);

function App() {
  return (
    <RouterErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<AppLoading />}>
          <div className="min-h-screen bg-background">
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/filters" element={<FilterManager />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/contacts/:id" element={<ContactDetail />} />
                <Route path="/leads" element={<Leads />} />
                <Route path="/deals" element={<Deals />} />
                <Route path="*" element={
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <h2 className="text-xl font-semibold text-secondary mb-2">Page Not Found</h2>
                      <p className="text-secondary">The requested page could not be found.</p>
                    </div>
                  </div>
                } />
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
        </Suspense>
      </BrowserRouter>
    </RouterErrorBoundary>
  )
}

export default App;