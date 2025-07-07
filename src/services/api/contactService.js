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
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching contacts:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error fetching contacts:", error.message);
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
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      // Map UI format to database fields and include only Updateable fields
      const dbData = {
        Id: parseInt(id),
        Name: contactData.name,
        email: contactData.email,
        phone: contactData.phone,
        company: contactData.company,
        status: contactData.status,
        Tags: contactData.tags ? contactData.tags.join(',') : ''
      };
      
      const params = {
        records: [dbData]
      };
      
      const response = await apperClient.updateRecord('contact', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to update ${failedRecords.length} contacts:${JSON.stringify(failedRecords)}`);
          throw new Error('Failed to update contact');
        }
        
        if (successfulRecords.length > 0) {
          const updatedContact = successfulRecords[0].data;
          return {
            Id: updatedContact.Id,
            name: updatedContact.Name,
            email: updatedContact.email,
            phone: updatedContact.phone,
            company: updatedContact.company,
            status: updatedContact.status,
            tags: updatedContact.Tags ? updatedContact.Tags.split(',') : [],
            createdAt: updatedContact.CreatedOn
          };
        }
      }
      
      throw new Error('No contact updated');
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