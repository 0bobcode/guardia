const subtitle = document.getElementById("subtitle");
const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");
const pairForm = document.getElementById("pairForm");
const pairCodeInput = document.getElementById("pairCode");
const pairError = document.getElementById("pairError");
const pairButton = document.getElementById("pairButton");
const unpairButton = document.getElementById("unpairButton");

function render(status) {
  if (status.paired) {
    statusDot.classList.add("on");
    statusText.textContent = `Paired with ${status.studentName}`;
    subtitle.textContent = "Monitoring Gemini on this browser.";
    pairForm.style.display = "none";
    unpairButton.style.display = "block";
  } else {
    statusDot.classList.remove("on");
    statusText.textContent = "Not paired";
    subtitle.textContent = "Not paired — enter the code from TrustEd";
    pairForm.style.display = "block";
    unpairButton.style.display = "none";
  }
}

function refresh() {
  chrome.runtime.sendMessage({ type: "GUARDIA_STATUS" }, render);
}

pairButton.addEventListener("click", () => {
  const pairCode = pairCodeInput.value.trim().toUpperCase();
  if (!pairCode) return;
  pairError.style.display = "none";
  pairButton.disabled = true;
  pairButton.textContent = "Pairing…";
  chrome.runtime.sendMessage({ type: "GUARDIA_PAIR", pairCode }, (result) => {
    pairButton.disabled = false;
    pairButton.textContent = "Pair device";
    if (!result) {
      pairError.textContent = "That code didn't work — check TrustEd and try again.";
      pairError.style.display = "block";
      return;
    }
    refresh();
  });
});

unpairButton.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "GUARDIA_UNPAIR" }, refresh);
});

refresh();
