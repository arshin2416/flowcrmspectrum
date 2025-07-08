import contactsData from '../mockData/contacts.json';

// Utility function to add delay for realistic API simulation
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory store for contacts (simulates database)
let contacts = [...contactsData];
let nextId = Math.max(...contacts.map(c => c.Id)) + 1;

export const contactService = {
  async getAll() {
    await delay(300);
    try {
      // Return a copy of contacts data
      return [...contacts];
    } catch (error) {
      console.error("Error fetching contacts:", error.message);
      return [];
    }
  },

  async getById(id) {
    await delay(200);
    try {
      const contactId = parseInt(id);
      const contact = contacts.find(c => c.Id === contactId);
      
      if (!contact) {
        throw new Error('Contact not found');
      }
      
      return { ...contact };
    } catch (error) {
      console.error(`Error fetching contact with ID ${id}:`, error.message);
      throw error;
    }
  },

  async create(contactData) {
    await delay(400);
    try {
      const newContact = {
        Id: nextId++,
        name: contactData.name,
        email: contactData.email,
        phone: contactData.phone,
        company: contactData.company,
        status: contactData.status,
        tags: contactData.tags || [],
        createdAt: new Date().toISOString()
      };
      
      contacts.unshift(newContact);
      return { ...newContact };
    } catch (error) {
      console.error("Error creating contact:", error.message);
      throw error;
    }
  },

  async update(id, contactData) {
    await delay(350);
    try {
      const contactId = parseInt(id);
      const contactIndex = contacts.findIndex(c => c.Id === contactId);
      
      if (contactIndex === -1) {
        throw new Error('Contact not found');
      }
      
      const updatedContact = {
        ...contacts[contactIndex],
        ...contactData,
        Id: contactId // Ensure ID doesn't change
      };
      
      contacts[contactIndex] = updatedContact;
      return { ...updatedContact };
    } catch (error) {
      console.error("Error updating contact:", error.message);
      throw error;
    }
  },

  async delete(id) {
    await delay(250);
    try {
      const contactId = parseInt(id);
      const contactIndex = contacts.findIndex(c => c.Id === contactId);
      
      if (contactIndex === -1) {
        throw new Error('Contact not found');
      }
      
      contacts.splice(contactIndex, 1);
      return true;
    } catch (error) {
      console.error("Error deleting contact:", error.message);
      throw error;
    }
  }
};