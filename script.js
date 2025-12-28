document.addEventListener("DOMContentLoaded", () => {

  const generateBtn = document.getElementById("generateBtn");
  const copyBtn = document.getElementById("copyBtn");
  const emailInput = document.getElementById("emailInput");
  const emailContainer = document.getElementById("emailContainer");
  const messagesDiv = document.getElementById("messages");

  const PROXY = "https://cors.isomorphic-git.org/";
  const API = "https://www.1secmail.com/api/v1/";

  let login = "";
  let domain = "";
  let interval = null;

  generateBtn.addEventListener("click", generateEmail);
  copyBtn.addEventListener("click", copyEmail);

  async function generateEmail() {
    generateBtn.textContent = "Génération...";
    generateBtn.disabled = true;

    messagesDiv.innerHTML = `<p class="empty">Aucun message reçu</p>`;
    clearInterval(interval);

    try {
      const res = await fetch(
        PROXY + API + "?action=genRandomMailbox&count=1"
      );
      const data = await res.json();

      const email = data[0];
      emailInput.value = email;
      emailContainer.classList.remove("hidden");

      [login, domain] = email.split("@");

      interval = setInterval(loadInbox, 5000);
    } catch (e) {
      alert("Erreur lors de la génération du mail.");
      console.error(e);
    }

    generateBtn.textContent = "Générer une adresse";
    generateBtn.disabled = false;
  }

  async function loadInbox() {
    try {
      const res = await fetch(
        PROXY + API +
        `?action=getMessages&login=${login}&domain=${domain}`
      );
      const mails = await res.json();

      if (mails.length === 0) return;

      messagesDiv.innerHTML = "";

      mails.forEach(mail => {
        const div = document.createElement("div");
        div.className = "message";
        div.innerHTML = `
          <strong>${mail.subject}</strong>
          <small>${mail.from}</small><br>
          <a href="#">Lire le message</a>
        `;
        div.querySelector("a").addEventListener("click", () => readMail(mail.id));
        messagesDiv.appendChild(div);
      });
    } catch (e) {
      console.error("Erreur inbox", e);
    }
  }

  async function readMail(id) {
    try {
      const res = await fetch(
        PROXY + API +
        `?action=readMessage&login=${login}&domain=${domain}&id=${id}`
      );
      const mail = await res.json();

      const win = window.open();
      win.document.write(mail.htmlBody || `<pre>${mail.textBody}</pre>`);
    } catch (e) {
      console.error("Erreur lecture mail", e);
    }
  }

  function copyEmail() {
    navigator.clipboard.writeText(emailInput.value);
    copyBtn.textContent = "Copié ✔";
    setTimeout(() => copyBtn.textContent = "Copier", 1500);
  }

});
