import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { AuthContext } from '@/App';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const Header = () => {
  const { user } = useSelector((state) => state.user);
  const { logout } = useContext(AuthContext);

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-slate-900">FlowCRM</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {user && (
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-slate-500">{user.emailAddress}</p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user.firstName?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={logout}
                icon="LogOut"
              >
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;