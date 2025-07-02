import savedFiltersData from '@/services/mockData/savedFilters.json';

let savedFilters = [...savedFiltersData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const filterService = {
  async getAll() {
    await delay(300);
    return [...savedFilters];
  },

  async getById(id) {
    await delay(200);
    const filter = savedFilters.find(f => f.Id === parseInt(id));
    if (!filter) {
      throw new Error('Filter not found');
    }
    return { ...filter };
  },

  async getByEntityType(entityType) {
    await delay(200);
    return savedFilters.filter(f => f.entityType === entityType);
  },

  async create(filterData) {
    await delay(400);
    const maxId = Math.max(...savedFilters.map(f => f.Id), 0);
    const newFilter = {
      ...filterData,
      Id: maxId + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    savedFilters.push(newFilter);
    return { ...newFilter };
  },

  async update(id, filterData) {
    await delay(300);
    const index = savedFilters.findIndex(f => f.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Filter not found');
    }
    savedFilters[index] = { 
      ...savedFilters[index], 
      ...filterData,
      updatedAt: new Date().toISOString()
    };
    return { ...savedFilters[index] };
  },

  async delete(id) {
    await delay(250);
    const index = savedFilters.findIndex(f => f.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Filter not found');
    }
    savedFilters.splice(index, 1);
    return true;
  },

  // Apply filter criteria to data
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