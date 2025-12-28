const API = "https://api.mail.tm";

const btnGenerate = document.getElementById("generate");
const btnCopy = document.getElementById("copy");
const emailInput = document.getElementById("email");
const inbox = document.getElementById("inbox");

let token = "";
let accountId = "";

btnGenerate.onclick = generateMail;
btnCopy.onclick = () => navigator.clipboard.writeText(emailInput.value);

async function generateMail() {
  inbox.textContent = "Chargement...";
  
  const domainRes = await fetch(API + "/domains");
  const domain = (await domainRes.json())["hydra:member"][0].domain;

  const address = Math.random().toString(36).substring(2,10) + "@" + domain;
  const password = "pass123456";

  const acc = await fetch(API + "/accounts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, password })
  });

  const data = await acc.json();
  accountId = data.id;
  emailInput.value = address;

  const auth = await fetch(API + "/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, password })
  });

  token = (await auth.json()).token;

  setInterval(loadInbox, 5000);
}

async function loadInbox() {
  const res = await fetch(API + "/messages", {
    headers: { Authorization: "Bearer " + token }
  });

  const mails = (await res.json())["hydra:member"];
  inbox.innerHTML = "";

  if (mails.length === 0) {
    inbox.textContent = "Aucun message";
    return;
  }

  mails.forEach(m => {
    const div = document.createElement("div");
    div.className = "mail";
    div.innerHTML = `<strong>${m.subject}</strong><br>${m.from.address}`;
    inbox.appendChild(div);
  });
}
