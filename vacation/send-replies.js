const { google } = require('googleapis');
// const { randomInt } = require('crypto');

// Get the authenticated Gmail API client
const auth = require('./auth');

const sendReply = async (message) => {
  try {
    // Create a new Gmail API client with the authenticated client
    const gmail = google.gmail({ version: 'v1', auth });

    // Get the message details
    const res = await gmail.users.messages.get({ userId: 'me', id: message.id });
    const { to, subject, body } = getMessageDetails(res.data);

    // Create the reply message
    const reply = createReplyMessage(to, subject, body);

    // Send the reply
    const sendRes = await gmail.users.messages.send({ userId: 'me', requestBody: reply });

    // Add a label to the message
    const addLabelRes = await gmail.users.messages.modify({
      userId: 'me',
      id: message.id,
      requestBody: {
        addLabelIds: ['Label_Responded'],
        removeLabelIds: [],
      },
    });

    // Move the message to the label
    const moveRes = await gmail.users.messages.batchModify({
      userId: 'me',
      requestBody: {
        ids: [message.id],
        addLabelIds: ['Label_Responded'],
        removeLabelIds: [],
      },
    });

    console.log('Replied to:', to, subject);
  } catch (err) {
    console.error('Error sending reply:', err);
  }
};

const getMessageDetails = (message) => {
  // Get the headers of the message
  const headers = message.payload.headers.reduce(
    (acc, header) => ({ ...acc, [header.name]: header.value }),
    {}
  );

  // Extract the "To" and "Subject" headers
  const to = headers.To;
  const subject = headers.Subject;

  // Extract the body of the message
  const part = message.payload.parts.find((part) => part.mimeType === 'text/plain');
  const body = part.body.data;

  // Decode the body from base64 and return the message details
  return { to, subject, body: Buffer.from(body, 'base64').toString() };
};

const createReplyMessage = (to, subject, body) => {
  // Create the reply message
  const reply = `Hi ${to.split('@')[0]},\n\nThank you for your email regarding "${subject} I am on a Vacation will reply soon ". `;
  const signature = '\n\nBest regards,\nYour Name';
  const message = reply + body + signature;

  // Encode the message body in base64 and return the message object
  return { raw: Buffer.from(message).toString('base64') };
};

module.exports = sendReply;
