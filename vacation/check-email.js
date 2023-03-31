const { google } = require('googleapis');

// Get the authenticated Gmail API client
const auth = require('./auth');

const checkEmails = async () => {
  try {
    // Create a new Gmail API client with the authenticated client
    const gmail = google.gmail({ version: 'v1', auth });

    // Fetch the list of messages in the mailbox
    const res = await gmail.users.messages.list({ userId: 'me' });

    // Filter out any messages that have a reply from you
    const messages = res.data.messages.filter((msg) => !msg.labelIds.includes('SENT'));

    // Return the list of messages that have no reply from you
    return messages;
  } catch (err) {
    console.error('Error checking emails:', err);
    return [];
  }
};

module.exports = checkEmails;
