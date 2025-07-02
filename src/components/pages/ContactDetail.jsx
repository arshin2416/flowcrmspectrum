import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import { contactService } from '@/services/api/contactService';
import { dealService } from '@/services/api/dealService';
import { taskService } from '@/services/api/taskService';
import { activityService } from '@/services/api/activityService';

const ContactDetail = () => {
  const { id } = useParams();
  const [contact, setContact] = useState(null);
  const [deals, setDeals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

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
    { id: 'activities', label: `Activities (${activities.length})`, icon: 'Clock' }
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
                {contact.name.charAt(0).toUpperCase()}
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
          <Button variant="primary" icon="Edit">
            Edit Contact
          </Button>
        </div>
      </div>

      {/* Contact Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="Mail" className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Email</p>
              <p className="text-sm font-medium text-slate-900">{contact.email}</p>
            </div>
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
                {format(new Date(contact.createdAt), 'MMM dd, yyyy')}
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
                      {contact.tags.map((tag, index) => (
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
        </div>
      </div>
    </div>
  );
};

export default ContactDetail;