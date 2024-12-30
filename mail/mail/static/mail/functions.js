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