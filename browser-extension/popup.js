const subtitle = document.getElementById("subtitle");
const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");
const pairForm = document.getElementById("pairForm");
const pairCodeInput = document.getElementById("pairCode");
const pairError = document.getElementById("pairError");
const pairButton = document.getElementById("pairButton");
const unpairSection = document.getElementById("unpairSection");
const unpairPrompt = document.getElementById("unpairPrompt");
const unpairPasswordInput = document.getElementById("unpairPassword");
const unpairError = document.getElementById("unpairError");
const unpairButton = document.getElementById("unpairButton");

let awaitingUnpairConfirm = false;

const screenShareSection = document.getElementById("screenShareSection");
const screenShareNoPasscode = document.getElementById("screenShareNoPasscode");
const screenShareNeedsPasscode = document.getElementById("screenShareNeedsPasscode");
const screenSharePasscode = document.getElementById("screenSharePasscode");
const screenShareError = document.getElementById("screenShareError");

function refreshScreenShare() {
  chrome.runtime.sendMessage({ type: "GUARDIA_SCREEN_STATUS" }, (status) => {
    if (!status?.active) {
      screenShareSection.style.display = "none";
      return;
    }
    screenShareSection.style.display = "block";
    screenShareNoPasscode.style.display = status.needsPasscode ? "none" : "block";
    screenShareNeedsPasscode.style.display = status.needsPasscode ? "block" : "none";
  });
}

function doStopScreenShare(passcode) {
  screenShareError.style.display = "none";
  chrome.runtime.sendMessage({ type: "GUARDIA_SCREEN_STOP", passcode }, (result) => {
    if (!result?.ok) {
      screenShareError.textContent = result?.error || "Couldn't stop it.";
      screenShareError.style.display = "block";
      return;
    }
    refreshScreenShare();
  });
}

document.getElementById("stopScreenShareButton").addEventListener("click", () => doStopScreenShare());
document.getElementById("stopScreenShareButton2").addEventListener("click", () => doStopScreenShare(screenSharePasscode.value));

function render(status) {
  awaitingUnpairConfirm = false;
  unpairPrompt.style.display = "none";
  unpairError.style.display = "none";
  unpairPasswordInput.value = "";

  if (status.paired) {
    statusDot.classList.add("on");
    statusText.textContent = `Paired with ${status.studentName}`;
    subtitle.textContent = "Monitoring Gemini, ChatGPT, Claude and Google Search on this browser.";
    pairForm.style.display = "none";
    unpairSection.style.display = "block";
    unpairButton.textContent = "Unpair this browser";
  } else {
    statusDot.classList.remove("on");
    statusText.textContent = "Not paired";
    subtitle.textContent = "Not paired — enter the code from TrustEd";
    pairForm.style.display = "block";
    unpairSection.style.display = "none";
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
refreshScreenShare();
setInterval(refreshScreenShare, 2000);
  });
});

unpairButton.addEventListener("click", () => {
  if (!awaitingUnpairConfirm) {
    // First click just reveals the password field — don't unpair yet.
    // Whether a password is actually required is decided server-side
    // (set from TrustEd), so this popup shows the field either way.
    awaitingUnpairConfirm = true;
    unpairPrompt.style.display = "block";
    unpairButton.textContent = "Confirm unpair";
    unpairPasswordInput.focus();
    return;
  }

  const password = unpairPasswordInput.value;
  unpairButton.disabled = true;
  chrome.runtime.sendMessage({ type: "GUARDIA_UNPAIR", password }, (result) => {
    unpairButton.disabled = false;
    if (!result?.ok) {
      unpairError.textContent = result?.error || "Couldn't unpair.";
      unpairError.style.display = "block";
      return;
    }
    refresh();
  });
});

refresh();
