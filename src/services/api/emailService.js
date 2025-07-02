import emailsData from '@/services/mockData/emails.json';

let emails = [...emailsData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const emailService = {
  async getAll() {
    await delay(300);
    return [...emails];
  },

  async getById(id) {
    await delay(200);
    const email = emails.find(e => e.Id === parseInt(id));
    if (!email) {
      throw new Error('Email not found');
    }
    return { ...email };
  },

  async getByContactId(contactId) {
    await delay(250);
    return emails.filter(email => email.contactId === parseInt(contactId))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  async getThreadById(threadId) {
    await delay(200);
    return emails.filter(email => email.threadId === parseInt(threadId) || email.Id === parseInt(threadId))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  },

  async send(emailData) {
    await delay(400);
    const maxId = Math.max(...emails.map(e => e.Id), 0);
    const newEmail = {
      ...emailData,
      Id: maxId + 1,
      timestamp: new Date().toISOString(),
      type: 'sent',
      threadId: emailData.threadId || null
    };
    
    emails.push(newEmail);
    
    // Simulate auto-reply after a delay
    setTimeout(async () => {
      const replyId = Math.max(...emails.map(e => e.Id), 0) + 1;
      const autoReply = {
        Id: replyId,
        contactId: emailData.contactId,
        to: 'you@company.com',
        from: emailData.to,
        subject: `Re: ${emailData.subject}`,
        content: 'Thank you for your email. I will get back to you soon.',
        timestamp: new Date(Date.now() + 30000).toISOString(),
        type: 'received',
        threadId: newEmail.threadId || newEmail.Id
      };
      emails.push(autoReply);
    }, 2000);
    
    return { ...newEmail };
  },

  async saveDraft(emailData) {
    await delay(300);
    const maxId = Math.max(...emails.map(e => e.Id), 0);
    const draft = {
      ...emailData,
      Id: maxId + 1,
      timestamp: new Date().toISOString(),
      type: 'draft'
    };
    
    emails.push(draft);
    return { ...draft };
  },

  async delete(id) {
    await delay(250);
    const index = emails.findIndex(e => e.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Email not found');
    }
    emails.splice(index, 1);
    return true;
  },

  async search(query, contactId = null) {
    await delay(200);
    const searchQuery = query.toLowerCase();
    let filtered = emails.filter(email =>
      email.subject.toLowerCase().includes(searchQuery) ||
      email.content.toLowerCase().includes(searchQuery)
    );
    
    if (contactId) {
      filtered = filtered.filter(email => email.contactId === parseInt(contactId));
    }
    
    return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
};