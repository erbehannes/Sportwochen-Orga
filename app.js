import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getDatabase, ref, onValue, set, get } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";

// Firebase Konfiguration
const firebaseConfig = {
  apiKey: "AIzaSyBvDHcYfeQdIwmXd3qnF97K-PQKH4NICf0",
  authDomain: "sportwoche-sv-langen.firebaseapp.com",
  databaseURL: "https://sportwoche-sv-langen-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "sportwoche-sv-langen",
  storageBucket: "sportwoche-sv-langen.appspot.com",
  messagingSenderId: "529824987070",
  appId: "1:529824987070:web:d8933f03fdd1a74598abef"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const pageContext = window.location.pathname.includes("helfer")
  ? "helfer"
  : window.location.pathname.includes("verpflegung")
    ? "verpflegung"
    : "orga";

function sanitizeKey(input) {
  return input.replace(/[^\w\s]/g, '').replace(/\s+/g, '_');
}

function formatTime(ts) {
  const d = new Date(ts);
  return `${d.toLocaleDateString('de-DE')} – ${d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`;
}

// Veranstaltungen
const events = {
  "Dienstag, 15.07.2025": [
    { time: "19:00", title: "Herrenspiele höhere Klassen" },
    { time: "20:15", title: "Finale" }
  ],
  "Mittwoch, 16.07.2025": [
    { time: "15:00–17:00", title: "Spiel- und Sportnachmittag (Grundschule 1–4)" },
    { time: "19:30", title: "SV Langen I – BW Papenburg I" }
  ],
  "Donnerstag, 17.07.2025": [
    { time: "15:30–17:30", title: "Sportnachmittag bis 6 Jahre" },
    { time: "18:30", title: "SV Langen II Turnier" },
    { time: "19:30", title: "Damenspiel" },
    { time: "20:15", title: "Finale Herrenturnier" }
  ],
  "Freitag, 18.07.2025": [
    { time: "16:00", title: "Mini-Kicker Turnier" },
    { time: "17:00", title: "Sportmania" },
    { time: "18:00", title: "Alte Herren Turnier" },
    { time: "20:00", title: "Aufstiegsmannschaftsspiel 2015" },
    { time: "21:00", title: "Große Tagestombola" }
  ],
  "Samstag, 19.07.2025": [
    { time: "10:00", title: "TTVN-Race Tischtennis" },
    { time: "10:00", title: "LK-Tennisturnier" },
    { time: "14:30", title: "Langen läuft Rund" }
  ],
  "Sonntag, 20.07.2025": [
    { time: "10:30", title: "Familienmesse" },
    { time: "14:30", title: "Dorfpokalturnier" },
    { time: "15:00", title: "Kinderolympiade + Kaffee & Kuchen" },
    { time: "17:00", title: "Große Tombola" }
  ]
};

function renderPlan() {
  const container = document.getElementById('week-plan');
  const navSelect = document.getElementById('day-select');
  container.innerHTML = '';
  navSelect.innerHTML = '';

  Object.entries(events).forEach(([day, list]) => {
    const anchorId = sanitizeKey(day);
    const option = document.createElement('option');
    option.value = anchorId;
    option.textContent = day;
    navSelect.appendChild(option);

    const dayCard = document.createElement('div');
    dayCard.className = 'day-card';
    dayCard.id = anchorId;

    const dayHeader = document.createElement('div');
    dayHeader.className = 'day-header';
    dayHeader.textContent = day;
    dayCard.appendChild(dayHeader);

    list.forEach((item, i) => {
      const key = `${pageContext}/${anchorId}_${i}`;
      const dbRef = ref(db, `events/${key}`);

      const eventEl = document.createElement('div');
      eventEl.className = 'event';

      const title = document.createElement('div');
      title.className = 'event-title';
      title.textContent = `🕒 ${item.time} – ${item.title}`;

      const statusBtn = document.createElement('button');
      statusBtn.textContent = '⬜ Offen';
      statusBtn.style.backgroundColor = '#ccc';

      const grid = document.createElement('div');
      grid.className = 'input-grid';

      const responsible = document.createElement('input');
      responsible.type = 'text';
      responsible.placeholder = 'Verantwortlich';

      const note = document.createElement('textarea');
      note.placeholder = 'Neue Notiz';

      const saveBtn = document.createElement('button');
      saveBtn.textContent = '💾';

      const notes = document.createElement('div');
      notes.className = 'notes';

      onValue(dbRef, snapshot => {
        const data = snapshot.val() || { responsible: "", notes: [], done: false };
        responsible.value = data.responsible || '';
        statusBtn.textContent = data.done ? '✅ Erledigt' : '⬜ Offen';
        statusBtn.style.backgroundColor = data.done ? '#28a745' : '#ccc';
        notes.innerHTML = '';
        (data.notes || []).forEach((n, index) => {
          const p = document.createElement('div');
          p.className = 'note-entry';
          p.innerHTML = `<span><strong>${formatTime(n.timestamp)}:</strong> ${n.text}</span>`;
          const delBtn = document.createElement('button');
          delBtn.textContent = '🗑️';
          delBtn.onclick = async () => {
            if (!confirm("Diese Notiz löschen?")) return;
            const snap = await get(dbRef);
            const d = snap.val();
            if (d && d.notes) {
              d.notes.splice(index, 1);
              await set(dbRef, d);
            }
          };
          p.appendChild(delBtn);
          notes.appendChild(p);
        });
      });

      statusBtn.onclick = async () => {
        const snapshot = await get(dbRef);
        const data = snapshot.val() || {};
        const newStatus = !(data.done === true);
        data.done = newStatus;
        await set(dbRef, data);
      };

      saveBtn.onclick = async () => {
        const noteText = note.value.trim();
        if (!noteText && !responsible.value.trim()) return;
        const snapshot = await get(dbRef);
        const data = snapshot.val() || { responsible: "", notes: [], done: false };
        const updated = {
          responsible: responsible.value,
          notes: data.notes || [],
          done: data.done || false
        };
        if (noteText) {
          updated.notes.push({ text: noteText, timestamp: Date.now() });
        }
        await set(dbRef, updated);
        note.value = '';
      };

      grid.appendChild(responsible);
      grid.appendChild(note);
      grid.appendChild(saveBtn);

      eventEl.appendChild(title);
      eventEl.appendChild(statusBtn);
      eventEl.appendChild(grid);
      eventEl.appendChild(notes);
      dayCard.appendChild(eventEl);
    });

    container.appendChild(dayCard);
  });

  navSelect.onchange = () => {
    const id = navSelect.value;
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };
}

// Zurück-nach-oben Button
const backBtn = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  backBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
});
backBtn.onclick = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

document.addEventListener('DOMContentLoaded', renderPlan);
