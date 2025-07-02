import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '@/components/organisms/Sidebar';
import Header from '@/components/organisms/Header';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRouterReady, setIsRouterReady] = useState(false);
  
  // Safe router hooks with error handling
  let location, navigate;
  try {
    location = useLocation();
    navigate = useNavigate();
    
    // Ensure location object has required properties
    if (location && typeof location.pathname === 'string') {
      setIsRouterReady(true);
    }
  } catch (error) {
    console.error('Router context error:', error);
    location = { pathname: '/', search: '', hash: '', state: null };
    navigate = () => console.warn('Navigation unavailable');
  }

  useEffect(() => {
    // Verify router is working properly
    if (location?.pathname) {
      setIsRouterReady(true);
    } else {
      console.warn('Location pathname not available, router may not be initialized');
    }
  }, [location]);

  const handleSearch = (searchTerm) => {
    console.log('Global search:', searchTerm);
    // TODO: Implement global search functionality
    try {
      if (searchTerm && navigate) {
        // Safe navigation with error handling
        console.log('Search would navigate with term:', searchTerm);
      }
    } catch (error) {
      console.error('Search navigation error:', error);
    }
  };

  // Show loading state if router isn't ready
  if (!isRouterReady) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-secondary text-sm">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="FlowCRM"
          onMenuClick={() => setSidebarOpen(true)}
          onSearch={handleSearch}
        />
        
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="min-h-full">
            {children || (
              <div className="flex items-center justify-center h-96">
                <p className="text-secondary">No content available</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;