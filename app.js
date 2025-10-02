const form = document.getElementById("buildingForm");
const leadScore = document.getElementById("leadScore");
const aiNotes = document.getElementById("aiNotes");
const events = document.getElementById("events");
const socList = document.getElementById("socList");

// local in-memory array for now (DB comes later)
const localRows = [];

function logEvent(text){
  const li = document.createElement("li");
  li.textContent = `${new Date().toLocaleString()} — ${text}`;
  events.prepend(li);
}

function renderList(){
  if (!localRows.length) {
    socList.innerHTML = "<li style='color:#9fb2cf'>No records yet</li>";
    return;
  }
  socList.innerHTML = localRows.map(r => {
    const age = r.oc_year ? (new Date().getFullYear() - r.oc_year) : "—";
    return `<li style="margin:6px 0;padding:8px;border:1px solid #2b3d5b;border-radius:6px">
      <strong>${r.name}</strong> · OC: ${r.oc_year ?? "—"} · Floors: ${r.floors ?? "—"} · Age: ${age} · ${r.location || ""}
    </li>`;
  }).join("");
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("socName").value.trim();
  const location = document.getElementById("location").value.trim();
  const oc_year = parseInt(document.getElementById("ocYear").value || "0", 10) || null;
  const floors = parseInt(document.getElementById("floors").value || "0", 10) || null;

  if (!name) { alert("Please enter Society Name"); return; }

  // simple lead score (mock)
  let score = 50; if (oc_year && oc_year < 1995) score += 20; if (floors && floors > 7) score += 10;
  leadScore.textContent = `Lead Score: ${score}/100`;
  aiNotes.textContent = `AI suggests extra NDT tests for ${floors || 1} floors.`;

  localRows.unshift({ name, location, oc_year, floors, created_at: new Date().toISOString() });
  renderList();
  logEvent(`Saved locally: ${name}`);
  form.reset();
});

renderList();
