export const contactService = {
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
          { field: { Name: "email" } },
          { field: { Name: "phone" } },
          { field: { Name: "company" } },
          { field: { Name: "status" } },
          { field: { Name: "Tags" } },
          { field: { Name: "CreatedOn" } }
        ],
        orderBy: [
          { fieldName: "CreatedOn", sorttype: "DESC" }
        ]
      };
      
      const response = await apperClient.fetchRecords('contact', params);
      
if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching contacts:", error?.response?.data?.message);
      } else {
        console.error("Error fetching contacts:", error.message);
      }
      return [];
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
          { field: { Name: "email" } },
          { field: { Name: "phone" } },
          { field: { Name: "company" } },
          { field: { Name: "status" } },
          { field: { Name: "Tags" } },
          { field: { Name: "CreatedOn" } }
        ]
      };
      
      const response = await apperClient.getRecordById('contact', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (!response.data) {
        throw new Error('Contact not found');
      }
      
      // Map database fields to UI format
      const contact = response.data;
      return {
        Id: contact.Id,
        name: contact.Name,
        email: contact.email,
        phone: contact.phone,
        company: contact.company,
        status: contact.status,
        tags: contact.Tags ? contact.Tags.split(',') : [],
        createdAt: contact.CreatedOn
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching contact with ID ${id}:`, error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error(`Error fetching contact with ID ${id}:`, error.message);
        throw error;
      }
    }
  },

  async create(contactData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      // Map UI format to database fields and include only Updateable fields
      const dbData = {
        Name: contactData.name,
        email: contactData.email,
        phone: contactData.phone,
        company: contactData.company,
        status: contactData.status,
        Tags: contactData.tags ? contactData.tags.join(',') : '',
        created_at: new Date().toISOString()
      };
      
      const params = {
        records: [dbData]
      };
      
      const response = await apperClient.createRecord('contact', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} contacts:${JSON.stringify(failedRecords)}`);
          throw new Error('Failed to create contact');
        }
        
        if (successfulRecords.length > 0) {
          const newContact = successfulRecords[0].data;
          return {
            Id: newContact.Id,
            name: newContact.Name,
            email: newContact.email,
            phone: newContact.phone,
            company: newContact.company,
            status: newContact.status,
            tags: newContact.Tags ? newContact.Tags.split(',') : [],
            createdAt: newContact.CreatedOn
          };
        }
      }
      
      throw new Error('No contact created');
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating contact:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error creating contact:", error.message);
        throw error;
      }
    }
  },

async update(id, contactData) {
    try {
      // Validate ID parameter
      const contactId = parseInt(id);
      if (!contactId || isNaN(contactId) || contactId <= 0) {
        throw new Error('Invalid contact ID provided for update operation');
      }

      // Validate contact data exists
      if (!contactData || typeof contactData !== 'object') {
        throw new Error('Invalid contact data provided for update operation');
      }

      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      // Map UI format to database fields and include only Updateable fields
      const dbData = {
        Id: contactId,
        Name: contactData.name,
        email: contactData.email,
        phone: contactData.phone,
        company: contactData.company,
        status: contactData.status,
        Tags: contactData.tags ? contactData.tags.join(',') : '',
        Owner: contactData.owner ? parseInt(contactData.owner) : null,
        people_3: contactData.people_3 ? parseInt(contactData.people_3) : null
      };


      // Validate environment variables
      if (!import.meta.env.VITE_APPER_PROJECT_ID || !import.meta.env.VITE_APPER_PUBLIC_KEY) {
        console.error('Missing Apper environment variables:', {
          projectId: !!import.meta.env.VITE_APPER_PROJECT_ID,
          publicKey: !!import.meta.env.VITE_APPER_PUBLIC_KEY
        });
        throw new Error('API configuration error. Please check environment variables.');
      }

      const params = {
        records: [dbData]
      };

      let response;
      try {
        response = await apperClient.updateRecord('contact', params);
      } catch (networkError) {
        console.error('Network error updating contact:', {
          error: networkError.message,
          stack: networkError.stack,
          contactId: id,
          projectId: import.meta.env.VITE_APPER_PROJECT_ID ? 'Set' : 'Missing',
          publicKey: import.meta.env.VITE_APPER_PUBLIC_KEY ? 'Set' : 'Missing'
        });
        
        if (networkError.message.includes('Network Error') || networkError.message.includes('fetch')) {
          throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
        } else if (networkError.message.includes('Unauthorized') || networkError.message.includes('401')) {
          throw new Error('Authentication failed. Please check your API credentials.');
        } else if (networkError.message.includes('404') || networkError.message.includes('Not Found')) {
          throw new Error('Contact not found or API endpoint unavailable.');
        } else {
          throw new Error(`Update failed: ${networkError.message}`);
        }
      }

      // Handle API response errors
      if (!response.success) {
        console.error('API error updating contact:', response.message);
        throw new Error(response.message || 'Failed to update contact');
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update contact:${JSON.stringify(failedUpdates)}`);
          const errorMessage = failedUpdates[0].message || 'Update operation failed';
          throw new Error(errorMessage);
        }
        
        if (successfulUpdates.length > 0) {
          return successfulUpdates[0].data;
        }
      }
throw new Error('No response data received from update operation');
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating contact:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error updating contact:", error.message);
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
      
      const response = await apperClient.deleteRecord('contact', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} contacts:${JSON.stringify(failedDeletions)}`);
          throw new Error('Failed to delete contact');
        }
        
        return true;
      }
      
      return true;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting contact:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error deleting contact:", error.message);
        throw error;
      }
    }
  }
};