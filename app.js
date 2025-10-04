
const SUPABASE_URL = "https://laoqldlqgjbubsgtsgqt.supabase.co";

const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxhb3FsZGxxZ2pidWJzZ3RzZ3F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MDIxNDUsImV4cCI6MjA3NTA3ODE0NX0.6d3v8c14pDDGAYdM5Px3EXnyQobRRqjAb2rTU3o7niM
ey...";          

/***** 2) INIT *****/
const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const form = document.getElementById("buildingForm");
const leadScore = document.getElementById("leadScore");
const aiNotes = document.getElementById("aiNotes");
const events = document.getElementById("events");
const socList = document.getElementById("socList");

function logEvent(text){
  const li = document.createElement("li");
  li.textContent = `${new Date().toLocaleString()} — ${text}`;
  events.prepend(li);
}

/***** 3) SAVE TO SUPABASE *****/
form.addEventListener("submit", async (e) => {
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

  // insert row
  const { error } = await client.from("societies").insert({ name, location, oc_year, floors });
  if (error) { alert("Save failed: " + error.message); return; }

  logEvent(`Saved to Supabase: ${name}`);
  await refreshList();
  form.reset();
});

/***** 4) LIST SOCIETIES *****/
async function refreshList(){
  socList.innerHTML = "<li style='color:#9fb2cf'>Loading…</li>";
  const { data, error } = await client
    .from("societies")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) { socList.innerHTML = `<li style='color:#f99'>${error.message}</li>`; return; }
  socList.innerHTML = data.map(r => {
    const age = r.oc_year ? (new Date().getFullYear() - r.oc_year) : "—";
    return `<li style="margin:6px 0;padding:8px;border:1px solid #2b3d5b;border-radius:6px">
      <strong>${r.name}</strong> · OC: ${r.oc_year ?? "—"} · Floors: ${r.floors ?? "—"} · Age: ${age} · ${r.location || ""}
    </li>`;
  }).join("") || "<li style='color:#9fb2cf'>No records yet</li>";
}
refreshList();
const btnHealth = document.getElementById("btnHealth");
const healthOut = document.getElementById("healthOut");

if (btnHealth) {
  btnHealth.addEventListener("click", async () => {
    healthOut.textContent = "Checking...";
    try {
      // Try a simple select (should work if URL/key/RLS are OK)
      const { data, error } = await client.from("societies").select("id").limit(1);
      if (error) {
        healthOut.textContent = "Error: " + error.message;
      } else {
        healthOut.textContent = "OK ✅ Able to query `societies`.\nRows found (first page): " + (data?.length ?? 0);
      }
    } catch (e) {
      healthOut.textContent = "Exception: " + String(e);
    }
  });
}
// ====== ULTRA-LOUD GLOBAL ERROR HANDLER ======
window.onerror = function (msg, src, line, col, err) {
  const out = document.getElementById("healthOut");
  if (out) {
    out.textContent = "Global error: " + msg + "\n" + (err ? (err.stack || err) : "") + "\n@" + src + ":" + line + ":" + col;
  } else {
    alert("Global error: " + msg);
  }
};

// ====== SHOW THAT app.js ITSELF LOADED ======
(function showLoadedBanner(){
  const el = document.getElementById("healthOut");
  if (el) el.textContent = "HealthCheck ready. (app.js loaded)";
  else console.log("HealthOut element not found yet");
})();

// ====== EXPOSED FUNCTION CALLED BY BUTTON ONCLICK ======
window.healthCheck = async function(){
  const out = document.getElementById("healthOut");
  if (!out) { alert("healthOut element missing in HTML"); return; }

  out.textContent = "Checking…";

  try {
    // 1) Prove Supabase CDN loaded
    if (typeof supabase === "undefined") {
      out.textContent = "Error: supabase global is NOT defined. Did you include the CDN before app.js in index.html?";
      return;
    }

    // 2) Prove your client exists (defined earlier in app.js)
    if (typeof client === "undefined" || !client) {
      out.textContent = "Error: Supabase client not initialised. Check SUPABASE_URL and SUPABASE_ANON_KEY at the TOP of app.js.";
      return;
    }

    // 3) Try a trivial query (hits RLS policies)
    const { data, error } = await client.from("societies").select("id").limit(1);
    if (error) {
      out.textContent = "Query error: " + error.message;
      return;
    }

    out.textContent = "OK ✅ Able to query `societies`. Rows returned: " + (data?.length ?? 0);
  } catch (e) {
    out.textContent = "Exception: " + String(e);
  }
};// ====== ULTRA-LOUD GLOBAL ERROR HANDLER ======
window.onerror = function (msg, src, line, col, err) {
  const out = document.getElementById("healthOut");
  if (out) {
    out.textContent = "Global error: " + msg + "\n" + (err ? (err.stack || err) : "") + "\n@" + src + ":" + line + ":" + col;
  } else {
    alert("Global error: " + msg);
  }
};

