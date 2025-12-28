let login = "";
let domain = "";

const emailEl = document.getElementById("email");
const inboxEl = document.getElementById("inbox");

document.getElementById("generateBtn").addEventListener("click", generateMail);

async function generateMail() {
  const res = await fetch(
    "https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1"
  );
  const data = await res.json();

  const email = data[0];
  emailEl.textContent = email;

  [login, domain] = email.split("@");

  inboxEl.innerHTML = "";
  startChecking();
}

async function startChecking() {
  setInterval(async () => {
    if (!login) return;

    const res = await fetch(
      `https://www.1secmail.com/api/v1/?action=getMessages&login=${login}&domain=${domain}`
    );
    const messages = await res.json();

    inboxEl.innerHTML = "";

    for (let msg of messages) {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${msg.subject}</strong><br/>
        <small>${msg.from}</small><br/>
        <button onclick="readMail(${msg.id})">Lire</button>
      `;
      inboxEl.appendChild(li);
    }
  }, 5000);
}

async function readMail(id) {
  const res = await fetch(
    `https://www.1secmail.com/api/v1/?action=readMessage&login=${login}&domain=${domain}&id=${id}`
  );
  const mail = await res.json();

  alert(mail.textBody || "Mail HTML reçu");
}
