export const filterService = {
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
          { field: { Name: "description" } },
          { field: { Name: "entity_type" } },
          { field: { Name: "criteria" } },
          { field: { Name: "created_at" } },
          { field: { Name: "updated_at" } },
          { field: { Name: "CreatedOn" } }
        ],
        orderBy: [
          { fieldName: "created_at", sorttype: "DESC" }
        ]
      };
      
      const response = await apperClient.fetchRecords('saved_filter', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return (response.data || []).map(filter => ({
        Id: filter.Id,
        name: filter.Name,
        description: filter.description,
        entityType: filter.entity_type,
        criteria: filter.criteria ? JSON.parse(filter.criteria) : [],
        createdAt: filter.created_at || filter.CreatedOn,
        updatedAt: filter.updated_at
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching filters:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error fetching filters:", error.message);
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
          { field: { Name: "description" } },
          { field: { Name: "entity_type" } },
          { field: { Name: "criteria" } },
          { field: { Name: "created_at" } },
          { field: { Name: "updated_at" } }
        ]
      };
      
      const response = await apperClient.getRecordById('saved_filter', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (!response.data) {
        throw new Error('Filter not found');
      }
      
      const filter = response.data;
      return {
        Id: filter.Id,
        name: filter.Name,
        description: filter.description,
        entityType: filter.entity_type,
        criteria: filter.criteria ? JSON.parse(filter.criteria) : [],
        createdAt: filter.created_at,
        updatedAt: filter.updated_at
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching filter with ID ${id}:`, error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error(`Error fetching filter with ID ${id}:`, error.message);
        throw error;
      }
    }
  },

  async getByEntityType(entityType) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "description" } },
          { field: { Name: "entity_type" } },
          { field: { Name: "criteria" } },
          { field: { Name: "created_at" } },
          { field: { Name: "updated_at" } }
        ],
        where: [
          {
            FieldName: "entity_type",
            Operator: "EqualTo",
            Values: [entityType]
          }
        ]
      };
      
      const response = await apperClient.fetchRecords('saved_filter', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return (response.data || []).map(filter => ({
        Id: filter.Id,
        name: filter.Name,
        description: filter.description,
        entityType: filter.entity_type,
        criteria: filter.criteria ? JSON.parse(filter.criteria) : [],
        createdAt: filter.created_at,
        updatedAt: filter.updated_at
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching filters by entity type:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error fetching filters by entity type:", error.message);
        throw error;
      }
    }
  },

  async create(filterData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const dbData = {
        Name: filterData.name,
        description: filterData.description,
        entity_type: filterData.entityType,
        criteria: JSON.stringify(filterData.criteria || []),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const params = {
        records: [dbData]
      };
      
      const response = await apperClient.createRecord('saved_filter', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} filters:${JSON.stringify(failedRecords)}`);
          throw new Error('Failed to create filter');
        }
        
        if (successfulRecords.length > 0) {
          const newFilter = successfulRecords[0].data;
          return {
            Id: newFilter.Id,
            name: newFilter.Name,
            description: newFilter.description,
            entityType: newFilter.entity_type,
            criteria: newFilter.criteria ? JSON.parse(newFilter.criteria) : [],
            createdAt: newFilter.created_at,
            updatedAt: newFilter.updated_at
          };
        }
      }
      
      throw new Error('No filter created');
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating filter:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error creating filter:", error.message);
        throw error;
      }
    }
  },

  async update(id, filterData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const dbData = {
        Id: parseInt(id),
        Name: filterData.name,
        description: filterData.description,
        entity_type: filterData.entityType,
        criteria: JSON.stringify(filterData.criteria || []),
        updated_at: new Date().toISOString()
      };
      
      const params = {
        records: [dbData]
      };
      
      const response = await apperClient.updateRecord('saved_filter', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to update ${failedRecords.length} filters:${JSON.stringify(failedRecords)}`);
          throw new Error('Failed to update filter');
        }
        
        if (successfulRecords.length > 0) {
          const updatedFilter = successfulRecords[0].data;
          return {
            Id: updatedFilter.Id,
            name: updatedFilter.Name,
            description: updatedFilter.description,
            entityType: updatedFilter.entity_type,
            criteria: updatedFilter.criteria ? JSON.parse(updatedFilter.criteria) : [],
            createdAt: updatedFilter.created_at,
            updatedAt: updatedFilter.updated_at
          };
        }
      }
      
      throw new Error('No filter updated');
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating filter:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error updating filter:", error.message);
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
      
      const response = await apperClient.deleteRecord('saved_filter', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return true;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting filter:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error deleting filter:", error.message);
        throw error;
      }
    }
  },

  // Apply filter criteria to data (maintained for client-side filtering)
  applyFilter(data, criteria, entityType) {
    if (!criteria || criteria.length === 0) return data;

    return data.filter(item => {
      return criteria.every(criterion => {
        const { field, operator, value, value2 } = criterion;
        let itemValue = this.getNestedValue(item, field);

        // Handle null/undefined values
        if (itemValue === null || itemValue === undefined) {
          return false;
        }

        // Convert to string for text operations
        if (typeof itemValue !== 'string' && ['contains', 'equals', 'starts_with', 'ends_with', 'not_contains'].includes(operator)) {
          itemValue = String(itemValue);
        }

        switch (operator) {
          case 'contains':
            return itemValue.toLowerCase().includes(value.toLowerCase());
          case 'equals':
            return itemValue === value || String(itemValue) === String(value);
          case 'starts_with':
            return itemValue.toLowerCase().startsWith(value.toLowerCase());
          case 'ends_with':
            return itemValue.toLowerCase().endsWith(value.toLowerCase());
          case 'not_contains':
            return !itemValue.toLowerCase().includes(value.toLowerCase());
          case 'not_equals':
            return itemValue !== value && String(itemValue) !== String(value);
          case 'greater_than':
            return parseFloat(itemValue) > parseFloat(value);
          case 'less_than':
            return parseFloat(itemValue) < parseFloat(value);
          case 'greater_equal':
            return parseFloat(itemValue) >= parseFloat(value);
          case 'less_equal':
            return parseFloat(itemValue) <= parseFloat(value);
          case 'before':
            return new Date(itemValue) < new Date(value);
          case 'after':
            return new Date(itemValue) > new Date(value);
          case 'between':
            if (field.includes('Date') || field === 'createdAt' || field === 'expectedClose') {
              const itemDate = new Date(itemValue);
              const startDate = new Date(value);
              const endDate = new Date(value2);
              return itemDate >= startDate && itemDate <= endDate;
            } else {
              const numValue = parseFloat(itemValue);
              const startValue = parseFloat(value);
              const endValue = parseFloat(value2);
              return numValue >= startValue && numValue <= endValue;
            }
          default:
            return true;
        }
      });
    });
  },

  // Helper function to get nested values (e.g., 'contact.name')
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
};