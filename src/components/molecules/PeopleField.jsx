import React, { useState, useEffect, useRef } from 'react';
import ApperIcon from '@/components/ApperIcon';
import { contactService } from "@/services/api/contactService";
import {  useTable } from '@/components/hooks/useTable';

/**
 * PeopleField Component
 * 
 * A reusable component for selecting people/users with support for both single and multiple selection modes.
 * 
 * Props:
 * - label: String - The field label (default: "People")
 * - selectedPeople: Array - Array of selected user objects
 * - onSelectionChange: Function - Callback when selection changes
 * - isMultiple: Boolean - Enable multiple selection mode (default: false)
 * - placeholder: String - Placeholder text for the button and search (default: "Add People...")
 * - className: String - Additional CSS classes
 * - availableUsers: Array - Array of available users to select from (optional)
 * - showCheckbox: Boolean - Show checkboxes for all items (default: true)
 * - loadPeople: Function - Function to load people externally (optional)
 * - onSearchPeople: Function - Function to search people with debounce (optional)
 * - isLoading: Boolean - External loading state (default: false)
 * 
 * Expected data format for selectedPeople:
 * [{ Id: 1, FirstName: "John", LastName: "Doe", Email: "john@example.com" }]
 * 
 * Usage Examples:
 * 
 * Single Selection:
 * <PeopleField
 *   label="Project Manager"
 *   selectedPeople={singleSelection}
 *   onSelectionChange={setSingleSelection}
 *   isMultiple={false}
 *   placeholder="Select a project manager..."
 * />
 * 
 * Multiple Selection:
 * <PeopleField
 *   label="Team Members"
 *   selectedPeople={multipleSelection}
 *   onSelectionChange={setMultipleSelection}
 *   isMultiple={true}
 *   placeholder="Add team members..."
 *   onSearchPeople={loadPeopleForSelection}
 * />
 */
