// Scripts du site (contact)
(function () {
  const form = document.querySelector('form.contact-form-container');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const oldText = submitBtn ? submitBtn.textContent : null;

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Envoi en cours...';
    }

    // Récupération rapide des champs
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());

    const endpoint = form.getAttribute('data-formspree-endpoint');
    const mailtoRecipient = form.getAttribute('data-mailto-recipient');

    // Si on est en mode mailto: construire une URL mailto avec le contenu du formulaire
    if ((!endpoint || endpoint === '') && mailtoRecipient) {
      const name = payload.name || '';
      const email = payload.email || '';
      const phone = payload.phone || '';
      const subject = payload.subject || '';
      const message = payload.message || '';

      const mailtoSubject = encodeURIComponent(subject || 'Demande via le site');
      const mailtoBody = encodeURIComponent(
        `Nom: ${name}\n` +
        `Email: ${email}\n` +
        `Téléphone: ${phone}\n` +
        `\nMessage:\n${message}`
      );

      // Ouvre le client mail avec les champs pré-remplis
      window.location.href = `mailto:${mailtoRecipient}?subject=${mailtoSubject}&body=${mailtoBody}`;

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = oldText || 'Envoyer le message';
      }
      return;
    }

    if (!endpoint) {
      alert('Formspree: endpoint manquant. Mets ton URL Formspree dans data-formspree-endpoint dans contacte.html.');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = oldText || 'Envoyer le message';
      }
      return;
    }

    fetch(endpoint, {
      method: 'POST',
      headers: {
        'Accept': 'application/json'
      },
      body: data
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(text || 'Erreur lors de l’envoi.');
        }
      })
      .then(() => {
        alert(
          'Message envoyé !\n\n' +
            'Nom: ' + (payload.name || '') + '\n' +
            'Email: ' + (payload.email || '') + '\n' +
            'Téléphone: ' + (payload.phone || '') + '\n' +
            'Sujet: ' + (payload.subject || '')
        );

        form.reset();
      })
      .catch((err) => {
        console.error(err);

        // Fallback: si ton backend Node ne répond pas / renvoie une erreur,
        // on bascule en mailto pour que le formulaire reste utilisable.
        try {
          const name = payload.name || '';
          const email = payload.email || '';
          const phone = payload.phone || '';
          const subject = payload.subject || '';
          const message = payload.message || '';

          const mailtoSubject = encodeURIComponent(subject || 'Demande via le site');
          const mailtoBody = encodeURIComponent(
            `Nom: ${name}\n` +
              `Email: ${email}\n` +
              `Téléphone: ${phone}\n` +
              `\nMessage:\n${message}`
          );

          const recipient = mailtoRecipient;
          if (recipient) {
            window.location.href = `mailto:${recipient}?subject=${mailtoSubject}&body=${mailtoBody}`;
            return;
          }
        } catch (e) {}

        alert('Echec de l’envoi.');
      })
      .finally(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = oldText || 'Envoyer le message';
        }
      });
  });
})();

