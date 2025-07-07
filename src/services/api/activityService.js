export const activityService = {
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
          { field: { Name: "type" } },
          { field: { Name: "description" } },
          { field: { Name: "timestamp" } },
          { field: { Name: "metadata" } },
          { field: { Name: "contact_id" } },
          { field: { Name: "CreatedOn" } }
        ],
        orderBy: [
          { fieldName: "timestamp", sorttype: "DESC" }
        ]
      };
      
      const response = await apperClient.fetchRecords('app_Activity', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return (response.data || []).map(activity => ({
        Id: activity.Id,
        type: activity.type,
        description: activity.description,
        timestamp: activity.timestamp,
        metadata: activity.metadata ? JSON.parse(activity.metadata) : {},
        contactId: activity.contact_id
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching activities:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error fetching activities:", error.message);
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
          { field: { Name: "type" } },
          { field: { Name: "description" } },
          { field: { Name: "timestamp" } },
          { field: { Name: "metadata" } },
          { field: { Name: "contact_id" } }
        ]
      };
      
      const response = await apperClient.getRecordById('app_Activity', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (!response.data) {
        throw new Error('Activity not found');
      }
      
      const activity = response.data;
      return {
        Id: activity.Id,
        type: activity.type,
        description: activity.description,
        timestamp: activity.timestamp,
        metadata: activity.metadata ? JSON.parse(activity.metadata) : {},
        contactId: activity.contact_id
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching activity with ID ${id}:`, error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error(`Error fetching activity with ID ${id}:`, error.message);
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
          { field: { Name: "type" } },
          { field: { Name: "description" } },
          { field: { Name: "timestamp" } },
          { field: { Name: "metadata" } },
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
      
      const response = await apperClient.fetchRecords('app_Activity', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return (response.data || []).map(activity => ({
        Id: activity.Id,
        type: activity.type,
        description: activity.description,
        timestamp: activity.timestamp,
        metadata: activity.metadata ? JSON.parse(activity.metadata) : {},
        contactId: activity.contact_id
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching activities by contact:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error fetching activities by contact:", error.message);
        throw error;
      }
    }
  },

  async create(activityData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const dbData = {
        Name: activityData.description,
        type: activityData.type,
        description: activityData.description,
        timestamp: activityData.timestamp || new Date().toISOString(),
        metadata: JSON.stringify(activityData.metadata || {}),
        contact_id: parseInt(activityData.contactId)
      };
      
      const params = {
        records: [dbData]
      };
      
      const response = await apperClient.createRecord('app_Activity', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} activities:${JSON.stringify(failedRecords)}`);
          throw new Error('Failed to create activity');
        }
        
        if (successfulRecords.length > 0) {
          const newActivity = successfulRecords[0].data;
          return {
            Id: newActivity.Id,
            type: newActivity.type,
            description: newActivity.description,
            timestamp: newActivity.timestamp,
            metadata: newActivity.metadata ? JSON.parse(newActivity.metadata) : {},
            contactId: newActivity.contact_id
          };
        }
      }
      
      throw new Error('No activity created');
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating activity:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error creating activity:", error.message);
        throw error;
      }
    }
  },

  async update(id, activityData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const dbData = {
        Id: parseInt(id),
        type: activityData.type,
        description: activityData.description,
        timestamp: activityData.timestamp,
        metadata: JSON.stringify(activityData.metadata || {}),
        contact_id: parseInt(activityData.contactId)
      };
      
      const params = {
        records: [dbData]
      };
      
      const response = await apperClient.updateRecord('app_Activity', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to update ${failedRecords.length} activities:${JSON.stringify(failedRecords)}`);
          throw new Error('Failed to update activity');
        }
        
        if (successfulRecords.length > 0) {
          const updatedActivity = successfulRecords[0].data;
          return {
            Id: updatedActivity.Id,
            type: updatedActivity.type,
            description: updatedActivity.description,
            timestamp: updatedActivity.timestamp,
            metadata: updatedActivity.metadata ? JSON.parse(updatedActivity.metadata) : {},
            contactId: updatedActivity.contact_id
          };
        }
      }
      
      throw new Error('No activity updated');
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating activity:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error updating activity:", error.message);
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
      
      const response = await apperClient.deleteRecord('app_Activity', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return true;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting activity:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error deleting activity:", error.message);
        throw error;
      }
    }
  }
};