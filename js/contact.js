// Invio del form di contatto con EmailJS.
// La Public Key è pensata per stare nel codice del sito. Le protezioni qui sotto
// (campo trappola, pausa tra due invii, blockHeadless) frenano solo l'abuso passando
// dal sito: non sostituiscono la restrizione dei domini, che nel piano gratuito
// di EmailJS non è disponibile.
const EMAILJS_PUBLIC_KEY = 'RhwbNy32L-oRoDT43';
const EMAILJS_SERVICE_ID = 'service_9k6ccy8';
const TEMPLATE_CONTACT = 'template_ihcdpq4';    // "Contact us": la mail che ricevo io
const TEMPLATE_AUTO_REPLY = 'template_fisqe8v'; // "Auto Reply": conferma a chi scrive

const MIN_SECONDS_BETWEEN_SENDS = 30;
const LAST_SENT_KEY = 'contactFormLastSent';

const form = document.querySelector('#contact-form');
const statusBox = document.querySelector('#form-status');
const submitButton = form.querySelector('button[type="submit"]');

// blockHeadless: l'SDK rifiuta i browser automatici (errore 451).
emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY, blockHeadless: true });

function setStatus(message, color) {
    statusBox.textContent = message;
    statusBox.className = `small mt-3 text-${color}`;
}

// L'ultimo invio riuscito viene ricordato anche dopo aver ricaricato la pagina.
// Se localStorage non è disponibile, il controllo vale solo finché la pagina resta aperta.
let lastSentAt = 0;
try {
    lastSentAt = Number(localStorage.getItem(LAST_SENT_KEY)) || 0;
} catch (error) {
    // nessuna azione: si usa solo la variabile in memoria
}

function rememberSend() {
    lastSentAt = Date.now();
    try {
        localStorage.setItem(LAST_SENT_KEY, String(lastSentAt));
    } catch (error) {
        // nessuna azione
    }
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Campo trappola per i bot: un utente reale non lo compila mai.
    if (form.elements.website.value) {
        return;
    }

    const secondsToWait = Math.ceil(MIN_SECONDS_BETWEEN_SENDS - (Date.now() - lastSentAt) / 1000);
    if (secondsToWait > 0) {
        setStatus(`Please wait ${secondsToWait} seconds before sending another message.`, 'warning');
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

    rememberSend();

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
