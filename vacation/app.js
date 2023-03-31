const { google } = require('googleapis');
const { authorize } = require('./auth');
const { checkEmails, sendReplies } = require('./gmail');

require('dotenv').config();

// replying to mails every 2 minutes
const INTERVAL_MINUTES = 2;

async function main() {
  const auth = await authorize();
  const gmail = google.gmail({ version: 'v1', auth });

  setInterval(async () => {
    const emails = await checkEmails(gmail);
    const emailsWithoutReply = emails.filter(email => !email.hasRepliesFromMe);
    if (emailsWithoutReply.length) {
      console.log(`Found ${emailsWithoutReply.length} emails without reply. Sending replies...`);
      await sendReplies(gmail, emailsWithoutReply);
      console.log('Done sending replies.');
    } else {
      console.log(`No emails without reply found. Checking again in ${INTERVAL_MINUTES} minutes...`);
    }
  }, INTERVAL_MINUTES * 60 * 1000);
}

main();
