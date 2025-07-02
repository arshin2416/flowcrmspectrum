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
import FilterTabs from "@/components/molecules/FilterTabs";
import Modal from "@/components/molecules/Modal";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import { contactService } from "@/services/api/contactService";
import { leadService } from "@/services/api/leadService";

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('score');
  const [savedFilters, setSavedFilters] = useState([]);
  const [appliedFilter, setAppliedFilter] = useState(null);
  const [formData, setFormData] = useState({
    contactId: '',
    source: 'website',
    status: 'new',
    score: 50
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [leadsData, contactsData, filtersData] = await Promise.all([
        leadService.getAll(),
        contactService.getAll(),
        filterService.getByEntityType('leads')
      ]);
      setLeads(leadsData);
      setContacts(contactsData);
      setFilteredLeads(leadsData);
      setSavedFilters(filtersData);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load leads data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

useEffect(() => {
    let filtered = leads.map(lead => {
      const contact = contacts.find(c => c.Id === lead.contactId);
      return { ...lead, contact };
    });

    // Apply advanced filter if present
    if (appliedFilter && appliedFilter.criteria) {
      filtered = filterService.applyFilter(filtered, appliedFilter.criteria, 'leads');
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(lead => {
        return lead.contact && (
          lead.contact.name.toLowerCase().includes(searchLower) ||
          lead.contact.email.toLowerCase().includes(searchLower) ||
          lead.contact.company.toLowerCase().includes(searchLower) ||
          lead.source.toLowerCase().includes(searchLower)
        );
      });
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    // Filter by source
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(lead => lead.source === sourceFilter);
    }

    // Sort leads
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.score - a.score;
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'name': {
          return a.contact && b.contact ? a.contact.name.localeCompare(b.contact.name) : 0;
        }
        default:
          return 0;
      }
    });

    setFilteredLeads(filtered);
  }, [leads, contacts, searchTerm, statusFilter, sourceFilter, sortBy, appliedFilter]);

  const validateForm = () => {
    const errors = {};
    if (!formData.contactId) errors.contactId = 'Contact is required';
    if (formData.score < 0 || formData.score > 100) errors.score = 'Score must be between 0 and 100';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    try {
      setIsSubmitting(true);
      const newLead = await leadService.create({
        ...formData,
        contactId: parseInt(formData.contactId),
        score: parseInt(formData.score)
      });
      setLeads(prev => [newLead, ...prev]);
      setIsModalOpen(false);
      setFormData({
        contactId: '',
        source: 'website',
        status: 'new',
        score: 50
      });
      toast.success('Lead created successfully');
    } catch (err) {
      toast.error('Failed to create lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async (leadId, newStatus) => {
    try {
      await leadService.update(leadId, { status: newStatus });
      setLeads(prev => prev.map(lead => 
        lead.Id === leadId ? { ...lead, status: newStatus } : lead
      ));
      toast.success('Lead status updated');
    } catch (err) {
      toast.error('Failed to update lead status');
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

  const statusTabs = [
    { label: 'All', value: 'all', count: leads.length },
    { label: 'New', value: 'new', count: leads.filter(l => l.status === 'new').length },
    { label: 'Contacted', value: 'contacted', count: leads.filter(l => l.status === 'contacted').length },
    { label: 'Qualified', value: 'qualified', count: leads.filter(l => l.status === 'qualified').length }
  ];

  const statusColors = {
    new: 'info',
    contacted: 'warning',
    qualified: 'success'
  };

  const sourceColors = {
    website: 'info',
    linkedin: 'primary',
    referral: 'success',
    'cold-email': 'warning',
    'trade-show': 'primary'
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  if (loading) return <Loading type="table" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
          <p className="text-slate-600 mt-1">Track and qualify potential customers</p>
        </div>
        <Button 
          variant="primary" 
          icon="Plus"
          onClick={() => setIsModalOpen(true)}
        >
          Add Lead
        </Button>
      </div>

{/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Input
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon="Search"
          />
          <Select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Sources' },
              { value: 'website', label: 'Website' },
              { value: 'linkedin', label: 'LinkedIn' },
              { value: 'referral', label: 'Referral' },
              { value: 'cold-email', label: 'Cold Email' },
              { value: 'trade-show', label: 'Trade Show' }
            ]}
          />
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={[
              { value: 'score', label: 'Sort by Score' },
              { value: 'created', label: 'Sort by Created Date' },
              { value: 'name', label: 'Sort by Name' }
            ]}
          />
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
              { value: '', label: 'All Leads' },
              ...savedFilters.map(filter => ({
                value: filter.Id.toString(),
                label: filter.name
              }))
            ]}
            placeholder="Saved Filters"
          />
        </div>
        
        <FilterTabs
          tabs={statusTabs}
          activeTab={statusFilter}
          onTabChange={setStatusFilter}
        />
      </div>

      {/* Leads List */}
      {filteredLeads.length === 0 ? (
        <Empty
          title="No leads found"
          message="Start tracking potential customers by adding your first lead."
          actionLabel="Add Lead"
          onAction={() => setIsModalOpen(true)}
          icon="Target"
        />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredLeads.map((lead, index) => {
                  const contact = getContactById(lead.contactId);
                  if (!contact) return null;

                  return (
                    <motion.tr
                      key={lead.Id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {contact.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">{contact.name}</div>
                            <div className="text-sm text-slate-500">{contact.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={sourceColors[lead.source]} className="capitalize">
                          {lead.source.replace('-', ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Select
                          value={lead.status}
                          onChange={(e) => handleStatusUpdate(lead.Id, e.target.value)}
                          options={[
                            { value: 'new', label: 'New' },
                            { value: 'contacted', label: 'Contacted' },
                            { value: 'qualified', label: 'Qualified' }
                          ]}
                          className="w-32"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Badge variant={getScoreColor(lead.score)}>
                            {lead.score}
                          </Badge>
                          <div className="w-20 bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-primary to-blue-600 h-2 rounded-full"
                              style={{ width: `${lead.score}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {format(new Date(lead.createdAt), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            icon="Eye"
                            onClick={() => {
                              // Navigate to contact detail
                              window.location.href = `/contacts/${contact.Id}`;
                            }}
                          />
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            icon="TrendingUp"
                            onClick={() => {
                              toast.info('Convert to deal feature coming soon');
                            }}
                          />
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Lead"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Source"
              value={formData.source}
              onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
              options={[
                { value: 'website', label: 'Website' },
                { value: 'linkedin', label: 'LinkedIn' },
                { value: 'referral', label: 'Referral' },
                { value: 'cold-email', label: 'Cold Email' },
                { value: 'trade-show', label: 'Trade Show' }
              ]}
            />
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              options={[
                { value: 'new', label: 'New' },
                { value: 'contacted', label: 'Contacted' },
                { value: 'qualified', label: 'Qualified' }
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Lead Score: {formData.score}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.score}
              onChange={(e) => setFormData(prev => ({ ...prev, score: parseInt(e.target.value) }))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Poor (0)</span>
              <span>Excellent (100)</span>
            </div>
            {formErrors.score && (
              <p className="mt-1 text-sm text-error">{formErrors.score}</p>
            )}
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
Create Lead
            </Button>
          </div>
        </form>
      </Modal>

      {/* Advanced Filter Builder Modal */}
      <FilterBuilder
        isOpen={isAdvancedFilterOpen}
        onClose={() => setIsAdvancedFilterOpen(false)}
        entityType="leads"
        onApplyFilter={handleAdvancedFilter}
      />
    </div>
  );
};

export default Leads;