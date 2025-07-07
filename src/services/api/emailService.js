export const emailService = {
  async getAll() {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "to" } },
          { field: { Name: "from" } },
          { field: { Name: "subject" } },
          { field: { Name: "content" } },
          { field: { Name: "timestamp" } },
          { field: { Name: "type" } },
          { field: { Name: "thread_id" } },
          { field: { Name: "contact_id" } },
          { field: { Name: "CreatedOn" } }
        ],
        orderBy: [
          { fieldName: "timestamp", sorttype: "DESC" }
        ]
      };
      
      const response = await apperClient.fetchRecords('email', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return (response.data || []).map(email => ({
        Id: email.Id,
        to: email.to,
        from: email.from,
        subject: email.subject,
        content: email.content,
        timestamp: email.timestamp,
        type: email.type,
        threadId: email.thread_id,
        contactId: email.contact_id
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching emails:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error fetching emails:", error.message);
        throw error;
      }
    }
  },

  async getById(id) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "to" } },
          { field: { Name: "from" } },
          { field: { Name: "subject" } },
          { field: { Name: "content" } },
          { field: { Name: "timestamp" } },
          { field: { Name: "type" } },
          { field: { Name: "thread_id" } },
          { field: { Name: "contact_id" } }
        ]
      };
      
      const response = await apperClient.getRecordById('email', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (!response.data) {
        throw new Error('Email not found');
      }
      
      const email = response.data;
      return {
        Id: email.Id,
        to: email.to,
        from: email.from,
        subject: email.subject,
        content: email.content,
        timestamp: email.timestamp,
        type: email.type,
        threadId: email.thread_id,
        contactId: email.contact_id
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching email with ID ${id}:`, error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error(`Error fetching email with ID ${id}:`, error.message);
        throw error;
      }
    }
  },

  async getByContactId(contactId) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "to" } },
          { field: { Name: "from" } },
          { field: { Name: "subject" } },
          { field: { Name: "content" } },
          { field: { Name: "timestamp" } },
          { field: { Name: "type" } },
          { field: { Name: "thread_id" } },
          { field: { Name: "contact_id" } }
        ],
        where: [
          {
            FieldName: "contact_id",
            Operator: "EqualTo",
            Values: [parseInt(contactId)]
          }
        ],
        orderBy: [
          { fieldName: "timestamp", sorttype: "DESC" }
        ]
      };
      
      const response = await apperClient.fetchRecords('email', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return (response.data || []).map(email => ({
        Id: email.Id,
        to: email.to,
        from: email.from,
        subject: email.subject,
        content: email.content,
        timestamp: email.timestamp,
        type: email.type,
        threadId: email.thread_id,
        contactId: email.contact_id
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching emails by contact:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error fetching emails by contact:", error.message);
        throw error;
      }
    }
  },

  async getThreadById(threadId) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "to" } },
          { field: { Name: "from" } },
          { field: { Name: "subject" } },
          { field: { Name: "content" } },
          { field: { Name: "timestamp" } },
          { field: { Name: "type" } },
          { field: { Name: "thread_id" } },
          { field: { Name: "contact_id" } }
        ],
        whereGroups: [
          {
            operator: "OR",
            subGroups: [
              {
                conditions: [
                  {
                    fieldName: "thread_id",
                    operator: "EqualTo",
                    values: [parseInt(threadId)]
                  }
                ]
              },
              {
                conditions: [
                  {
                    fieldName: "Id",
                    operator: "EqualTo",
                    values: [parseInt(threadId)]
                  }
                ]
              }
            ]
          }
        ],
        orderBy: [
          { fieldName: "timestamp", sorttype: "ASC" }
        ]
      };
      
      const response = await apperClient.fetchRecords('email', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return (response.data || []).map(email => ({
        Id: email.Id,
        to: email.to,
        from: email.from,
        subject: email.subject,
        content: email.content,
        timestamp: email.timestamp,
        type: email.type,
        threadId: email.thread_id,
        contactId: email.contact_id
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching email thread:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error fetching email thread:", error.message);
        throw error;
      }
    }
  },

  async send(emailData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const dbData = {
        Name: emailData.subject,
        to: emailData.to,
        from: emailData.from || 'you@company.com',
        subject: emailData.subject,
        content: emailData.content,
        timestamp: new Date().toISOString(),
        type: 'sent',
        thread_id: emailData.threadId || null,
        contact_id: parseInt(emailData.contactId)
      };
      
      const params = {
        records: [dbData]
      };
      
      const response = await apperClient.createRecord('email', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to send ${failedRecords.length} emails:${JSON.stringify(failedRecords)}`);
          throw new Error('Failed to send email');
        }
        
        if (successfulRecords.length > 0) {
          const newEmail = successfulRecords[0].data;
          return {
            Id: newEmail.Id,
            to: newEmail.to,
            from: newEmail.from,
            subject: newEmail.subject,
            content: newEmail.content,
            timestamp: newEmail.timestamp,
            type: newEmail.type,
            threadId: newEmail.thread_id,
            contactId: newEmail.contact_id
          };
        }
      }
      
      throw new Error('No email sent');
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error sending email:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error sending email:", error.message);
        throw error;
      }
    }
  },

  async saveDraft(emailData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const dbData = {
        Name: emailData.subject || 'Draft',
        to: emailData.to,
        from: emailData.from || 'you@company.com',
        subject: emailData.subject,
        content: emailData.content,
        timestamp: new Date().toISOString(),
        type: 'draft',
        contact_id: parseInt(emailData.contactId)
      };
      
      const params = {
        records: [dbData]
      };
      
      const response = await apperClient.createRecord('email', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to save ${failedRecords.length} email drafts:${JSON.stringify(failedRecords)}`);
          throw new Error('Failed to save email draft');
        }
        
        if (successfulRecords.length > 0) {
          const draftEmail = successfulRecords[0].data;
          return {
            Id: draftEmail.Id,
            to: draftEmail.to,
            from: draftEmail.from,
            subject: draftEmail.subject,
            content: draftEmail.content,
            timestamp: draftEmail.timestamp,
            type: draftEmail.type,
            threadId: draftEmail.thread_id,
            contactId: draftEmail.contact_id
          };
        }
      }
      
      throw new Error('No draft saved');
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error saving email draft:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error saving email draft:", error.message);
        throw error;
      }
    }
  },

  async delete(id) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await apperClient.deleteRecord('email', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return true;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting email:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error deleting email:", error.message);
        throw error;
      }
    }
  },

  async search(query, contactId = null) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const whereConditions = [
        {
          FieldName: "subject",
          Operator: "Contains",
          Values: [query]
        }
      ];
      
      if (contactId) {
        whereConditions.push({
          FieldName: "contact_id",
          Operator: "EqualTo",
          Values: [parseInt(contactId)]
        });
      }
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "to" } },
          { field: { Name: "from" } },
          { field: { Name: "subject" } },
          { field: { Name: "content" } },
          { field: { Name: "timestamp" } },
          { field: { Name: "type" } },
          { field: { Name: "thread_id" } },
          { field: { Name: "contact_id" } }
        ],
        where: whereConditions,
        orderBy: [
          { fieldName: "timestamp", sorttype: "DESC" }
        ]
      };
      
      const response = await apperClient.fetchRecords('email', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return (response.data || []).map(email => ({
        Id: email.Id,
        to: email.to,
        from: email.from,
        subject: email.subject,
        content: email.content,
        timestamp: email.timestamp,
        type: email.type,
        threadId: email.thread_id,
        contactId: email.contact_id
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error searching emails:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error searching emails:", error.message);
        throw error;
      }
    }
  }
};