const PeopleField = ({ 
  label = "People", 
  selectedPeople = [], 
  onSelectionChange,
  isMultiple = false,
  placeholder = "Add People...",
  className = "",
  availableUsers = [],
  showCheckbox = true,
  onSearchPeople = null,
  isLoading = false,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const { getAvatar, getDisplayName } = useTable();


  // Debounced search function
  const handleSearchWithDebounce = (term) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      if (onSearchPeople) {
        if (!isLoading) {
          setLoading(true);
          try {
            await onSearchPeople(term);
          } finally {
            setLoading(false);
          }
        } else {
          // If parent is managing loading state, just call the function
          await onSearchPeople(term);
        }
      }
    }, 500); // 500ms debounce delay
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        setSearchTerm('');
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [showDropdown]);

  

  // Use provided users
  const users = availableUsers || [];

  const handleToggleSelection = (user) => {
    if (isMultiple) {
      // Multiple selection logic
      const isSelected = selectedPeople.some(p => p.Id === user.Id);
      
      if (isSelected) {
        // Remove from selection
        const newSelection = selectedPeople.filter(p => p.Id !== user.Id);
        onSelectionChange(newSelection);
      } else {  
        // Add to selection
        const newSelection = [...selectedPeople, user];
        onSelectionChange(newSelection);
      }
    } else {
      // Single selection logic
      const isSelected = selectedPeople.some(p => p.Id === user.Id);
      
      if (isSelected) {
        // Deselect if already selected
        onSelectionChange([]);
      } else {
        // Select the user
        onSelectionChange([user]);
      }
      
      // Close dropdown after selection in single mode
      setShowDropdown(false);
      setSearchTerm('');
    }
  };

  const handleRemovePerson = (userId) => {
    const newSelection = selectedPeople.filter(p => p.Id !== userId);
    onSelectionChange(newSelection);
  };

  const isUserSelected = (userId) => {
    return selectedPeople.some(p => p.Id === userId);
  };



  // Handle search term change with debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    handleSearchWithDebounce(value);
  };

  // Use users as is since filtering is now handled server-side
  const filteredUsers = users;

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      
      {/* Selected People Display */}
      {selectedPeople.length > 0 && (
        <div className={`flex ${isMultiple ? 'flex-wrap gap-2' : 'gap-2'} mb-2`}>
          {selectedPeople.map((person) => (
            <div
              key={person.Id}
              className={`flex items-center space-x-2 bg-slate-100 text-slate-700 rounded-full px-3 py-1 text-sm ${
                !isMultiple ? 'w-full max-w-xs' : ''
              }`}
            >
              <div className="relative group">
                <div className="w-6 h-6 bg-slate-400 rounded-full flex items-center justify-center text-white text-xs font-medium overflow-hidden cursor-pointer">
                  {(() => {
                    const avatar = getAvatar(person, users, true);
                    if (avatar.type === 'image') {
                      return <img src={avatar.value} alt="Avatar" className="w-full h-full object-cover rounded-full" />;
                    }
                    return avatar.value;
                  })()}
                </div>
                
                {/* Hover tooltip */}
                <div className="absolute bottom-full -left-10 transform  mb-2 px-2 py-1 text-xs text-white bg-slate-800 rounded opacity-0 w-[114px] group-hover:opacity-100 transition-opacity duration-200  z-50">
                  {getDisplayName(person)}
                </div>
              </div>
              
             
              <button
                type="button"
                onClick={() => handleRemovePerson(person.Id)}
                className="ml-1 text-slate-500 hover:text-slate-700"
              >
                <ApperIcon name="X" className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add People Button and Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center space-x-2 text-primary hover:text-primary-dark rounded-lg px-3 py-2 text-sm w-full justify-start border border-slate-200 hover:border-slate-300 transition-colors"
        >
          <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center">
            <ApperIcon name="Plus" className="w-4 h-4" />
          </div>
          <span>{placeholder}</span>
          <ApperIcon 
            name={showDropdown ? "ChevronUp" : "ChevronDown"} 
            className="w-4 h-4 ml-auto" 
          />
        </button>

        {/* Dropdown */}
        {showDropdown && (
          <div className="relative top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden">
            {/* Search Input */}
            <div className="p-3 border-b border-slate-200">
              <div className="relative">
                <ApperIcon name="Search" className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={`Search ${label.toLowerCase()}...`}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>

            {/* Users List */}
            <div className="max-h-48 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-slate-500 text-sm">
                  <div className="py-1 flex gap-2 items-center px-4">
                  <span className="bg-black/10 rounded-sm h-4 w-5 animate-pulse"></span>
                    <span className="bg-black/10 rounded-2xl h-4 w-60 animate-pulse"></span>
                  </div>
                  <div className="py-1 flex gap-3 items-center px-4">
                    <span className="bg-black/10 rounded-sm h-4 w-5 animate-pulse"></span>
                    <span className="bg-black/10 rounded-2xl h-4 w-60 animate-pulse"></span>
                  </div>
                  <div className="py-1 flex gap-3 items-center px-4">
                    <span className="bg-black/10 rounded-sm h-4 w-5 animate-pulse"></span>
                    <span className="bg-black/10 rounded-2xl h-4 w-60 animate-pulse"></span>
                  </div>
                  <div className="py-1 flex gap-3 items-center px-4">
                    <span className="bg-black/10 rounded-sm h-4 w-5 animate-pulse"></span>
                    <span className="bg-black/10 rounded-2xl h-4 w-60 animate-pulse"></span>
                  </div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-sm">
                  {searchTerm ? 'No users found matching your search' : 'No users available'}
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const isSelected = isUserSelected(user.Id);
                  return (
                    <button
                      key={user.Id}
                      type="button"
                      onClick={() => handleToggleSelection(user)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors ${
                        isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                      }`}
                                          >
                        {/* Checkbox for selection */}
                        {showCheckbox && (
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                            isSelected 
                              ? 'bg-primary border-primary' 
                              : 'border-slate-300 hover:border-primary'
                          }`}>
                            {isSelected && (
                              <ApperIcon name="Check" className="w-3 h-3 text-white" />
                            )}
                          </div>
                        )}
                      
                      <div className="w-8 h-8 bg-slate-400 rounded-full flex items-center justify-center text-white text-sm font-medium overflow-hidden">
                        {(() => {
                          const avatar = getAvatar(user, users, false);
                          if (avatar.type === 'image') {
                            return <img src={avatar.value} alt="Avatar" className="w-full h-full object-cover rounded-full" />;
                          }
                          return avatar.value;
                        })()}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-900">
                          {getDisplayName(user)}
                        </div>
                        {user.Email && (
                          <div className="text-xs text-slate-500 truncate">
                            {user.Email}
                          </div>
                        )}
                      </div>
                      
                      {isSelected && (
                        <ApperIcon name="Check" className="w-4 h-4 text-green-600" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PeopleField; 