import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Modal from '@/components/molecules/Modal';
import { emailService } from '@/services/api/emailService';

const EmailComposer = ({ isOpen, onClose, contact, threadId = null }) => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    to: contact?.email || '',
    subject: '',
    content: '',
    threadId: threadId
  });
  const [activeView, setActiveView] = useState('compose'); // 'compose' or 'thread'

  useEffect(() => {
    if (isOpen && contact) {
      setFormData(prev => ({
        ...prev,
        to: contact.email,
        subject: threadId ? '' : `Follow up - ${contact.name}`
      }));
      loadEmails();
    }
  }, [isOpen, contact, threadId]);

  const loadEmails = async () => {
    if (!contact) return;
    
    try {
      setLoading(true);
      const emailData = await emailService.getByContactId(contact.Id);
      setEmails(emailData);
    } catch (err) {
      toast.error('Failed to load email history');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!formData.content.trim() || !formData.to.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSending(true);
      const emailData = {
        ...formData,
        contactId: contact.Id,
        type: 'sent'
      };
      
      await emailService.send(emailData);
      toast.success('Email sent successfully');
      
      // Reset form and reload emails
      setFormData({
        to: contact.email,
        subject: '',
        content: '',
        threadId: null
      });
      loadEmails();
      setActiveView('thread');
    } catch (err) {
      toast.error('Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!formData.content.trim()) {
      toast.error('Cannot save empty draft');
      return;
    }

    try {
      const draftData = {
        ...formData,
        contactId: contact.Id,
        type: 'draft'
      };
      
      await emailService.saveDraft(draftData);
      toast.success('Draft saved');
    } catch (err) {
      toast.error('Failed to save draft');
    }
  };

  const handleDeleteEmail = async (emailId) => {
    if (!window.confirm('Are you sure you want to delete this email?')) return;

    try {
      await emailService.delete(emailId);
      setEmails(prev => prev.filter(e => e.Id !== emailId));
      toast.success('Email deleted');
    } catch (err) {
      toast.error('Failed to delete email');
    }
  };

  const groupedEmails = emails.reduce((acc, email) => {
    const threadId = email.threadId || email.Id;
    if (!acc[threadId]) acc[threadId] = [];
    acc[threadId].push(email);
    return acc;
  }, {});

  const sortedThreads = Object.values(groupedEmails)
    .map(thread => thread.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)))
    .sort((a, b) => new Date(b[0].timestamp) - new Date(a[0].timestamp));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Email - ${contact?.name}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* View Toggle */}
        <div className="flex space-x-2 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setActiveView('compose')}
            className={`
              flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${activeView === 'compose'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
              }
            `}
          >
            <ApperIcon name="Edit" className="w-4 h-4" />
            <span>Compose</span>
          </button>
          <button
            onClick={() => setActiveView('thread')}
            className={`
              flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${activeView === 'thread'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
              }
            `}
          >
            <ApperIcon name="MessageSquare" className="w-4 h-4" />
            <span>Thread ({emails.length})</span>
          </button>
        </div>

        {/* Compose View */}
        {activeView === 'compose' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="To"
                value={formData.to}
                onChange={(e) => setFormData(prev => ({ ...prev, to: e.target.value }))}
                required
                icon="Mail"
              />
              <Input
                label="Subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Message
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={8}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                placeholder="Type your message here..."
                required
              />
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
              <Button
                variant="secondary"
                onClick={handleSaveDraft}
                icon="Save"
                disabled={sending}
              >
                Save Draft
              </Button>
              <div className="flex space-x-3">
                <Button
                  variant="secondary"
                  onClick={onClose}
                  disabled={sending}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSend}
                  loading={sending}
                  icon="Send"
                >
                  Send Email
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Thread View */}
        {activeView === 'thread' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-slate-600">Loading email history...</p>
              </div>
            ) : sortedThreads.length === 0 ? (
              <div className="text-center py-8">
                <ApperIcon name="Mail" className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No email history with this contact</p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setActiveView('compose')}
                  className="mt-4"
                >
                  Start Conversation
                </Button>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto custom-scrollbar space-y-4">
                {sortedThreads.map((thread, threadIndex) => (
                  <div key={threadIndex} className="space-y-3">
                    {thread.map((email, emailIndex) => (
                      <motion.div
                        key={email.Id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: emailIndex * 0.1 }}
                        className={`
                          border rounded-lg p-4 ${email.type === 'sent' 
                            ? 'bg-blue-50 border-blue-200 ml-8' 
                            : 'bg-slate-50 border-slate-200 mr-8'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`
                              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                              ${email.type === 'sent' 
                                ? 'bg-blue-100 text-blue-600' 
                                : 'bg-slate-200 text-slate-600'
                              }
                            `}>
                              {email.type === 'sent' ? 'You' : contact.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">
                                {email.type === 'sent' ? 'You' : contact.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {format(new Date(email.timestamp), 'MMM dd, yyyy h:mm a')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {email.type === 'draft' && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Draft
                              </span>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              icon="Trash2"
                              onClick={() => handleDeleteEmail(email.Id)}
                            />
                          </div>
                        </div>
                        
                        {email.subject && (
                          <h4 className="text-sm font-medium text-slate-900 mb-2">
                            {email.subject}
                          </h4>
                        )}
                        
                        <div className="text-sm text-slate-700 whitespace-pre-wrap">
                          {email.content}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default EmailComposer;