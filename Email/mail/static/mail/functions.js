// GET Mails for Mailbox
export async function get_mailbox(mailbox) {
    try {
        const res = await fetch(`emails/${mailbox}`);
        if(!res.ok){
            throw new Error(`HTTP! error! Status:${res.status}`);
        }
        const emails = await res.json();
        return emails.length > 0? emails: [];
    } catch(error) {
        alert(`Failed to fetch email: ${error.message}`);
        return [];
    }
}

// GET Single mail
export async function get_mail(id) {
    try{
        const res = await fetch(`emails/${id}`)
        if(!res.ok) {
            throw new Error(`HTTP! error! Status:${res.status}`)
        }
        const email = await res.json();
        return email
    } catch(error) {
        alert(`Failed to fetch email: ${error.message}`);
    }
}


// POST New email
export async function post_mail(recipient, subject, body) {

    if (!recipient || !subject || !body) {
        return;
    }

    try {
        const res = await fetch('emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                recipients: recipient,
                subject: subject,
                body: body
            })
        });

        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }

        const result = await res.json();

    } catch (error) {
        console.error('Error posting email:', error);
    }
}

// Archiving function
export async function make_archive(id,status) {
    try{
        const res = await fetch(`emails/${id}`, {
            method:'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                archived: status,
            })
        });
        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }

        if (res.status !== 204) {
            const result = await res.json(); 
            alert(result);
        } else {
            alert(`Mail Successfully ${status === false ? 'Unarchived' : 'Archived'}`);
        }

    } catch(err){
        console.log(err)

    }
}

// Mark mail as read
export async function is_read(id, status){
    const res = await fetch(`emails/${id}`, {
        method:'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            read: status,
        })
    });
    if (res.status !== 204) {
        const result = await res.json();
        alert(result);
}
}