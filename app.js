/***** YOUR SUPABASE KEYS (REQUIRED) *****/
const SUPABASE_URL = "https://laoqldlqgjbubsgtsgqt.supabase.co";        
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxhb3FsZGxxZ2pidWJzZ3RzZ3F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MDIxNDUsImV4cCI6MjA3NTA3ODE0NX0.6d3v8c14pDDGAYdM5Px3EXnyQobRRqjAb2rTU3o7niM..";           
/***** INIT *****/
const client = (typeof supabase !== "undefined")
  ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
const form = document.getElementById("buildingForm");
const leadScore = document.getElementById("leadScore");
const aiNotes = document.getElementById("aiNotes");
const events = document.getElementById("events");
const socList = document.getElementById("socList");

/***** GLOBAL ERROR (prints to page) *****/
window.onerror = function (msg, src, line, col, err) {
  const li = document.createElement("li");
  li.style.color = "#f99";
  li.textContent = "JS Error: " + msg;
  events.prepend(li);
};

/***** PAGE LOADED BANNER *****/
(function boot(){
  const li = document.createElement("li");
  li.textContent = "app.js loaded";
  events.prepend(li);

  if (typeof supabase === "undefined") {
    const e = document.createElement("li");
    e.style.color = "#f99";
    e.textContent = "Supabase CDN NOT loaded – check <script> order in index.html";
    events.prepend(e);
  }
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    const e = document.createElement("li");
    e.style.color = "#f99";
    e.textContent = "Missing SUPABASE_URL or SUPABASE_ANON_KEY at top of app.js";
    events.prepend(e);
  }
})();

/***** SAVE *****/
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("socName").value.trim();
  const location = document.getElementById("location").value.trim();
  const oc_year = parseInt(document.getElementById("ocYear").value || "0", 10) || null;
  const floors = parseInt(document.getElementById("floors").value || "0", 10) || null;

  if (!name) { alert("Enter Society Name"); return; }
  if (!client) { alert("Supabase client missing – check CDN & keys"); return; }

  // mock lead score
  let score = 50; if (oc_year && oc_year < 1995) score += 20; if (floors && floors > 7) score += 10;
  leadScore.textContent = `Lead Score: ${score}/100`;
  aiNotes.textContent = `AI suggests extra NDT tests for ${floors || 1} floors.`;

  const { error } = await client.from("societies").insert({ name, location, oc_year, floors });
  if (error) {
    alert("Save failed: " + error.message);
    const li = document.createElement("li"); li.style.color="#f99";
    li.textContent = "Save failed: " + error.message;
    events.prepend(li);
    return;
  }

  const li = document.createElement("li");
  li.textContent = "Saved to Supabase: " + name;
  events.prepend(li);

  await refreshList();
  form.reset();
});

/***** LIST *****/
async function refreshList(){
  if (!client) return;
  socList.innerHTML = "<li style='color:#9fb2cf'>Loading…</li>";
  const { data, error } = await client.from("societies").select("*").order("created_at", { ascending:false }).limit(50);
  if (error) { socList.innerHTML = `<li style='color:#f99'>${error.message}</li>`; return; }
  socList.innerHTML = (data||[]).map(r => {
    const age = r.oc_year ? (new Date().getFullYear() - r.oc_year) : "—";
    return `<li style="margin:6px 0;padding:8px;border:1px solid #2b3d5b;border-radius:6px">
      <strong>${r.name}</strong> · OC: ${r.oc_year ?? "—"} · Floors: ${r.floors ?? "—"} · Age: ${age} · ${r.location || ""}
    </li>`;
  }).join("") || "<li style='color:#9fb2cf'>No records yet</li>";
}
refreshList();

/***** QUICK MANUAL HEALTH CHECK *****/
window.healthCheck = async function(){
  if (!client) { alert("Client missing"); return; }
  const { data, error } = await client.from("societies").select("id").limit(1);
  if (error) alert("Query error: " + error.message);
  else alert("OK: can query. Rows: " + (data?.length ?? 0));
};
