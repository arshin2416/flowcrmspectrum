export const dealService = {
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
          { field: { Name: "title" } },
          { field: { Name: "value" } },
          { field: { Name: "stage" } },
          { field: { Name: "expected_close" } },
          { field: { Name: "probability" } },
          { field: { Name: "contact_id" } },
          { field: { Name: "CreatedOn" } }
        ],
        orderBy: [
          { fieldName: "CreatedOn", sorttype: "DESC" }
        ]
      };
      
      const response = await apperClient.fetchRecords('deal', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return (response.data || []).map(deal => ({
        Id: deal.Id,
        title: deal.title,
        value: deal.value,
        stage: deal.stage,
        expectedClose: deal.expected_close,
        probability: deal.probability,
        contactId: deal.contact_id
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching deals:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error fetching deals:", error.message);
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
          { field: { Name: "title" } },
          { field: { Name: "value" } },
          { field: { Name: "stage" } },
          { field: { Name: "expected_close" } },
          { field: { Name: "probability" } },
          { field: { Name: "contact_id" } }
        ]
      };
      
      const response = await apperClient.getRecordById('deal', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (!response.data) {
        throw new Error('Deal not found');
      }
      
      const deal = response.data;
      return {
        Id: deal.Id,
        title: deal.title,
        value: deal.value,
        stage: deal.stage,
        expectedClose: deal.expected_close,
        probability: deal.probability,
        contactId: deal.contact_id
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching deal with ID ${id}:`, error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error(`Error fetching deal with ID ${id}:`, error.message);
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
          { field: { Name: "title" } },
          { field: { Name: "value" } },
          { field: { Name: "stage" } },
          { field: { Name: "expected_close" } },
          { field: { Name: "probability" } },
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
      
      const response = await apperClient.fetchRecords('deal', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return (response.data || []).map(deal => ({
        Id: deal.Id,
        title: deal.title,
        value: deal.value,
        stage: deal.stage,
        expectedClose: deal.expected_close,
        probability: deal.probability,
        contactId: deal.contact_id
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching deals by contact:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error fetching deals by contact:", error.message);
        throw error;
      }
    }
  },

  async create(dealData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const dbData = {
        Name: dealData.title,
        title: dealData.title,
        value: parseFloat(dealData.value),
        stage: dealData.stage,
        expected_close: dealData.expectedClose,
        probability: parseInt(dealData.probability),
        contact_id: parseInt(dealData.contactId)
      };
      
      const params = {
        records: [dbData]
      };
      
      const response = await apperClient.createRecord('deal', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} deals:${JSON.stringify(failedRecords)}`);
          throw new Error('Failed to create deal');
        }
        
        if (successfulRecords.length > 0) {
          const newDeal = successfulRecords[0].data;
          return {
            Id: newDeal.Id,
            title: newDeal.title,
            value: newDeal.value,
            stage: newDeal.stage,
            expectedClose: newDeal.expected_close,
            probability: newDeal.probability,
            contactId: newDeal.contact_id
          };
        }
      }
      
      throw new Error('No deal created');
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating deal:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error creating deal:", error.message);
        throw error;
      }
    }
  },

  async update(id, dealData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const dbData = {
        Id: parseInt(id),
        title: dealData.title,
        value: parseFloat(dealData.value),
        stage: dealData.stage,
        expected_close: dealData.expectedClose,
        probability: parseInt(dealData.probability),
        contact_id: parseInt(dealData.contactId)
      };
      
      const params = {
        records: [dbData]
      };
      
      const response = await apperClient.updateRecord('deal', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to update ${failedRecords.length} deals:${JSON.stringify(failedRecords)}`);
          throw new Error('Failed to update deal');
        }
        
        if (successfulRecords.length > 0) {
          const updatedDeal = successfulRecords[0].data;
          return {
            Id: updatedDeal.Id,
            title: updatedDeal.title,
            value: updatedDeal.value,
            stage: updatedDeal.stage,
            expectedClose: updatedDeal.expected_close,
            probability: updatedDeal.probability,
            contactId: updatedDeal.contact_id
          };
        }
      }
      
      throw new Error('No deal updated');
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating deal:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error updating deal:", error.message);
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
      
      const response = await apperClient.deleteRecord('deal', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return true;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting deal:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error deleting deal:", error.message);
        throw error;
      }
    }
  },

  async updateStage(id, stage) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const dbData = {
        Id: parseInt(id),
        stage: stage
      };
      
      const params = {
        records: [dbData]
      };
      
      const response = await apperClient.updateRecord('deal', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to update ${failedRecords.length} deal stages:${JSON.stringify(failedRecords)}`);
          throw new Error('Failed to update deal stage');
        }
        
        if (successfulRecords.length > 0) {
          const updatedDeal = successfulRecords[0].data;
          return {
            Id: updatedDeal.Id,
            title: updatedDeal.title,
            value: updatedDeal.value,
            stage: updatedDeal.stage,
            expectedClose: updatedDeal.expected_close,
            probability: updatedDeal.probability,
            contactId: updatedDeal.contact_id
          };
        }
      }
      
      throw new Error('No deal updated');
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating deal stage:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error updating deal stage:", error.message);
        throw error;
      }
    }
  }
};