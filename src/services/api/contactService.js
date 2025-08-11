import { convertFileSize } from '@/js/utils';
import { FileUploadUtils } from '@/js/fileUploadUtils';

// Utility functions for people field handling
const PeopleFieldUtils = {
  /**
   * Transform people data from API format to UI format
   * @param {Array} apiPeople - People data from API
   * @returns {Array} - UI formatted people data
   */
  toUIFormat: (apiPeople) => {
    if (!apiPeople || !Array.isArray(apiPeople)) return [];
    
    return apiPeople.map(person => ({
      Id: person.User.Id,
      FirstName: person.User.FirstName || person.User.Name || '',
      LastName: person.User.LastName || '',
      Email: person.User.Email || '',
      // Keep reference to original data for updates
      _originalData: person
    }));
  },

  /**
   * Transform people data from UI format to API format for creating records
   * @param {Array} uiPeople - People data from UI
   * @returns {Array} - API formatted people data for create
   */
  toCreateFormat: (uiPeople) => {
    if (!uiPeople || !Array.isArray(uiPeople)) return null;
    if (uiPeople.length === 0) return null;
    
    return uiPeople.map(person => ({
      User: person.Id
    }));
  },

  /**
   * Transform people data from UI format to API format for updating records
   * @param {Array} uiPeople - People data from UI
   * @param {Array} originalPeople - Original people data for fallback
   * @returns {Array} - API formatted people data for update
   */
  toUpdateFormat: (uiPeople, originalPeople = []) => {
    if (!uiPeople || !Array.isArray(uiPeople)) return null;
    if (uiPeople.length === 0) return null;
    
    return uiPeople.map(person => {
      // Check if this person has original data (was previously selected)
      if (person._originalData) {
        // User was already selected, include Id and ParentRecordId
        return {
          Id: person._originalData.Id,
          User: person._originalData.User.Id,
          ParentRecordId: person._originalData.ParentRecordId
        };
      } else {
        // Check if this person was already selected (exists in original data)
        const existingPerson = originalPeople.find(orig => 
          orig.User && orig.User.Id === person.Id
        );
        
        if (existingPerson) {
          // User was already selected, include Id and ParentRecordId
          return {
            Id: existingPerson.Id,
            User: existingPerson.User.Id,
            ParentRecordId: existingPerson.ParentRecordId
          };
        } else {
          // New user selection, only include User field
          return {
            User: person.Id
          };
        }
      }
    });
  }
};

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
          { field: { Name: "CreatedOn" } },
          { field: { Name: "people_3" }, },
          { field: { Name: "Formula1" } },
          { field: { Name: "score_rollup" } },
          { field: { Name: "invoicenumber" } },
          { field: { Name: "files_1_c" } },
       
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
          { field: { Name: "CreatedOn" } },
          { field: { Name: "people_3" } },
          { field: { Name: "Formula1" } },
          { field: { Name: "score_rollup" } },
          { field: { Name: "invoicenumber" } },
          { field: { Name: "files_1_c" } },
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
        createdAt: contact.CreatedOn,
        people_3: contact.people_3 || [],
        Formula1: contact.Formula1 || '',
        score_rollup: contact.score_rollup || '',
        invoicenumber: contact.invoicenumber || '',
        files_1_c: contact.files_1_c || []
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
        created_at: new Date().toISOString(),
        people_3: PeopleFieldUtils.toCreateFormat(contactData.people_3),
        files_1_c: contactData.files_1_c ? FileUploadUtils.formatFilesForAPI(contactData.files_1_c) : null,
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
            createdAt: newContact.CreatedOn,
            people_3: newContact.people_3 || [],
            Formula1: newContact.Formula1 || '',
            score_rollup: newContact.score_rollup || '',
            invoicenumber: newContact.invoicenumber || '',
            files_1_c: newContact.files_1_c || []
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
        Tags: contactData.tags ? contactData.tags.join(',') : '',
        people_3: PeopleFieldUtils.toUpdateFormat(contactData.people_3, contactData.originalPeople3),
        files_1_c: contactData.files_1_c ? FileUploadUtils.formatFilesForAPI(contactData.files_1_c, true) : null,
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
            createdAt: updatedContact.CreatedOn,
            people_3: updatedContact.people_3 || [],
            Formula1: updatedContact.Formula1 || '',
            score_rollup: updatedContact.score_rollup || '',
            invoicenumber: updatedContact.invoicenumber || '',
            files_1_c: updatedContact.files_1_c || []
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
  },
  async getPeople(params) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const response = await apperClient.getPeople(params);

      if(response.success){
        return response.data;
      }
      else{
        throw new Error(response.message);
      }
    }
    catch(error){
      console.error("Error fetching people:", error.message);
      throw error;
    } 
    
  },
  
};