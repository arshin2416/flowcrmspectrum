import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "react-toastify";
import FilterBuilder from "@/components/molecules/FilterBuilder";
import { filterService } from "@/services/api/filterService";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import Select from "@/components/atoms/Select";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Modal from "@/components/molecules/Modal";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import { contactService } from "@/services/api/contactService";
import { dealService } from "@/services/api/dealService";

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [savedFilters, setSavedFilters] = useState([]);
  const [appliedFilter, setAppliedFilter] = useState(null);
  const [formData, setFormData] = useState({
    contactId: '',
    title: '',
    value: '',
    stage: 'discovery',
    expectedClose: '',
    probability: 50
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draggedDeal, setDraggedDeal] = useState(null);

  const stages = [
    { id: 'discovery', name: 'Discovery', color: 'bg-slate-500' },
    { id: 'qualified', name: 'Qualified', color: 'bg-blue-500' },
    { id: 'proposal', name: 'Proposal', color: 'bg-yellow-500' },
    { id: 'negotiation', name: 'Negotiation', color: 'bg-orange-500' },
    { id: 'closed-won', name: 'Closed Won', color: 'bg-green-500' },
    { id: 'closed-lost', name: 'Closed Lost', color: 'bg-red-500' }
  ];

const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dealsData, contactsData, filtersData] = await Promise.all([
        dealService.getAll(),
        contactService.getAll(),
        filterService.getByEntityType('deals')
      ]);
      setDeals(dealsData);
      setContacts(contactsData);
      setFilteredDeals(dealsData);
      setSavedFilters(filtersData);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load deals data');
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = deals.map(deal => {
      const contact = contacts.find(c => c.Id === deal.contactId);
      return { ...deal, contact };
    });

    // Apply advanced filter if present
    if (appliedFilter && appliedFilter.criteria) {
      filtered = filterService.applyFilter(filtered, appliedFilter.criteria, 'deals');
    }

    setFilteredDeals(filtered);
  }, [deals, contacts, appliedFilter]);

  const validateForm = () => {
    const errors = {};
    if (!formData.contactId) errors.contactId = 'Contact is required';
    if (!formData.title.trim()) errors.title = 'Deal title is required';
    if (!formData.value || parseFloat(formData.value) <= 0) errors.value = 'Valid deal value is required';
    if (!formData.expectedClose) errors.expectedClose = 'Expected close date is required';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    try {
      setIsSubmitting(true);
      const newDeal = await dealService.create({
        ...formData,
        contactId: parseInt(formData.contactId),
        value: parseFloat(formData.value),
        probability: parseInt(formData.probability)
      });
      setDeals(prev => [newDeal, ...prev]);
      setIsModalOpen(false);
      setFormData({
        contactId: '',
        title: '',
        value: '',
        stage: 'discovery',
        expectedClose: '',
        probability: 50
      });
      toast.success('Deal created successfully');
    } catch (err) {
      toast.error('Failed to create deal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDragStart = (deal) => {
    setDraggedDeal(deal);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetStage) => {
    e.preventDefault();
    
    if (!draggedDeal || draggedDeal.stage === targetStage) {
      setDraggedDeal(null);
      return;
}

    try {
      await dealService.updateStage(draggedDeal.Id, targetStage);
      setDeals(prev => prev.map(deal => 
        deal.Id === draggedDeal.Id ? { ...deal, stage: targetStage } : deal
      ));
      toast.success('Deal stage updated');
    } catch (err) {
      toast.error('Failed to update deal stage');
    } finally {
      setDraggedDeal(null);
    }
  };

  const handleAdvancedFilter = (filter) => {
    setAppliedFilter(filter);
    setIsAdvancedFilterOpen(false);
    if (filter) {
      toast.success(`Applied filter: ${filter.name}`);
    }
  };

  const handleSavedFilterChange = async (filterId) => {
    if (!filterId) {
      setAppliedFilter(null);
      return;
    }

    try {
      const filter = await filterService.getById(parseInt(filterId));
      setAppliedFilter(filter);
      toast.success(`Applied filter: ${filter.name}`);
    } catch (err) {
      toast.error('Failed to apply saved filter');
    }
  };

  const getContactById = (contactId) => {
    return contacts.find(c => c.Id === contactId);
  };

  const getDealsByStage = (stageId) => {
    return filteredDeals.filter(deal => deal.stage === stageId);
  };

  const getStageValue = (stageId) => {
    return getDealsByStage(stageId).reduce((sum, deal) => sum + deal.value, 0);
  };

  if (loading) return <Loading type="pipeline" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
<div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales Pipeline</h1>
          <p className="text-slate-600 mt-1">Track deals through your sales process</p>
        </div>
        <Button 
          variant="primary" 
          icon="Plus"
          onClick={() => setIsModalOpen(true)}
        >
          Add Deal
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            variant="secondary"
            icon="Filter"
            onClick={() => setIsAdvancedFilterOpen(true)}
          >
            Advanced Filters
          </Button>
          <Select
            value={appliedFilter?.Id || ''}
            onChange={(e) => handleSavedFilterChange(e.target.value)}
            options={[
              { value: '', label: 'All Deals' },
              ...savedFilters.map(filter => ({
                value: filter.Id.toString(),
                label: filter.name
              }))
            ]}
            placeholder="Saved Filters"
          />
        </div>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
        >
<div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Deals</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">{filteredDeals.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <ApperIcon name="TrendingUp" className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
        >
<div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Pipeline Value</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                ${filteredDeals.filter(d => !['closed-won', 'closed-lost'].includes(d.stage))
                  .reduce((sum, deal) => sum + deal.value, 0).toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <ApperIcon name="DollarSign" className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Won Deals</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                {getDealsByStage('closed-won').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <ApperIcon name="Trophy" className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Win Rate</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                {deals.length > 0 
                  ? Math.round((getDealsByStage('closed-won').length / deals.length) * 100)
                  : 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <ApperIcon name="Target" className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>
      </div>
{/* Pipeline Board */}
      {filteredDeals.length === 0 ? (
        <Empty
          title="No deals in pipeline"
          message="Start tracking your sales opportunities by creating your first deal."
          actionLabel="Add Deal"
          onAction={() => setIsModalOpen(true)}
          icon="TrendingUp"
        />
      ) : (
        <div className="bg-slate-50 rounded-xl p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-6 gap-6 overflow-x-auto">
            {stages.map((stage, index) => {
              const stageDeals = getDealsByStage(stage.id);
              const stageValue = getStageValue(stage.id);
              
              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-sm border border-slate-200 min-w-[280px]"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, stage.id)}
                >
                  <div className="p-4 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                        <h3 className="font-medium text-slate-900">{stage.name}</h3>
                        <Badge variant="default" size="sm">{stageDeals.length}</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      ${stageValue.toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="p-4 space-y-3 min-h-[400px] max-h-[600px] overflow-y-auto custom-scrollbar">
                    {stageDeals.map((deal) => {
                      const contact = getContactById(deal.contactId);
                      if (!contact) return null;

                      return (
                        <motion.div
                          key={deal.Id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-slate-50 rounded-lg p-3 border border-slate-200 cursor-move hover:shadow-sm transition-shadow"
                          draggable
                          onDragStart={() => handleDragStart(deal)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-slate-900 text-sm truncate">
                              {deal.title}
                            </h4>
                            <span className="text-xs text-slate-500">{deal.probability}%</span>
                          </div>
                          
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-medium">
                                {contact.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-xs text-slate-600 truncate">{contact.name}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-900">
                              ${deal.value.toLocaleString()}
                            </span>
                            <span className="text-xs text-slate-500">
                              {format(new Date(deal.expectedClose), 'MMM dd')}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Deal Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Deal"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Contact"
              value={formData.contactId}
              onChange={(e) => setFormData(prev => ({ ...prev, contactId: e.target.value }))}
              options={contacts.map(contact => ({
                value: contact.Id.toString(),
                label: `${contact.name} - ${contact.company}`
              }))}
              error={formErrors.contactId}
              required
              placeholder="Select a contact"
            />
            <Input
              label="Deal Title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              error={formErrors.title}
              required
              placeholder="e.g., Software License Deal"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Deal Value"
              type="number"
              value={formData.value}
              onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
              error={formErrors.value}
              required
              placeholder="25000"
            />
            <Input
              label="Expected Close Date"
              type="date"
              value={formData.expectedClose}
              onChange={(e) => setFormData(prev => ({ ...prev, expectedClose: e.target.value }))}
              error={formErrors.expectedClose}
              required
            />
          </div>

          <Select
            label="Stage"
            value={formData.stage}
            onChange={(e) => setFormData(prev => ({ ...prev, stage: e.target.value }))}
            options={stages.map(stage => ({
              value: stage.id,
              label: stage.name
            }))}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Probability: {formData.probability}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={formData.probability}
              onChange={(e) => setFormData(prev => ({ ...prev, probability: parseInt(e.target.value) }))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
            >
              Create Deal
            </Button>
          </div>
</form>
      </Modal>

      {/* Advanced Filter Builder Modal */}
      <FilterBuilder
        isOpen={isAdvancedFilterOpen}
        onClose={() => setIsAdvancedFilterOpen(false)}
        entityType="deals"
        onApplyFilter={handleAdvancedFilter}
      />
    </div>
  );
};

export default Deals;