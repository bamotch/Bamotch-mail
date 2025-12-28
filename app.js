const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");
const emailBox = document.getElementById("emailBox");
const emailEl = document.getElementById("email");
const messagesEl = document.getElementById("messages");

let login = "";
let domain = "";
let inboxInterval = null;

generateBtn.addEventListener("click", generateEmail);
copyBtn.addEventListener("click", copyEmail);

async function generateEmail() {
  clearInterval(inboxInterval);
  messagesEl.innerHTML = `<p class="empty">Aucun message pour le moment</p>`;

  const res = await fetch(
    "https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1"
  );
  const data = await res.json();

  const email = data[0];
  emailEl.textContent = email;
  emailBox.classList.remove("hidden");

  [login, domain] = email.split("@");

  inboxInterval = setInterval(loadInbox, 5000);
}

async function loadInbox() {
  if (!login) return;

  const res = await fetch(
    `https://www.1secmail.com/api/v1/?action=getMessages&login=${login}&domain=${domain}`
  );
  const mails = await res.json();

  if (mails.length === 0) return;

  messagesEl.innerHTML = "";
  mails.forEach(mail => {
    const div = document.createElement("div");
    div.className = "message";
    div.innerHTML = `
      <strong>${mail.subject}</strong>
      <small>${mail.from}</small>
      <a href="#" data-id="${mail.id}">Lire</a>
    `;
    div.querySelector("a").addEventListener("click", () => readMail(mail.id));
    messagesEl.appendChild(div);
  });
}

async function readMail(id) {
  const res = await fetch(
    `https://www.1secmail.com/api/v1/?action=readMessage&login=${login}&domain=${domain}&id=${id}`
  );
  const mail = await res.json();

  const win = window.open();
  win.document.write(mail.htmlBody || `<pre>${mail.textBody}</pre>`);
}

function copyEmail() {
  navigator.clipboard.writeText(emailEl.textContent);
  copyBtn.textContent = "Copié ✔";
  setTimeout(() => (copyBtn.textContent = "Copier"), 1500);
}
