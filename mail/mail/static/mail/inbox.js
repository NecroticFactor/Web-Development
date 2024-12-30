import { get_mailbox } from "./functions.js";

document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#mailbox-items').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  

 

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#mailbox-items').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`

  async function fetchMails() {
    try {
      const mails = await get_mailbox(mailbox); 
      console.log(mails);

      // Check if mails is an array and has content
      if (Array.isArray(mails) && mails.length > 0) {
        const mailboxItemsContainer = document.querySelector('#mailbox-items');
        mails.forEach(mail => {
          const newDiv = document.createElement('div');
          newDiv.innerHTML = `
            <h4>${mailbox === 'sent' ? mail.recipients : mail.sender}</h4>
            <h4>${mail.subject}</h4>
            <h6>${mail.timestamp}</h6>`;
          mailboxItemsContainer.appendChild(newDiv);
        });
      } else {
        // Handle the case where no mails are found
        const mailboxItemsContainer = document.querySelector('#mailbox-items');
        mailboxItemsContainer.innerHTML = '<p>No mails found.</p>';
      }
    } catch (error) {
      console.error('Error fetching mails:', error);
    }
  }

  // Call the async function to fetch mails
  fetchMails();
}



