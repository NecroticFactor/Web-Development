import { get_mailbox, post_mail, get_mail, make_archive, is_read } from "./functions.js";

document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  // Ensure #mail-view is hidden initially
  document.querySelector('#mail-view').style.display = 'none';
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#mailbox-items').style.display = 'none';
  document.querySelector('#mail-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Remove existing event listener to prevent duplicates
  const submitButton = document.querySelector('#submit');
  submitButton.removeEventListener('click', submitEmail);
  submitButton.addEventListener('click', submitEmail);
}

function submitEmail() {
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  // Call the post_mail function
  post_mail(recipients, subject, body);
  load_mailbox('sent')
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#mailbox-items').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#mail-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  async function fetchMails() {
    try {
      const mails = await get_mailbox(mailbox);

      const mailboxItemsContainer = document.querySelector('#mailbox-items');
      mailboxItemsContainer.innerHTML = '';

      if (Array.isArray(mails) && mails.length > 0) {
        mails.forEach(mail => {
          const newDiv = document.createElement('div');
          newDiv.innerHTML = `
            <h4>${mailbox === 'sent' ? mail.recipients : mailbox === 'archive' ? `${mail.sender} to ${mail.recipients}` : mail.sender}</h4>
            <h4>${mail.subject}</h4>
            <h6>${mail.timestamp}</h6>`;

            // Change background color based on read status and mailbox type
            if (mailbox === 'inbox') {
              if (mail.read === false) {
                newDiv.style.backgroundColor = 'white';
              } else {
                newDiv.style.backgroundColor = 'gray';
                newDiv.querySelector('h6').style.color = 'black';
              }
            } else {
              newDiv.style.backgroundColor = 'gray';
              newDiv.querySelector('h6').style.color = 'black';
            }

          newDiv.addEventListener('click', () => {
            show_mail(mail.id);
            readMail(mailbox, mail.id, true);
          });

          mailboxItemsContainer.appendChild(newDiv);
        });
      } else {
        mailboxItemsContainer.innerHTML = '<p>No mails found.</p>';
      }
    } catch (error) {
      console.error('Error fetching mails:', error);
    }
  }
  fetchMails();
}



async function show_mail(id) {
  try {
    const mail = await get_mail(id);
    const singleViewContainer = document.querySelector('#mail-view');

    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#mailbox-items').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    singleViewContainer.style.display = 'block';

    singleViewContainer.innerHTML = `
      <h4>From: ${mail.sender}</h4>
      <h4>To: ${mail.recipients}</h4>
      <h4>Subject: ${mail.subject}</h4>
      <h4>Timestamp: ${mail.timestamp}</h4>
      <hr/>
      <p>${mail.body}</p>`;

    makeButton(singleViewContainer, mail);

  } catch (error) {
    alert(error);
  }
}



function makeButton(singleViewContainer, mail) {
  const archiveButton = document.createElement('button');
  archiveButton.textContent = mail.archived === false ? 'Archive': 'Unarchive';
  archiveButton.classList.add('button', 'archive-button');

  let archivedStatus = mail.archived === false ? true : false;

  archiveButton.addEventListener('click', function() {
    make_archive(mail.id, archivedStatus);
    location.reload()
  });

  const replyButton = document.createElement('button');
  replyButton.textContent = 'Reply';
  replyButton.classList.add('button');

  replyButton.addEventListener('click', function() {
      replyMail(mail); 
  });

  singleViewContainer.appendChild(replyButton);
  singleViewContainer.appendChild(archiveButton);
}



function replyMail(mail) {
  compose_email()

  document.querySelector('#compose-recipients').value = mail.sender;
  document.querySelector('#compose-subject').value = mail.subject.startsWith('Re') ? mail.subject : `Re: ${mail.subject}`;
  document.querySelector('#compose-body').value = `\n\n\n\nOn ${mail.timestamp} ${mail.sender} wrote: ${mail.body}`;
}



function readMail(mailbox, id, status) {
  if(mailbox === 'inbox') {
    is_read(id, status);
  }
}