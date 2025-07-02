import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Button from '@/components/atoms/Button';
import { contactService } from '@/services/api/contactService';
import { dealService } from '@/services/api/dealService';
import { taskService } from '@/services/api/taskService';
import { leadService } from '@/services/api/leadService';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    contacts: [],
    deals: [],
    tasks: [],
    leads: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [contacts, deals, tasks, leads] = await Promise.all([
        contactService.getAll(),
        dealService.getAll(),
        taskService.getAll(),
        leadService.getAll()
      ]);

      setDashboardData({ contacts, deals, tasks, leads });
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) return <Loading type="cards" />;
  if (error) return <Error message={error} onRetry={loadDashboardData} />;

  const { contacts, deals, tasks, leads } = dashboardData;

  // Calculate metrics
  const totalRevenue = deals
    .filter(deal => deal.stage === 'closed-won')
    .reduce((sum, deal) => sum + deal.value, 0);

  const pipelineValue = deals
    .filter(deal => deal.stage !== 'closed-won' && deal.stage !== 'closed-lost')
    .reduce((sum, deal) => sum + deal.value, 0);

  const activeLeads = leads.filter(lead => lead.status !== 'qualified').length;
  
  const overdueTasks = tasks.filter(task => 
    task.status === 'pending' && new Date(task.dueDate) < new Date()
  ).length;

  const dealsByStage = deals.reduce((acc, deal) => {
    acc[deal.stage] = (acc[deal.stage] || 0) + 1;
    return acc;
  }, {});

  const recentTasks = tasks
    .filter(task => task.status === 'pending')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  const stats = [
    {
      name: 'Total Contacts',
      value: contacts.length,
      icon: 'Users',
      color: 'from-blue-500 to-blue-600',
      change: '+12%'
    },
    {
      name: 'Pipeline Value',
      value: `$${(pipelineValue / 1000).toFixed(0)}K`,
      icon: 'TrendingUp',
      color: 'from-emerald-500 to-emerald-600',
      change: '+8%'
    },
    {
      name: 'Active Leads',
      value: activeLeads,
      icon: 'Target',
      color: 'from-purple-500 to-purple-600',
      change: '+23%'
    },
    {
      name: 'Revenue (MTD)',
      value: `$${(totalRevenue / 1000).toFixed(0)}K`,
      icon: 'DollarSign',
      color: 'from-amber-500 to-amber-600',
      change: '+15%'
    }
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">Welcome back! Here's what's happening with your sales.</p>
        </div>
        <Button variant="primary" icon="Plus">
          Quick Action
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{stat.name}</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{stat.value}</p>
                <p className="text-sm text-emerald-600 mt-1">{stat.change} from last month</p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                <ApperIcon name={stat.icon} className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pipeline Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Pipeline Overview</h3>
            <Button variant="ghost" size="sm" icon="MoreHorizontal" />
          </div>
          
          <div className="space-y-4">
            {Object.entries(dealsByStage).map(([stage, count]) => {
              const stageColors = {
                'discovery': 'bg-slate-500',
                'qualified': 'bg-blue-500',
                'proposal': 'bg-yellow-500',
                'negotiation': 'bg-orange-500',
                'closed-won': 'bg-emerald-500',
                'closed-lost': 'bg-red-500'
              };
              
              return (
                <div key={stage} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${stageColors[stage] || 'bg-gray-500'}`}></div>
                    <span className="text-sm font-medium text-slate-700 capitalize">
                      {stage.replace('-', ' ')}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{count}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Upcoming Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Upcoming Tasks</h3>
            {overdueTasks > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {overdueTasks} overdue
              </span>
            )}
          </div>
          
          <div className="space-y-3">
            {recentTasks.map((task) => {
              const isOverdue = new Date(task.dueDate) < new Date();
              const priorityColors = {
                high: 'text-red-600',
                medium: 'text-yellow-600',
                low: 'text-green-600'
              };
              
              return (
                <div key={task.Id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className={`w-2 h-2 rounded-full ${isOverdue ? 'bg-red-500' : 'bg-slate-300'}`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{task.title}</p>
                    <p className="text-xs text-slate-500">
                      Due {format(new Date(task.dueDate), 'MMM dd, h:mm a')}
                    </p>
                  </div>
                  <span className={`text-xs font-medium ${priorityColors[task.priority]} capitalize`}>
                    {task.priority}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="primary" icon="UserPlus" className="justify-center py-4">
            Add New Contact
          </Button>
          <Button variant="secondary" icon="Plus" className="justify-center py-4">
            Create Deal
          </Button>
          <Button variant="secondary" icon="CheckSquare" className="justify-center py-4">
            Add Task
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;