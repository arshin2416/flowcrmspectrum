import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import EmailComposer from "@/components/organisms/EmailComposer";
import Badge from "@/components/atoms/Badge";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Empty from "@/components/ui/Empty";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import Deals from "@/components/pages/Deals";
import Modal from "@/components/molecules/Modal";
import tasksData from "@/services/mockData/tasks.json";
import savedFiltersData from "@/services/mockData/savedFilters.json";
import dealsData from "@/services/mockData/deals.json";
import leadsData from "@/services/mockData/leads.json";
import contactsData from "@/services/mockData/contacts.json";
import activitiesData from "@/services/mockData/activities.json";
import emailsData from "@/services/mockData/emails.json";
import { contactService } from "@/services/api/contactService";
import { taskService } from "@/services/api/taskService";
import { activityService } from "@/services/api/activityService";
import { dealService } from "@/services/api/dealService";

const ContactDetail = () => {
  const { id } = useParams();
  const [contact, setContact] = useState(null);
  const [deals, setDeals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'prospect',
    tags: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadContactData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [contactData, dealsData, tasksData, activitiesData] = await Promise.all([
        contactService.getById(id),
        dealService.getByContactId(id),
        taskService.getByContactId(id),
        activityService.getByContactId(id)
      ]);

      setContact(contactData);
      setDeals(dealsData);
      setTasks(tasksData);
      setActivities(activitiesData);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load contact details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContactData();
  }, [id]);

  const handleCompleteTask = async (taskId) => {
    try {
      await taskService.markComplete(taskId);
      setTasks(prev => prev.map(task => 
        task.Id === taskId ? { ...task, status: 'completed' } : task
      ));
      toast.success('Task completed');
    } catch (err) {
      toast.error('Failed to complete task');
    }
};

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    if (!formData.phone.trim()) errors.phone = 'Phone is required';
    if (!formData.company.trim()) errors.company = 'Company is required';
    return errors;
  };

  const handleEdit = () => {
    // Pre-populate form with current contact data
    setFormData({
      name: contact.name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      company: contact.company || '',
      status: contact.status || 'prospect',
      tags: contact.tags || []
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    try {
      setIsSubmitting(true);
      const updatedContact = await contactService.update(contact.Id, formData);
      
      // Update local contact state
      setContact(updatedContact);
      setIsEditModalOpen(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        status: 'prospect',
        tags: []
      });
      toast.success('Contact updated successfully');
    } catch (err) {
      toast.error('Failed to update contact');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadContactData} />;
  if (!contact) return <Error message="Contact not found" />;

  const statusColors = {
    active: 'success',
    prospect: 'warning',
    inactive: 'default'
  };

  const priorityColors = {
    high: 'danger',
    medium: 'warning',
    low: 'success'
  };

  const stageColors = {
    'discovery': 'default',
    'qualified': 'info',
    'proposal': 'warning',
    'negotiation': 'warning',
    'closed-won': 'success',
    'closed-lost': 'danger'
  };

  const activityIcons = {
    email: 'Mail',
    call: 'Phone',
    meeting: 'Calendar',
    note: 'FileText'
  };

const tabs = [
    { id: 'overview', label: 'Overview', icon: 'User' },
    { id: 'deals', label: `Deals (${deals.length})`, icon: 'TrendingUp' },
    { id: 'tasks', label: `Tasks (${tasks.filter(t => t.status === 'pending').length})`, icon: 'CheckSquare' },
    { id: 'activities', label: `Activities (${activities.length})`, icon: 'Clock' },
    { id: 'emails', label: 'Emails', icon: 'Mail' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/contacts">
            <Button variant="ghost" size="sm" icon="ArrowLeft" />
          </Link>
          <div className="flex items-center space-x-4">
<div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">
                {contact.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{contact.name}</h1>
              <p className="text-slate-600">{contact.company}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={statusColors[contact.status]} className="capitalize">
            {contact.status}
          </Badge>
<Button 
            variant="primary" 
            icon="Edit"
            onClick={handleEdit}
          >
            Edit Contact
          </Button>
        </div>
      </div>

      {/* Contact Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
<motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setIsEmailModalOpen(true)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ApperIcon name="Mail" className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Email</p>
                <p className="text-sm font-medium text-slate-900">{contact.email}</p>
              </div>
            </div>
            <ApperIcon name="ExternalLink" className="w-4 h-4 text-slate-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="Phone" className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Phone</p>
              <p className="text-sm font-medium text-slate-900">{contact.phone}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="Calendar" className="w-5 h-5 text-purple-600" />
            </div>
<div>
              <p className="text-sm text-slate-500">Member Since</p>
              <p className="text-sm font-medium text-slate-900">
                {contact.createdAt ? format(new Date(contact.createdAt), 'MMM dd, yyyy') : 'N/A'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }
                `}
              >
                <ApperIcon name={tab.icon} className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {contact.tags?.map((tag, index) => (
                        <Badge key={index} variant="default" size="sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <Badge variant={statusColors[contact.status]} className="capitalize">
                      {contact.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-slate-900">{deals.length}</div>
                  <div className="text-sm text-slate-600">Total Deals</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-slate-900">
                    ${deals.reduce((sum, deal) => sum + deal.value, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-600">Deal Value</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-slate-900">{activities.length}</div>
                  <div className="text-sm text-slate-600">Interactions</div>
                </div>
              </div>
            </div>
          )}

          {/* Deals Tab */}
          {activeTab === 'deals' && (
            <div className="space-y-4">
              {deals.length === 0 ? (
                <Empty
                  title="No deals found"
                  message="Start tracking deals for this contact."
                  actionLabel="Create Deal"
                  icon="TrendingUp"
                />
              ) : (
                deals.map((deal) => (
                  <motion.div
                    key={deal.Id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-slate-900">{deal.title}</h4>
                        <p className="text-sm text-slate-500">
                          Expected close: {format(new Date(deal.expectedClose), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-slate-900">
                          ${deal.value.toLocaleString()}
                        </div>
                        <Badge variant={stageColors[deal.stage]} size="sm" className="capitalize">
                          {deal.stage.replace('-', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              {tasks.length === 0 ? (
                <Empty
                  title="No tasks found"
                  message="Create tasks to track follow-ups and activities."
                  actionLabel="Add Task"
                  icon="CheckSquare"
                />
              ) : (
                tasks.map((task) => (
                  <motion.div
                    key={task.Id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleCompleteTask(task.Id)}
                          disabled={task.status === 'completed'}
                          className={`
                            w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                            ${task.status === 'completed'
                              ? 'bg-green-500 border-green-500'
                              : 'border-slate-300 hover:border-green-500'
                            }
                          `}
                        >
                          {task.status === 'completed' && (
                            <ApperIcon name="Check" className="w-3 h-3 text-white" />
                          )}
                        </button>
                        <div>
                          <h4 className={`font-medium ${task.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                            {task.title}
                          </h4>
                          <p className="text-sm text-slate-500">
                            Due: {format(new Date(task.dueDate), 'MMM dd, yyyy h:mm a')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={priorityColors[task.priority]} size="sm" className="capitalize">
                          {task.priority}
                        </Badge>
                        <span className="text-sm text-slate-500">{task.assignee}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {/* Activities Tab */}
          {activeTab === 'activities' && (
            <div className="space-y-4">
              {activities.length === 0 ? (
                <Empty
                  title="No activities found"
                  message="Activity history will appear here as you interact with this contact."
                  icon="Clock"
                />
              ) : (
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                  {activities.map((activity, index) => (
                    <motion.div
                      key={activity.Id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative flex items-start space-x-4 pb-6"
                    >
                      <div className="w-12 h-12 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center">
                        <ApperIcon 
                          name={activityIcons[activity.type] || 'FileText'} 
                          className="w-5 h-5 text-slate-600" 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="bg-white border border-slate-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-900 capitalize">
                              {activity.type}
                            </span>
                            <span className="text-xs text-slate-500">
                              {format(new Date(activity.timestamp), 'MMM dd, yyyy h:mm a')}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">{activity.description}</p>
                          {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                            <div className="mt-2 text-xs text-slate-500">
                              {JSON.stringify(activity.metadata, null, 2)}
                            </div>
                          )}
                        </div>
</div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Emails Tab */}
          {activeTab === 'emails' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-medium text-slate-900">Email Conversations</h4>
                <Button 
                  variant="primary" 
                  size="sm" 
                  icon="Plus"
                  onClick={() => setIsEmailModalOpen(true)}
                >
                  Compose Email
                </Button>
              </div>
              <div className="text-center py-8">
                <ApperIcon name="Mail" className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">Email conversations will appear here</p>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  icon="Mail"
                  className="mt-4"
                  onClick={() => setIsEmailModalOpen(true)}
                >
                  Send First Email
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Email Composer Modal */}
      {contact && (
        <EmailComposer
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          contact={contact}
        />
      )}

      {/* Edit Contact Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Contact"
        size="md"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              error={formErrors.name}
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              error={formErrors.email}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              error={formErrors.phone}
              required
            />
            <Input
              label="Company"
              value={formData.company}
              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              error={formErrors.company}
              required
            />
          </div>

          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
            options={[
              { value: 'prospect', label: 'Prospect' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ]}
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
            >
              Update Contact
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ContactDetail;