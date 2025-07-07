import React, { useEffect, useState } from "react";
import Sidebar from "@/components/organisms/Sidebar";
import Header from "@/components/organisms/Header";

const Layout = ({ children }) => {
  // State for sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Defensive checks for router context availability
  const safeLocation = location || { pathname: '/', search: '', hash: '', state: null };
  const safeNavigate = navigate || (() => console.warn('Navigation unavailable'));
  
  useEffect(() => {
    // Verify router is working properly
    if (!location?.pathname) {
      console.warn('Location pathname not available, router may not be initialized');
    }
  }, [location]);

  const handleSearch = (searchTerm) => {
    console.log('Global search:', searchTerm);
    // TODO: Implement global search functionality
    try {
      if (searchTerm && safeNavigate) {
        // Safe navigation with error handling
        console.log('Search would navigate with term:', searchTerm);
      }
    } catch (error) {
      console.error('Search navigation error:', error);
    }
  };

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