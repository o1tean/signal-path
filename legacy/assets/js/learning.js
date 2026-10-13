/* Learning navigation and a local notebook. No network calls. */
(function () {
  "use strict";
  var SP = window.SP;
  if (!SP) return;
  function today() {
    var date = new Date();
    return (
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0")
    );
  }
  function renderResume() {
    var next = SP.MODULES.find(function (m) {
      return !SP.isDone(m.id);
    });
    document.querySelectorAll("[data-resume]").forEach(function (link) {
      link.href = SP.root + (next ? next.href : "notebook.html#review");
      link.textContent = next
        ? next.n + " · " + next.title + " →"
        : "All modules marked complete. Review your evidence →";
    });
  }
  document.addEventListener("sp:state", renderResume);
  renderResume();
  document.querySelectorAll("[data-course-stages]").forEach(function (host) {
    window.SP_COURSE.stages.forEach(function (stage) {
      var list = SP.el("ol", { class: "route-links" });
      stage.modules.forEach(function (id) {
        var m = SP.MODULES.find(function (m) { return m.id === id; });
        list.appendChild(SP.el("li", {}, [SP.el("a", {
          href: SP.root + m.href, text: m.n + " · " + m.title
        })]));
      });
      host.appendChild(SP.el("div", { class: "card", id: stage.id }, [
        SP.el("p", { class: "eyebrow", text: stage.label }),
        SP.el("h3", { text: stage.title }),
        SP.el("p", { text: stage.description }),
        list,
        SP.el("p", {}, [SP.el("b", { text: "Checkpoint: " }), stage.evidence])
      ]));
    });
  });
  var form = document.getElementById("notebook-form");
  if (!form) return;
  var select = document.getElementById("note-module");
  var fields = ["setup", "prediction", "observation", "explanation", "review"];
  var controls = {};
  fields.forEach(function (key) {
    controls[key] = document.getElementById("note-" + key);
  });
  var status = document.getElementById("note-status");
  var dirty = false,
    currentId;
  SP.MODULES.forEach(function (m) {
    select.appendChild(
      SP.el("option", { value: m.id, text: m.n + " · " + m.title }),
    );
  });
  var requested = new URLSearchParams(location.search).get("module");
  if (
    SP.MODULES.some(function (m) {
      return m.id === requested;
    })
  )
    select.value = requested;
  function showEntry() {
    currentId = select.value;
    var note = SP.state.notes[currentId] || {};
    fields.forEach(function (key) {
      controls[key].value = typeof note[key] === "string" ? note[key] : "";
    });
    var mod = SP.MODULES.find(function (m) {
      return m.id === currentId;
    });
    document.getElementById("note-lesson").href = mod.href;
    status.textContent = note.updated
      ? "Last saved: " +
        new Date(note.updated).toLocaleString() +
        (note.retrieved ? ". Explained without notes: " + note.retrieved : "")
      : "No saved entry for this module yet.";
    dirty = false;
  }
  function saveEntry(retrieved) {
    var note = {};
    fields.forEach(function (key) {
      note[key] = controls[key].value.trim();
    });
    note.updated = new Date().toISOString();
    note.retrieved = retrieved
      ? today()
      : (SP.state.notes[currentId] || {}).retrieved || "";
    SP.state.notes[currentId] = note;
    var stored = SP.save();
    dirty = !stored;
    status.textContent = stored
      ? (retrieved ? "Retrieval recorded. " : "Entry saved. ") +
        "Export a backup to keep a separate copy."
      : "Kept in this tab, but browser storage failed. Download a backup before leaving.";
    renderReviews();
  }
  form.addEventListener("input", function (event) {
    if (event.target !== select) dirty = true;
  });
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    saveEntry(false);
  });
  document
    .getElementById("note-retrieved")
    .addEventListener("click", function () {
      saveEntry(true);
    });
  select.addEventListener("change", function () {
    if (dirty && !confirm("Discard unsaved edits and switch modules?")) {
      select.value = currentId;
      return;
    }
    showEntry();
  });
  window.addEventListener("beforeunload", function (event) {
    if (dirty) {
      event.preventDefault();
      event.returnValue = "";
    }
  });
  function renderReviews() {
    var host = document.getElementById("review-queue");
    host.replaceChildren();
    var entries = SP.MODULES.filter(function (m) {
      return SP.state.notes[m.id];
    });
    if (!entries.length) {
      host.appendChild(
        SP.el("p", {
          text: "No saved entries yet. Start with one prediction.",
        }),
      );
      return;
    }
    var list = SP.el("ul");
    entries.sort(function (a, b) {
      return (SP.state.notes[a.id].review || "9999").localeCompare(
        SP.state.notes[b.id].review || "9999",
      );
    });
    entries.forEach(function (m) {
      var n = SP.state.notes[m.id];
      var label = n.review
        ? (n.review <= today() ? "Review due: " : "Review: ") + n.review
        : "No review date";
      list.appendChild(
        SP.el("li", {}, [
          SP.el("a", {
            href: "notebook.html?module=" + m.id,
            text: m.n + " · " + m.title,
          }),
          " — " + label,
        ]),
      );
    });
    host.appendChild(list);
  }
  var backupStatus = document.getElementById("backup-status");
  document
    .getElementById("export-backup")
    .addEventListener("click", function () {
      if (dirty) saveEntry(false);
      var payload = {
        format: "signal-path-backup",
        version: 1,
        exportedAt: new Date().toISOString(),
        state: SP.state,
      };
      var blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      var url = URL.createObjectURL(blob);
      var link = SP.el("a", {
        href: url,
        download: "signal-path-" + today() + ".json",
      });
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 1000);
      backupStatus.textContent =
        "Backup download requested. Keep the file private.";
    });
  function validateBackup(payload) {
    function object(x) {
      return !!x && typeof x === "object" && !Array.isArray(x);
    }
    function string(x, max) {
      return typeof x === "string" && x.length <= max;
    }
    function fail() {
      throw new Error(
        "This file is not a valid Signal Path backup. Your data was not changed.",
      );
    }
    function date(x) {
      return (
        x === "" ||
        (string(x, 10) &&
          /^\d{4}-\d{2}-\d{2}$/.test(x) &&
          !isNaN(Date.parse(x)))
      );
    }
    if (
      !object(payload) ||
      payload.format !== "signal-path-backup" ||
      payload.version !== 1 ||
      !object(payload.state)
    )
      fail();
    var input = payload.state,
      output = { done: {}, quiz: {}, badges: {}, atlas: [], notes: {} };
    if (
      !object(input.done) ||
      !object(input.quiz) ||
      !object(input.badges) ||
      !object(input.notes) ||
      !Array.isArray(input.atlas) ||
      input.atlas.length > 500
    )
      fail();
    var ids = SP.MODULES.map(function (m) {
      return m.id;
    });
    ids.forEach(function (id) {
      if (id in input.done) {
        if (typeof input.done[id] !== "boolean") fail();
        output.done[id] = input.done[id];
      }
      if (id in input.notes) {
        var note = input.notes[id];
        if (!object(note)) fail();
        var clean = {};
        ["setup", "prediction", "observation", "explanation"].forEach(
          function (key) {
            if (!string(note[key], 6000)) fail();
            clean[key] = note[key];
          },
        );
        if (!date(note.review) || !date(note.retrieved)) fail();
        if (!string(note.updated, 40) || isNaN(Date.parse(note.updated)))
          fail();
        clean.review = note.review;
        clean.retrieved = note.retrieved;
        clean.updated = note.updated;
        output.notes[id] = clean;
      }
    });
    ids.concat(["primer", "mixed"]).forEach(function (id) {
      if (!(id in input.quiz)) return;
      var q = input.quiz[id];
      if (
        !object(q) ||
        !Number.isInteger(q.score) ||
        !Number.isInteger(q.total) ||
        q.total < 1 ||
        q.total > 1000 ||
        q.score < 0 ||
        q.score > q.total
      )
        fail();
      output.quiz[id] = { score: q.score, total: q.total };
    });
    SP.BADGES.forEach(function (b) {
      if (b.id in input.badges) {
        if (typeof input.badges[b.id] !== "boolean") fail();
        output.badges[b.id] = input.badges[b.id];
      }
    });
    output.atlas = input.atlas.map(function (row) {
      if (!object(row)) fail();
      var clean = {};
      [
        "name",
        "category",
        "frequency",
        "modulation",
        "protocol",
        "codeType",
        "notes",
      ].forEach(function (key) {
        if (!string(row[key], 10000)) fail();
        clean[key] = row[key];
      });
      if (row.sample === true) clean.sample = true;
      return clean;
    });
    return output;
  }
  document
    .getElementById("import-backup")
    .addEventListener("change", async function (event) {
      var file = event.target.files[0];
      if (!file) return;
      try {
        if (file.size > 1024 * 1024)
          throw new Error(
            "Backup is larger than 1 MB. Your data was not changed.",
          );
        var restored = validateBackup(JSON.parse(await file.text()));
        if (
          !confirm(
            "Replace this browser’s progress, atlas and notebook with this backup? Download a backup first if needed.",
          )
        ) {
          backupStatus.textContent =
            "Restore cancelled. Your data was not changed.";
          return;
        }
        // Preserve the shared state object used by the quiz and progress runtime.
        ["done", "quiz", "badges", "atlas", "notes"].forEach(function (key) {
          SP.state[key] = restored[key];
        });
        var stored = SP.save();
        showEntry();
        renderReviews();
        backupStatus.textContent = stored
          ? "Backup restored."
          : "Restored in this tab only. Browser storage failed; retain your backup.";
      } catch (error) {
        backupStatus.textContent =
          error instanceof SyntaxError
            ? "Invalid JSON. Your data was not changed."
            : error.message;
      } finally {
        event.target.value = "";
      }
    });
  showEntry();
  renderReviews();
})();
