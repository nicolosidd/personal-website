// Invio del form di contatto con EmailJS.
// La Public Key è pensata per stare nel codice del sito: per limitarne l'uso
// al solo dominio del sito, impostare le origini consentite nella dashboard EmailJS.
const EMAILJS_PUBLIC_KEY = 'RhwbNy32L-oRoDT43';
const EMAILJS_SERVICE_ID = 'service_9k6ccy8';
const TEMPLATE_CONTACT = 'template_ihcdpq4';    // "Contact us": la mail che ricevo io
const TEMPLATE_AUTO_REPLY = 'template_fisqe8v'; // "Auto Reply": conferma a chi scrive

const form = document.querySelector('#contact-form');
const statusBox = document.querySelector('#form-status');
const submitButton = form.querySelector('button[type="submit"]');

emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

function setStatus(message, color) {
    statusBox.textContent = message;
    statusBox.className = `small mt-3 text-${color}`;
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Campo trappola per i bot: un utente reale non lo compila mai.
    if (form.elements.website.value) {
        return;
    }

    submitButton.disabled = true;
    setStatus('Sending...', 'secondary');

    try {
        await emailjs.sendForm(EMAILJS_SERVICE_ID, TEMPLATE_CONTACT, form);
    } catch (error) {
        console.error('EmailJS error:', error);
        setStatus('Something went wrong, please try again later.', 'danger');
        submitButton.disabled = false;
        return;
    }

    // Se la risposta automatica fallisce, il messaggio è comunque arrivato.
    try {
        await emailjs.sendForm(EMAILJS_SERVICE_ID, TEMPLATE_AUTO_REPLY, form);
    } catch (error) {
        console.error('EmailJS auto reply error:', error);
    }

    form.reset();
    setStatus('Thank you! Your message has been sent.', 'success');
    submitButton.disabled = false;
});
