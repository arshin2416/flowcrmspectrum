export const taskService = {
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
          { field: { Name: "due_date" } },
          { field: { Name: "priority" } },
          { field: { Name: "status" } },
          { field: { Name: "assignee" } },
          { field: { Name: "contact_id" } },
          { field: { Name: "CreatedOn" } }
        ],
        orderBy: [
          { fieldName: "due_date", sorttype: "ASC" }
        ]
      };
      
      const response = await apperClient.fetchRecords('task', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      // Map database fields to UI format
      return (response.data || []).map(task => ({
        Id: task.Id,
        title: task.title,
        dueDate: task.due_date,
        priority: task.priority,
        status: task.status,
        assignee: task.assignee,
        contactId: task.contact_id
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching tasks:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error fetching tasks:", error.message);
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
          { field: { Name: "due_date" } },
          { field: { Name: "priority" } },
          { field: { Name: "status" } },
          { field: { Name: "assignee" } },
          { field: { Name: "contact_id" } },
          { field: { Name: "CreatedOn" } }
        ]
      };
      
      const response = await apperClient.getRecordById('task', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (!response.data) {
        throw new Error('Task not found');
      }
      
      const task = response.data;
      return {
        Id: task.Id,
        title: task.title,
        dueDate: task.due_date,
        priority: task.priority,
        status: task.status,
        assignee: task.assignee,
        contactId: task.contact_id
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching task with ID ${id}:`, error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error(`Error fetching task with ID ${id}:`, error.message);
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
          { field: { Name: "due_date" } },
          { field: { Name: "priority" } },
          { field: { Name: "status" } },
          { field: { Name: "assignee" } },
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
          { fieldName: "due_date", sorttype: "ASC" }
        ]
      };
      
      const response = await apperClient.fetchRecords('task', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return (response.data || []).map(task => ({
        Id: task.Id,
        title: task.title,
        dueDate: task.due_date,
        priority: task.priority,
        status: task.status,
        assignee: task.assignee,
        contactId: task.contact_id
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching tasks by contact:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error fetching tasks by contact:", error.message);
        throw error;
      }
    }
  },

  async create(taskData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const dbData = {
        Name: taskData.title,
        title: taskData.title,
        due_date: taskData.dueDate,
        priority: taskData.priority,
        status: taskData.status,
        assignee: taskData.assignee,
        contact_id: parseInt(taskData.contactId)
      };
      
      const params = {
        records: [dbData]
      };
      
      const response = await apperClient.createRecord('task', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} tasks:${JSON.stringify(failedRecords)}`);
          throw new Error('Failed to create task');
        }
        
        if (successfulRecords.length > 0) {
          const newTask = successfulRecords[0].data;
          return {
            Id: newTask.Id,
            title: newTask.title,
            dueDate: newTask.due_date,
            priority: newTask.priority,
            status: newTask.status,
            assignee: newTask.assignee,
            contactId: newTask.contact_id
          };
        }
      }
      
      throw new Error('No task created');
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating task:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error creating task:", error.message);
        throw error;
      }
    }
  },

  async update(id, taskData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const dbData = {
        Id: parseInt(id),
        title: taskData.title,
        due_date: taskData.dueDate,
        priority: taskData.priority,
        status: taskData.status,
        assignee: taskData.assignee,
        contact_id: parseInt(taskData.contactId)
      };
      
      const params = {
        records: [dbData]
      };
      
      const response = await apperClient.updateRecord('task', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to update ${failedRecords.length} tasks:${JSON.stringify(failedRecords)}`);
          throw new Error('Failed to update task');
        }
        
        if (successfulRecords.length > 0) {
          const updatedTask = successfulRecords[0].data;
          return {
            Id: updatedTask.Id,
            title: updatedTask.title,
            dueDate: updatedTask.due_date,
            priority: updatedTask.priority,
            status: updatedTask.status,
            assignee: updatedTask.assignee,
            contactId: updatedTask.contact_id
          };
        }
      }
      
      throw new Error('No task updated');
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating task:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error updating task:", error.message);
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
      
      const response = await apperClient.deleteRecord('task', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return true;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting task:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error deleting task:", error.message);
        throw error;
      }
    }
  },

  async markComplete(id) {
    return this.update(id, { status: 'completed' });
  }
};