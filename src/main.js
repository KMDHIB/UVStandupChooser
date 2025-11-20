import './style.css'
import uvdataLogo from '../public/uvdata.svg'
import { registerSW } from 'virtual:pwa-register'

// PWA Update logic with install prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  // Show install button
  showInstallPromotion();
});

function showInstallPromotion() {
  const installBanner = document.createElement('div');
  installBanner.id = 'install-banner';
  installBanner.innerHTML = `
    <div style="background: #003E78; color: white; padding: 16px; position: fixed; top: 20px; left: 50%; transform: translateX(-50%); border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); z-index: 1000; display: flex; gap: 16px; align-items: center; max-width: 90%; flex-wrap: wrap; justify-content: center;">
      <span>📱 Installer app på din enhed</span>
      <button id="install-btn" style="background: white; color: #003E78; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold;">
        Installer
      </button>
      <button id="install-dismiss" style="background: transparent; color: white; border: 1px solid white; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
        Nej tak
      </button>
    </div>
  `;
  document.body.appendChild(installBanner);

  document.getElementById('install-btn').addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      deferredPrompt = null;
    }
    installBanner.remove();
  });

  document.getElementById('install-dismiss').addEventListener('click', () => {
    installBanner.remove();
  });
}

const updateSW = registerSW({
  onNeedRefresh() {
    showUpdateNotification();
  },
  onOfflineReady() {
    console.log('App klar til offline brug');
  },
})

function showUpdateNotification() {
  const notification = document.createElement('div');
  notification.id = 'update-notification';
  notification.innerHTML = `
    <div style="background: #4CAF50; color: white; padding: 16px; position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); z-index: 1000; display: flex; gap: 16px; align-items: center; max-width: 90%; flex-wrap: wrap; justify-content: center;">
      <span>Ny version tilgængelig!</span>
      <button id="update-btn" style="background: white; color: #4CAF50; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold;">
        Opdater nu
      </button>
    </div>
  `;
  document.body.appendChild(notification);

  document.getElementById('update-btn').addEventListener('click', () => {
    updateSW(true);
  });
}

// Sæt favicon dynamisk
const favicon = document.createElement('link');
favicon.rel = 'icon';
favicon.type = 'image/svg+xml';
favicon.href = uvdataLogo;
document.head.appendChild(favicon);

document.querySelector('#app').innerHTML = `
  <div>
    <img src="${uvdataLogo}" alt="UVdata logo" style="height:70px; margin-bottom:0.5em; display:block; margin-left:auto; margin-right:auto;" />
    <h1 style="color:#003E78; text-align:center;">Daily Standup Deltager Vælger</h1>
    <div class="card" id="startArea" style="margin-bottom:1.5em;">
      <button id="startBtn" type="button" style="background:#003E78; color:white;">Indlæs deltagere</button>
      <div style="margin-top:0.7em; color:#4F463D; font-size:0.95em;">Navne indlæses fra en JSON-fil og rækkefølgen blandes for retfærdighed. Du kan nulstille og blande igen når som helst.</div>
    </div>
    <div class="card" id="standupArea" style="display:none; background:#B4E1F9; color:#003E78; box-shadow:0 2px 12px #83B8E522;">
      <h2 id="currentPerson" style="font-size:2.2em; margin-bottom:0.2em;"></h2>
      <div id="remaining" style="font-size:1.1em; margin-bottom:1em;"></div>
      <button id="nextBtn" type="button" style="background:#83B8E5; color:white; margin-right:0.5em;">Næste person</button>
      <button id="resetBtn" type="button" style="background:#4F463D; color:white;">Nulstil</button>
      <div id="progressBar" style="margin-top:1.2em; height:10px; background:#e0e0e0; border-radius:5px; overflow:hidden;"><div id="progressFill" style="height:100%; width:0; background:#003E78; transition:width 0.4s;"></div></div>
      <div id="allNames" style="margin-top:1em; font-size:0.95em; color:#4F463D;"></div>
    </div>
    <div class="card" id="completedArea" style="display:none; background:#4CAF50; color:white; text-align:center; box-shadow:0 4px 12px rgba(76,175,80,0.3);">
      <h2 style="font-size:2em; margin-bottom:0.5em;">🎉 Standup færdig!</h2>
      <p style="font-size:1.1em; margin-bottom:1.5em;">Alle har haft deres tur</p>
      <button id="restartBtn" type="button" style="background:white; color:#4CAF50; font-weight:bold; padding:12px 24px;">Start forfra</button>
    </div>
  </div>
`

