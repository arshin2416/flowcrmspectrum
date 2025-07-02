import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Modal from '@/components/molecules/Modal';
import { filterService } from '@/services/api/filterService';

const FilterBuilder = ({ isOpen, onClose, entityType, onApplyFilter, existingFilter }) => {
  const [filterName, setFilterName] = useState('');
  const [filterDescription, setFilterDescription] = useState('');
  const [criteria, setCriteria] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterErrors, setFilterErrors] = useState({});

  // Define available fields for each entity type
  const entityFields = {
    contacts: [
      { value: 'name', label: 'Name', type: 'text' },
      { value: 'email', label: 'Email', type: 'text' },
      { value: 'company', label: 'Company', type: 'text' },
      { value: 'phone', label: 'Phone', type: 'text' },
      { value: 'status', label: 'Status', type: 'select', options: [
        { value: 'active', label: 'Active' },
        { value: 'prospect', label: 'Prospect' },
        { value: 'inactive', label: 'Inactive' }
      ]},
      { value: 'createdAt', label: 'Created Date', type: 'date' },
      { value: 'tags', label: 'Tags', type: 'text' }
    ],
    leads: [
      { value: 'contact.name', label: 'Contact Name', type: 'text' },
      { value: 'contact.email', label: 'Contact Email', type: 'text' },
      { value: 'contact.company', label: 'Contact Company', type: 'text' },
      { value: 'source', label: 'Source', type: 'select', options: [
        { value: 'website', label: 'Website' },
        { value: 'linkedin', label: 'LinkedIn' },
        { value: 'referral', label: 'Referral' },
        { value: 'cold-email', label: 'Cold Email' },
        { value: 'trade-show', label: 'Trade Show' }
      ]},
      { value: 'status', label: 'Status', type: 'select', options: [
        { value: 'new', label: 'New' },
        { value: 'contacted', label: 'Contacted' },
        { value: 'qualified', label: 'Qualified' }
      ]},
      { value: 'score', label: 'Score', type: 'number' },
      { value: 'createdAt', label: 'Created Date', type: 'date' }
    ],
    deals: [
      { value: 'title', label: 'Deal Title', type: 'text' },
      { value: 'contact.name', label: 'Contact Name', type: 'text' },
      { value: 'contact.company', label: 'Contact Company', type: 'text' },
      { value: 'value', label: 'Deal Value', type: 'number' },
      { value: 'stage', label: 'Stage', type: 'select', options: [
        { value: 'discovery', label: 'Discovery' },
        { value: 'qualified', label: 'Qualified' },
        { value: 'proposal', label: 'Proposal' },
        { value: 'negotiation', label: 'Negotiation' },
        { value: 'closed-won', label: 'Closed Won' },
        { value: 'closed-lost', label: 'Closed Lost' }
      ]},
      { value: 'probability', label: 'Probability', type: 'number' },
      { value: 'expectedClose', label: 'Expected Close', type: 'date' },
      { value: 'createdAt', label: 'Created Date', type: 'date' }
    ]
  };

  const operators = {
    text: [
      { value: 'contains', label: 'Contains' },
      { value: 'equals', label: 'Equals' },
      { value: 'starts_with', label: 'Starts with' },
      { value: 'ends_with', label: 'Ends with' },
      { value: 'not_contains', label: 'Does not contain' }
    ],
    select: [
      { value: 'equals', label: 'Equals' },
      { value: 'not_equals', label: 'Does not equal' }
    ],
    number: [
      { value: 'equals', label: 'Equals' },
      { value: 'greater_than', label: 'Greater than' },
      { value: 'less_than', label: 'Less than' },
      { value: 'greater_equal', label: 'Greater than or equal' },
      { value: 'less_equal', label: 'Less than or equal' }
    ],
    date: [
      { value: 'equals', label: 'Equals' },
      { value: 'before', label: 'Before' },
      { value: 'after', label: 'After' },
      { value: 'between', label: 'Between' }
    ]
  };

  useEffect(() => {
    if (existingFilter) {
      setFilterName(existingFilter.name);
      setFilterDescription(existingFilter.description || '');
      setCriteria(existingFilter.criteria || []);
    } else {
      resetForm();
    }
  }, [existingFilter, isOpen]);

  const resetForm = () => {
    setFilterName('');
    setFilterDescription('');
    setCriteria([]);
    setFilterErrors({});
  };

  const addCriterion = () => {
    const newCriterion = {
      id: Date.now(),
      field: '',
      operator: '',
      value: '',
      value2: '' // For between operator
    };
    setCriteria(prev => [...prev, newCriterion]);
  };

  const removeCriterion = (id) => {
    setCriteria(prev => prev.filter(c => c.id !== id));
  };

  const updateCriterion = (id, updates) => {
    setCriteria(prev => prev.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ));
  };

  const getFieldType = (fieldValue) => {
    const fields = entityFields[entityType] || [];
    const field = fields.find(f => f.value === fieldValue);
    return field?.type || 'text';
  };

  const getFieldOptions = (fieldValue) => {
    const fields = entityFields[entityType] || [];
    const field = fields.find(f => f.value === fieldValue);
    return field?.options || [];
  };

  const validateFilter = () => {
    const errors = {};
    
    if (!filterName.trim()) {
      errors.filterName = 'Filter name is required';
    }

    if (criteria.length === 0) {
      errors.criteria = 'At least one criterion is required';
    }

    criteria.forEach((criterion, index) => {
      if (!criterion.field) {
        errors[`criterion_${index}_field`] = 'Field is required';
      }
      if (!criterion.operator) {
        errors[`criterion_${index}_operator`] = 'Operator is required';
      }
      if (!criterion.value && criterion.operator !== 'between') {
        errors[`criterion_${index}_value`] = 'Value is required';
      }
      if (criterion.operator === 'between' && (!criterion.value || !criterion.value2)) {
        errors[`criterion_${index}_between`] = 'Both values are required for between operator';
      }
    });

    return errors;
  };

  const handleSave = async () => {
    const errors = validateFilter();
    setFilterErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      const filterData = {
        name: filterName,
        description: filterDescription,
        entityType,
        criteria: criteria.map(c => ({
          field: c.field,
          operator: c.operator,
          value: c.value,
          value2: c.value2
        }))
      };

      let savedFilter;
      if (existingFilter) {
        savedFilter = await filterService.update(existingFilter.Id, filterData);
        toast.success('Filter updated successfully');
      } else {
        savedFilter = await filterService.create(filterData);
        toast.success('Filter saved successfully');
      }

      if (onApplyFilter) {
        onApplyFilter(savedFilter);
      }

      onClose();
      resetForm();
    } catch (err) {
      toast.error('Failed to save filter');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyOnly = () => {
    const errors = validateFilter();
    setFilterErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const filterData = {
      name: filterName || 'Temporary Filter',
      entityType,
      criteria: criteria.map(c => ({
        field: c.field,
        operator: c.operator,
        value: c.value,
        value2: c.value2
      }))
    };

    if (onApplyFilter) {
      onApplyFilter(filterData);
    }

    onClose();
    resetForm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingFilter ? 'Edit Filter' : 'Advanced Filter Builder'}
      size="xl"
    >
      <div className="space-y-6">
        {/* Filter Info */}
        <div className="space-y-4">
          <Input
            label="Filter Name"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            error={filterErrors.filterName}
            placeholder="e.g., High Priority Prospects"
          />
          <Input
            label="Description (Optional)"
            value={filterDescription}
            onChange={(e) => setFilterDescription(e.target.value)}
            placeholder="Brief description of this filter"
          />
        </div>

        {/* Criteria Builder */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-slate-900">Filter Criteria</h3>
            <Button
              variant="secondary"
              size="sm"
              icon="Plus"
              onClick={addCriterion}
            >
              Add Criterion
            </Button>
          </div>

          {filterErrors.criteria && (
            <p className="text-sm text-error">{filterErrors.criteria}</p>
          )}

          <AnimatePresence>
            {criteria.map((criterion, index) => {
              const fieldType = getFieldType(criterion.field);
              const fieldOptions = getFieldOptions(criterion.field);
              
              return (
                <motion.div
                  key={criterion.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-slate-50 rounded-lg p-4 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">
                      Criterion {index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="X"
                      onClick={() => removeCriterion(criterion.id)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Select
                      label="Field"
                      value={criterion.field}
                      onChange={(e) => updateCriterion(criterion.id, { 
                        field: e.target.value,
                        operator: '',
                        value: '',
                        value2: ''
                      })}
                      options={entityFields[entityType]?.map(field => ({
                        value: field.value,
                        label: field.label
                      })) || []}
                      error={filterErrors[`criterion_${index}_field`]}
                      placeholder="Select field"
                    />

                    <Select
                      label="Operator"
                      value={criterion.operator}
                      onChange={(e) => updateCriterion(criterion.id, { 
                        operator: e.target.value,
                        value: '',
                        value2: ''
                      })}
                      options={operators[fieldType] || []}
                      error={filterErrors[`criterion_${index}_operator`]}
                      placeholder="Select operator"
                      disabled={!criterion.field}
                    />

                    <div className="space-y-2">
                      {criterion.operator === 'between' ? (
                        <div className="space-y-2">
                          {fieldType === 'select' ? (
                            <>
                              <Select
                                label="From Value"
                                value={criterion.value}
                                onChange={(e) => updateCriterion(criterion.id, { value: e.target.value })}
                                options={fieldOptions}
                                error={filterErrors[`criterion_${index}_between`]}
                                placeholder="Select value"
                              />
                              <Select
                                label="To Value"
                                value={criterion.value2}
                                onChange={(e) => updateCriterion(criterion.id, { value2: e.target.value })}
                                options={fieldOptions}
                                error={filterErrors[`criterion_${index}_between`]}
                                placeholder="Select value"
                              />
                            </>
                          ) : (
                            <>
                              <Input
                                label="From Value"
                                type={fieldType === 'number' ? 'number' : fieldType}
                                value={criterion.value}
                                onChange={(e) => updateCriterion(criterion.id, { value: e.target.value })}
                                error={filterErrors[`criterion_${index}_between`]}
                                placeholder="Enter value"
                              />
                              <Input
                                label="To Value"
                                type={fieldType === 'number' ? 'number' : fieldType}
                                value={criterion.value2}
                                onChange={(e) => updateCriterion(criterion.id, { value2: e.target.value })}
                                error={filterErrors[`criterion_${index}_between`]}
                                placeholder="Enter value"
                              />
                            </>
                          )}
                        </div>
                      ) : (
                        fieldType === 'select' ? (
                          <Select
                            label="Value"
                            value={criterion.value}
                            onChange={(e) => updateCriterion(criterion.id, { value: e.target.value })}
                            options={fieldOptions}
                            error={filterErrors[`criterion_${index}_value`]}
                            placeholder="Select value"
                            disabled={!criterion.operator}
                          />
                        ) : (
                          <Input
                            label="Value"
                            type={fieldType === 'number' ? 'number' : fieldType}
                            value={criterion.value}
                            onChange={(e) => updateCriterion(criterion.id, { value: e.target.value })}
                            error={filterErrors[`criterion_${index}_value`]}
                            placeholder="Enter value"
                            disabled={!criterion.operator}
                          />
                        )
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {criteria.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <ApperIcon name="Filter" className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>No criteria added yet</p>
              <p className="text-sm mt-1">Click "Add Criterion" to start building your filter</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t border-slate-200">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          
          <div className="flex space-x-3">
            <Button
              variant="ghost"
              onClick={handleApplyOnly}
              disabled={isSubmitting || criteria.length === 0}
            >
              Apply Only
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              loading={isSubmitting}
              disabled={criteria.length === 0}
            >
              {existingFilter ? 'Update Filter' : 'Save & Apply'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default FilterBuilder;