// ====== SHOW THAT app.js ITSELF LOADED ======
(function showLoadedBanner(){
  const el = document.getElementById("healthOut");
  if (el) el.textContent = "HealthCheck ready. (app.js loaded)";
  else console.log("HealthOut element not found yet");
})();

// ====== EXPOSED FUNCTION CALLED BY BUTTON ONCLICK ======
window.healthCheck = async function(){
  const out = document.getElementById("healthOut");
  if (!out) { alert("healthOut element missing in HTML"); return; }

  out.textContent = "Checking…";

  try {
    // 1) Prove Supabase CDN loaded
    if (typeof supabase === "undefined") {
      out.textContent = "Error: supabase global is NOT defined. Did you include the CDN before app.js in index.html?";
      return;
    }

    // 2) Prove your client exists (defined earlier in app.js)
    if (typeof client === "undefined" || !client) {
      out.textContent = "Error: Supabase client not initialised. Check SUPABASE_URL and SUPABASE_ANON_KEY at the TOP of app.js.";
      return;
    }

    // 3) Try a trivial query (hits RLS policies)
    const { data, error } = await client.from("societies").select("id").limit(1);
    if (error) {
      out.textContent = "Query error: " + error.message;
      return;
    }

    out.textContent = "OK ✅ Able to query `societies`. Rows returned: " + (data?.length ?? 0);
  } catch (e) {
    out.textContent = "Exception: " + String(e);
  }
};
// ====== ULTRA-LOUD GLOBAL ERROR HANDLER ======
window.onerror = function (msg, src, line, col, err) {
  const out = document.getElementById("healthOut");
  if (out) {
    out.textContent = "Global error: " + msg + "\n" + (err ? (err.stack || err) : "") + "\n@" + src + ":" + line + ":" + col;
  } else {
    alert("Global error: " + msg);
  }
};// ====== ULTRA-LOUD GLOBAL ERROR HANDLER ======
window.onerror = function (msg, src, line, col, err) {
  const out = document.getElementById("healthOut");
  if (out) {
    out.textContent = "Global error: " + msg + "\n" + (err ? (err.stack || err) : "") + "\n@" + src + ":" + line + ":" + col;
  } else {
    alert("Global error: " + msg);
  }
};

// ====== SHOW THAT app.js ITSELF LOADED ======
(function showLoadedBanner(){
  const el = document.getElementById("healthOut");
  if (el) el.textContent = "HealthCheck ready. (app.js loaded)";
  else console.log("HealthOut element not found yet");
})();

// ====== EXPOSED FUNCTION CALLED BY BUTTON ONCLICK ======
window.healthCheck = async function(){
  const out = document.getElementById("healthOut");
  if (!out) { alert("healthOut element missing in HTML"); return; }

  out.textContent = "Checking…";

  try {
    // 1) Prove Supabase CDN loaded
    if (typeof supabase === "undefined") {
      out.textContent = "Error: supabase global is NOT defined. Did you include the CDN before app.js in index.html?";
      return;
    }

    // 2) Prove your client exists (defined earlier in app.js)
    if (typeof client === "undefined" || !client) {
      out.textContent = "Error: Supabase client not initialised. Check SUPABASE_URL and SUPABASE_ANON_KEY at the TOP of app.js.";
      return;
    }

    // 3) Try a trivial query (hits RLS policies)
    const { data, error } = await client.from("societies").select("id").limit(1);
    if (error) {
      out.textContent = "Query error: " + error.message;
      return;
    }

    out.textContent = "OK ✅ Able to query `societies`. Rows returned: " + (data?.length ?? 0);
  } catch (e) {
    out.textContent = "Exception: " + String(e);
  }
};