let sequence = [];
let currentIndex = 0;

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

const startBtn = document.getElementById('startBtn');
const startArea = document.getElementById('startArea');
const standupArea = document.getElementById('standupArea');
const completedArea = document.getElementById('completedArea');
const currentPerson = document.getElementById('currentPerson');
const nextBtn = document.getElementById('nextBtn');
const resetBtn = document.getElementById('resetBtn');
const restartBtn = document.getElementById('restartBtn');
const remaining = document.getElementById('remaining');
const progressFill = document.getElementById('progressFill');
const allNames = document.getElementById('allNames');

function updateStandupDisplay() {
  if (sequence.length === 0) {
    currentPerson.textContent = '';
    remaining.textContent = '';
    progressFill.style.width = '0';
    allNames.textContent = '';
    return;
  }
  
  // Tjek om vi er færdige
  if (currentIndex >= sequence.length) {
    standupArea.style.display = 'none';
    completedArea.style.display = '';
    return;
  }
  
  currentPerson.textContent = `Nuværende: ${sequence[currentIndex]}`;
  const next = currentIndex + 1 < sequence.length ? sequence[currentIndex + 1] : 'Ingen';
  remaining.textContent = `Næste: ${next}`;
  progressFill.style.width = `${((currentIndex+1)/sequence.length)*100}%`;
  allNames.innerHTML = sequence.map((n, i) => i === currentIndex ? `<b style='color:#003E78;'>${n}</b>` : n).join(' &rarr; ');
}

async function loadParticipants() {
  try {
    const res = await fetch(import.meta.env.BASE_URL + 'participants.json');
    if (!res.ok) throw new Error('Kunne ikke indlæse participants.json');
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('participants.json skal være et array af deltagere');
    // Find dagens ugedag på engelsk
    const weekdays = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const today = new Date();
    const day = weekdays[today.getDay()];
    // Filtrer deltagere der ikke skal med i dag
    const active = data.filter(p => !(p.exclude && p.exclude.includes(day)));
    if (active.length === 0) throw new Error('Ingen deltagere til stede i dag.');
    sequence = active.map(p => p.name);
    shuffle(sequence);
    currentIndex = 0;
    startArea.style.display = 'none';
    standupArea.style.display = '';
    completedArea.style.display = 'none';
    updateStandupDisplay();
  } catch (err) {
    showError(err.message);
  }
}

function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.innerHTML = `
    <div style="background: #f44336; color: white; padding: 16px; position: fixed; top: 20px; left: 50%; transform: translateX(-50%); border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); z-index: 1000; max-width: 90%;">
      <strong>⚠️ Fejl:</strong> ${message}
    </div>
  `;
  document.body.appendChild(errorDiv);
  setTimeout(() => errorDiv.remove(), 5000);
}

startBtn.onclick = () => {
  loadParticipants();
};

nextBtn.onclick = () => {
  currentIndex++;
  updateStandupDisplay();
};

resetBtn.onclick = () => {
  startArea.style.display = '';
  standupArea.style.display = 'none';
  completedArea.style.display = 'none';
  sequence = [];
  currentIndex = 0;
};

restartBtn.onclick = () => {
  completedArea.style.display = 'none';
  loadParticipants();
};
