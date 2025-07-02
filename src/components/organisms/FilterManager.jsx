import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import FilterBuilder from '@/components/molecules/FilterBuilder';
import { filterService } from '@/services/api/filterService';

const FilterManager = () => {
  const [filters, setFilters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterBuilderOpen, setIsFilterBuilderOpen] = useState(false);
  const [editingFilter, setEditingFilter] = useState(null);
  const [selectedEntityType, setSelectedEntityType] = useState('contacts');

  const entityTypes = [
    { value: 'contacts', label: 'Contacts', icon: 'Users' },
    { value: 'leads', label: 'Leads', icon: 'Target' },
    { value: 'deals', label: 'Deals', icon: 'TrendingUp' }
  ];

  const loadFilters = async () => {
    try {
      setLoading(true);
      setError(null);
      const filtersData = await filterService.getAll();
      setFilters(filtersData);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load saved filters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilters();
  }, []);

  const handleDeleteFilter = async (filterId) => {
    if (!window.confirm('Are you sure you want to delete this filter?')) return;

    try {
      await filterService.delete(filterId);
      setFilters(prev => prev.filter(f => f.Id !== filterId));
      toast.success('Filter deleted successfully');
    } catch (err) {
      toast.error('Failed to delete filter');
    }
  };

  const handleEditFilter = (filter) => {
    setEditingFilter(filter);
    setSelectedEntityType(filter.entityType);
    setIsFilterBuilderOpen(true);
  };

  const handleCreateFilter = (entityType) => {
    setEditingFilter(null);
    setSelectedEntityType(entityType);
    setIsFilterBuilderOpen(true);
  };

  const handleFilterSaved = () => {
    loadFilters();
    setIsFilterBuilderOpen(false);
    setEditingFilter(null);
  };

  const getFiltersByEntityType = (entityType) => {
    return filters.filter(f => f.entityType === entityType);
  };

  const formatCriteria = (criteria) => {
    if (!criteria || criteria.length === 0) return 'No criteria';
    
    return criteria.map(c => {
      let valueDisplay = c.value;
      if (c.operator === 'between') {
        valueDisplay = `${c.value} - ${c.value2}`;
      }
      return `${c.field} ${c.operator} ${valueDisplay}`;
    }).join(', ');
  };

  if (loading) return <Loading type="table" />;
  if (error) return <Error message={error} onRetry={loadFilters} />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Saved Filters</h1>
          <p className="text-slate-600 mt-1">Manage your saved filter configurations</p>
        </div>
      </div>

      {/* Entity Type Tabs */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-wrap gap-2 mb-6">
          {entityTypes.map((type) => {
            const typeFilters = getFiltersByEntityType(type.value);
            return (
              <button
                key={type.value}
                onClick={() => setSelectedEntityType(type.value)}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200
                  ${selectedEntityType === type.value
                    ? 'bg-gradient-to-r from-primary/10 to-blue-600/10 text-primary border border-primary/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
                  }
                `}
              >
                <ApperIcon name={type.icon} className="w-4 h-4" />
                <span className="font-medium">{type.label}</span>
                <Badge variant="default" size="sm">{typeFilters.length}</Badge>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end">
          <Button
            variant="primary"
            icon="Plus"
            onClick={() => handleCreateFilter(selectedEntityType)}
          >
            Create Filter
          </Button>
        </div>
      </div>

      {/* Filters List */}
      {getFiltersByEntityType(selectedEntityType).length === 0 ? (
        <Empty
          title={`No ${selectedEntityType} filters found`}
          message={`Create your first filter to save commonly used search criteria for ${selectedEntityType}.`}
          actionLabel="Create Filter"
          onAction={() => handleCreateFilter(selectedEntityType)}
          icon="Filter"
        />
      ) : (
        <div className="space-y-4">
          {getFiltersByEntityType(selectedEntityType).map((filter, index) => (
            <motion.div
              key={filter.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">{filter.name}</h3>
                    <Badge variant="info" size="sm" className="capitalize">
                      {filter.entityType}
                    </Badge>
                  </div>
                  
                  {filter.description && (
                    <p className="text-slate-600 mb-3">{filter.description}</p>
                  )}
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">Criteria:</p>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-sm text-slate-600">
                        {formatCriteria(filter.criteria)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 mt-4 text-xs text-slate-500">
                    <span>{filter.criteria?.length || 0} criteria</span>
                    <span>•</span>
                    <span>Created {new Date(filter.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="Edit"
                    onClick={() => handleEditFilter(filter)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="Trash2"
                    onClick={() => handleDeleteFilter(filter.Id)}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Filter Builder Modal */}
      <FilterBuilder
        isOpen={isFilterBuilderOpen}
        onClose={() => {
          setIsFilterBuilderOpen(false);
          setEditingFilter(null);
        }}
        entityType={selectedEntityType}
        existingFilter={editingFilter}
        onApplyFilter={handleFilterSaved}
      />
    </div>
  );
};

export default FilterManager;