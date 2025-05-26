import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'

document.querySelector('#app').innerHTML = `
  <div>
    <h1 style="color:#646cff;">Daily Scrum Person Sequence Selector</h1>
    <div class="card" style="margin-bottom:1.5em;">
      <input id="namesInput" type="text" placeholder="Enter names separated by commas (e.g. Alice, Bob, Carol)" style="width: 80%; padding: 0.7em; font-size:1.1em; border:1.5px solid #646cff; border-radius:6px;" />
      <button id="startBtn" type="button" style="margin-left:0.5em; background:#646cff; color:white;">Start Standup</button>
      <div style="margin-top:0.7em; color:#888; font-size:0.95em;">Names will be shuffled for fairness. You can reset and reshuffle anytime.</div>
    </div>
    <div class="card" id="standupArea" style="display:none; background:#f9f9f9; color:#213547; box-shadow:0 2px 12px #646cff22;">
      <h2 id="currentPerson" style="font-size:2.2em; margin-bottom:0.2em;"></h2>
      <div id="remaining" style="font-size:1.1em; margin-bottom:1em;"></div>
      <button id="nextBtn" type="button" style="background:#535bf2; color:white; margin-right:0.5em;">Next Person</button>
      <button id="resetBtn" type="button" style="background:#e4572e; color:white;">Reset</button>
      <div id="progressBar" style="margin-top:1.2em; height:10px; background:#e0e0e0; border-radius:5px; overflow:hidden;"><div id="progressFill" style="height:100%; width:0; background:#646cff; transition:width 0.4s;"></div></div>
      <div id="allNames" style="margin-top:1em; font-size:0.95em; color:#888;"></div>
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

const namesInput = document.getElementById('namesInput');
const startBtn = document.getElementById('startBtn');
const standupArea = document.getElementById('standupArea');
const currentPerson = document.getElementById('currentPerson');
const nextBtn = document.getElementById('nextBtn');
const resetBtn = document.getElementById('resetBtn');
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
  currentPerson.textContent = `Current: ${sequence[currentIndex]}`;
  const next = currentIndex + 1 < sequence.length ? sequence[currentIndex + 1] : 'None';
  remaining.textContent = `Next: ${next}`;
  progressFill.style.width = `${((currentIndex+1)/sequence.length)*100}%`;
  allNames.innerHTML = sequence.map((n, i) => i === currentIndex ? `<b style='color:#646cff;'>${n}</b>` : n).join(' &rarr; ');
}

startBtn.onclick = () => {
  const names = namesInput.value.split(',').map(n => n.trim()).filter(n => n);
  if (names.length === 0) {
    alert('Please enter at least one name.');
    return;
  }
  sequence = [...names];
  shuffle(sequence);
  currentIndex = 0;
  standupArea.style.display = '';
  updateStandupDisplay();
};

nextBtn.onclick = () => {
  if (currentIndex + 1 < sequence.length) {
    currentIndex++;
    updateStandupDisplay();
  } else {
    alert('Standup complete!');
    standupArea.style.display = 'none';
  }
};

resetBtn.onclick = () => {
  standupArea.style.display = 'none';
  namesInput.value = '';
  sequence = [];
  currentIndex = 0;
};
