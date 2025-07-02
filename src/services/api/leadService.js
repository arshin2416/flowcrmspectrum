import leadsData from '@/services/mockData/leads.json';

let leads = [...leadsData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const leadService = {
  async getAll() {
    await delay(300);
    return [...leads];
  },

  async getById(id) {
    await delay(200);
    const lead = leads.find(l => l.Id === parseInt(id));
    if (!lead) {
      throw new Error('Lead not found');
    }
    return { ...lead };
  },

  async getByContactId(contactId) {
    await delay(200);
    return leads.filter(l => l.contactId === parseInt(contactId));
  },

  async create(leadData) {
    await delay(400);
    const maxId = Math.max(...leads.map(l => l.Id), 0);
    const newLead = {
      ...leadData,
      Id: maxId + 1,
      createdAt: new Date().toISOString()
    };
    leads.push(newLead);
    return { ...newLead };
  },

  async update(id, leadData) {
    await delay(300);
    const index = leads.findIndex(l => l.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Lead not found');
    }
    leads[index] = { ...leads[index], ...leadData };
    return { ...leads[index] };
  },

  async delete(id) {
    await delay(250);
    const index = leads.findIndex(l => l.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Lead not found');
    }
    leads.splice(index, 1);
    return true;
  }
};