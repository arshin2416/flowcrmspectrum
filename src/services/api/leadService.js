export const leadService = {
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
          { field: { Name: "source" } },
          { field: { Name: "status" } },
          { field: { Name: "score" } },
          { field: { Name: "created_at" } },
          { field: { Name: "contact_id" } },
          { field: { Name: "CreatedOn" } }
        ],
        orderBy: [
          { fieldName: "score", sorttype: "DESC" }
        ]
      };
      
      const response = await apperClient.fetchRecords('lead', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return (response.data || []).map(lead => ({
        Id: lead.Id,
        source: lead.source,
        status: lead.status,
        score: lead.score,
        createdAt: lead.created_at || lead.CreatedOn,
        contactId: lead.contact_id
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching leads:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error fetching leads:", error.message);
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
          { field: { Name: "source" } },
          { field: { Name: "status" } },
          { field: { Name: "score" } },
          { field: { Name: "created_at" } },
          { field: { Name: "contact_id" } }
        ]
      };
      
      const response = await apperClient.getRecordById('lead', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (!response.data) {
        throw new Error('Lead not found');
      }
      
      const lead = response.data;
      return {
        Id: lead.Id,
        source: lead.source,
        status: lead.status,
        score: lead.score,
        createdAt: lead.created_at,
        contactId: lead.contact_id
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching lead with ID ${id}:`, error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error(`Error fetching lead with ID ${id}:`, error.message);
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
          { field: { Name: "source" } },
          { field: { Name: "status" } },
          { field: { Name: "score" } },
          { field: { Name: "created_at" } },
          { field: { Name: "contact_id" } }
        ],
        where: [
          {
            FieldName: "contact_id",
            Operator: "EqualTo",
            Values: [parseInt(contactId)]
          }
        ]
      };
      
      const response = await apperClient.fetchRecords('lead', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return (response.data || []).map(lead => ({
        Id: lead.Id,
        source: lead.source,
        status: lead.status,
        score: lead.score,
        createdAt: lead.created_at,
        contactId: lead.contact_id
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching leads by contact:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error fetching leads by contact:", error.message);
        throw error;
      }
    }
  },

  async create(leadData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const dbData = {
        Name: `Lead for Contact ${leadData.contactId}`,
        source: leadData.source,
        status: leadData.status,
        score: parseInt(leadData.score),
        created_at: new Date().toISOString(),
        contact_id: parseInt(leadData.contactId)
      };
      
      const params = {
        records: [dbData]
      };
      
      const response = await apperClient.createRecord('lead', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} leads:${JSON.stringify(failedRecords)}`);
          throw new Error('Failed to create lead');
        }
        
        if (successfulRecords.length > 0) {
          const newLead = successfulRecords[0].data;
          return {
            Id: newLead.Id,
            source: newLead.source,
            status: newLead.status,
            score: newLead.score,
            createdAt: newLead.created_at,
            contactId: newLead.contact_id
          };
        }
      }
      
      throw new Error('No lead created');
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating lead:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error creating lead:", error.message);
        throw error;
      }
    }
  },

  async update(id, leadData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const dbData = {
        Id: parseInt(id),
        source: leadData.source,
        status: leadData.status,
        score: parseInt(leadData.score),
        contact_id: parseInt(leadData.contactId)
      };
      
      const params = {
        records: [dbData]
      };
      
      const response = await apperClient.updateRecord('lead', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to update ${failedRecords.length} leads:${JSON.stringify(failedRecords)}`);
          throw new Error('Failed to update lead');
        }
        
        if (successfulRecords.length > 0) {
          const updatedLead = successfulRecords[0].data;
          return {
            Id: updatedLead.Id,
            source: updatedLead.source,
            status: updatedLead.status,
            score: updatedLead.score,
            createdAt: updatedLead.created_at,
            contactId: updatedLead.contact_id
          };
        }
      }
      
      throw new Error('No lead updated');
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating lead:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error updating lead:", error.message);
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
      
      const response = await apperClient.deleteRecord('lead', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return true;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting lead:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error deleting lead:", error.message);
        throw error;
      }
    }
  }
};