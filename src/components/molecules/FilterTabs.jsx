import React from 'react';
import { motion } from 'framer-motion';

const FilterTabs = ({ 
  tabs = [], 
  activeTab, 
  onTabChange, 
  className = '' 
}) => {
  return (
    <div className={`flex space-x-1 bg-slate-100 p-1 rounded-lg ${className}`}>
      {tabs.map((tab) => (
        <motion.button
          key={tab.value}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onTabChange(tab.value)}
          className={`
            relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
            ${activeTab === tab.value
              ? 'text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
            }
          `}
        >
          {activeTab === tab.value && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 rounded-md"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-2 opacity-75">({tab.count})</span>
            )}
          </span>
        </motion.button>
      ))}
    </div>
  );
};

export default FilterTabs;