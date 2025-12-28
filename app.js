const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");
const emailInput = document.getElementById("emailInput");
const emailContainer = document.getElementById("emailContainer");
const messagesDiv = document.getElementById("messages");

let login = "";
let domain = "";
let interval = null;

generateBtn.addEventListener("click", generateEmail);
copyBtn.addEventListener("click", copyEmail);

async function generateEmail() {
  clearInterval(interval);
  messagesDiv.innerHTML = `<p class="empty">Aucun message reçu</p>`;

  const res = await fetch(
    "https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1"
  );
  const data = await res.json();

  const email = data[0];
  emailInput.value = email;
  emailContainer.classList.remove("hidden");

  [login, domain] = email.split("@");

  interval = setInterval(loadInbox, 5000);
}

async function loadInbox() {
  const res = await fetch(
    `https://www.1secmail.com/api/v1/?action=getMessages&login=${login}&domain=${domain}`
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
  navigator.clipboard.writeText(emailInput.value);
  copyBtn.textContent = "Copié ✔";
  setTimeout(() => copyBtn.textContent = "Copier", 1500);
}
