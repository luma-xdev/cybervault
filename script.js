"use strict";

/* =========================================================
   CYBERVAULT
   COMPLETE FRONTEND APPLICATION
   ========================================================= */

const STORAGE = {
  labs: "cybervault_labs",
  challenges: "cybervault_challenges",
  notes: "cybervault_notes",
  skills: "cybervault_skills",
  activities: "cybervault_activities",
  notifications: "cybervault_notifications",
  settings: "cybervault_settings",
  timer: "cybervault_timer",
  loggedIn: "cybervault_logged_in"
};


/* =========================================================
   HELPERS
   ========================================================= */

const $ = selector => document.querySelector(selector);

const $$ = selector => document.querySelectorAll(selector);

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function load(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message, type = "success") {

  const container = $("#toastContainer");

  if (!container) return;

  const toast = document.createElement("div");

  toast.className = `toast ${type === "error" ? "error" : ""}`;

  toast.innerHTML = `
    <i class="fa-solid ${
      type === "error"
        ? "fa-circle-exclamation"
        : "fa-circle-check"
    }"></i>

    <div>
      <strong>${type === "error" ? "Error" : "Success"}</strong>
      <span>${escapeHTML(message)}</span>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(20px)";

    setTimeout(() => toast.remove(), 250);
  }, 2800);
}

function formatDate(value) {

  if (!value) return "—";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function today() {

  const d = new Date();

  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0")
  ].join("-");
}


/* =========================================================
   DEFAULT DATA
   ========================================================= */

const DEFAULT_LABS = [
  {
    id: 1,
    name: "Linux Fundamentals",
    platform: "Learning Lab",
    category: "Linux",
    difficulty: "beginner",
    status: "completed",
    date: "2026-09-10",
    notes: "Linux commands, permissions and filesystem basics."
  },
  {
    id: 2,
    name: "Web Security Basics",
    platform: "Security Lab",
    category: "Web Security",
    difficulty: "beginner",
    status: "in-progress",
    date: "2026-09-15",
    notes: "Authentication, sessions and common web vulnerabilities."
  },
  {
    id: 3,
    name: "Network Enumeration",
    platform: "Practice Lab",
    category: "Networking",
    difficulty: "intermediate",
    status: "planned",
    date: "2026-09-20",
    notes: "Practice identifying services and understanding network exposure."
  },
  {
    id: 4,
    name: "Security Monitoring",
    platform: "Blue Team Lab",
    category: "Defensive Security",
    difficulty: "intermediate",
    status: "planned",
    date: "2026-09-24",
    notes: "Log analysis and basic incident detection."
  }
];

const DEFAULT_CHALLENGES = [
  {
    id: 1,
    name: "Network Recon Challenge",
    platform: "Practice",
    category: "Networking",
    difficulty: "beginner",
    status: "completed",
    date: "2026-09-08"
  },
  {
    id: 2,
    name: "Linux Permissions",
    platform: "Practice",
    category: "Linux",
    difficulty: "beginner",
    status: "completed",
    date: "2026-09-11"
  },
  {
    id: 3,
    name: "Web Authentication",
    platform: "Practice",
    category: "Web Security",
    difficulty: "intermediate",
    status: "in-progress",
    date: "2026-09-16"
  }
];

const DEFAULT_NOTES = [
  {
    id: 1,
    title: "HTTP Basics",
    category: "Web Security",
    content: "HTTP is an application-layer protocol used for communication between clients and servers."
  },
  {
    id: 2,
    title: "Linux Permissions",
    category: "Linux",
    content: "Linux permissions are commonly represented by read, write and execute permissions for owner, group and others."
  },
  {
    id: 3,
    title: "DNS Fundamentals",
    category: "Networking",
    content: "DNS translates human-readable domain names into IP addresses and other records."
  }
];

const DEFAULT_SKILLS = [
  {
    name: "Networking",
    progress: 72
  },
  {
    name: "Linux",
    progress: 64
  },
  {
    name: "Web Security",
    progress: 48
  },
  {
    name: "Cryptography",
    progress: 35
  },
  {
    name: "Defensive Security",
    progress: 42
  },
  {
    name: "Pentesting",
    progress: 31
  }
];

const DEFAULT_ACTIVITIES = [
  {
    icon: "fa-flask",
    title: "Linux Fundamentals lab completed",
    time: "Today"
  },
  {
    icon: "fa-flag",
    title: "Linux Permissions challenge completed",
    time: "Yesterday"
  },
  {
    icon: "fa-note-sticky",
    title: "HTTP Basics note added",
    time: "2 days ago"
  }
];

const DEFAULT_NOTIFICATIONS = [
  {
    icon: "fa-shield-halved",
    title: "CyberVault system is online.",
    time: "Now"
  },
  {
    icon: "fa-flask",
    title: "You have labs waiting for completion.",
    time: "Today"
  }
];


/* =========================================================
   STATE
   ========================================================= */

let labs = load(STORAGE.labs, DEFAULT_LABS);
let challenges = load(STORAGE.challenges, DEFAULT_CHALLENGES);
let notes = load(STORAGE.notes, DEFAULT_NOTES);
let skills = load(STORAGE.skills, DEFAULT_SKILLS);
let activities = load(STORAGE.activities, DEFAULT_ACTIVITIES);
let notifications = load(STORAGE.notifications, DEFAULT_NOTIFICATIONS);

let settings = load(STORAGE.settings, {
  darkMode: true,
  notifications: true
});

let timerData = load(STORAGE.timer, {
  sessions: 0,
  minutes: 0
});

let timerSeconds = 25 * 60;
let timerRunning = false;
let timerInterval = null;

let currentTimerMinutes = 25;


/* =========================================================
   INIT
   ========================================================= */

document.addEventListener("DOMContentLoaded", init);

function init() {

  initializeLogin();

  initializeNavigation();

  initializeTheme();

  initializeButtons();

  renderAll();

}


/* =========================================================
   LOGIN
   ========================================================= */

function initializeLogin() {

  const form = $("#loginForm");
  const loginScreen = $("#loginScreen");
  const app = $("#app");

  const loggedIn =
    localStorage.getItem(STORAGE.loggedIn);

  if (loggedIn === "true") {

    loginScreen.classList.add("hidden");
    app.classList.remove("hidden");

  }


  form.addEventListener("submit", event => {

    event.preventDefault();

    const email = $("#loginEmail").value.trim();
    const password = $("#loginPassword").value.trim();

    if (!email || !password) {

      showToast(
        "Please enter your email and password.",
        "error"
      );

      return;
    }

    localStorage.setItem(
      STORAGE.loggedIn,
      "true"
    );

    loginScreen.classList.add("hidden");
    app.classList.remove("hidden");

    showToast("Welcome to CyberVault.");

  });


  $("#passwordToggle").addEventListener(
    "click",
    () => {

      const input = $("#loginPassword");

      const icon =
        $("#passwordToggle i");

      if (input.type === "password") {

        input.type = "text";

        icon.className =
          "fa-solid fa-eye-slash";

      } else {

        input.type = "password";

        icon.className =
          "fa-solid fa-eye";

      }

    }
  );


  $("#logoutBtn").addEventListener(
    "click",
    () => {

      localStorage.removeItem(
        STORAGE.loggedIn
      );

      $("#app").classList.add("hidden");
      $("#loginScreen").classList.remove("hidden");

      showToast("Logged out.");

    }
  );

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function initializeNavigation() {

  $$(".nav-item").forEach(button => {

    button.addEventListener(
      "click",
      () => navigate(button.dataset.section)
    );

  });


  $$("[data-section-target]").forEach(button => {

    button.addEventListener(
      "click",
      () => navigate(button.dataset.sectionTarget)
    );

  });


  $("#mobileMenuBtn").addEventListener(
    "click",
    () => {

      $("#sidebar")
        .classList.toggle("mobile-open");

    }
  );

}


function navigate(section) {

  $$(".nav-item").forEach(button => {

    button.classList.toggle(
      "active",
      button.dataset.section === section
    );

  });


  $$(".page-section").forEach(page => {

    page.classList.remove(
      "active-section"
    );

  });


  const page =
    $(`#${section}Section`);

  if (page) {

    page.classList.add(
      "active-section"
    );

  }


  const titles = {
    dashboard: "Dashboard",
    roadmap: "Roadmap",
    labs: "Labs",
    challenges: "Challenges",
    notes: "Notes",
    tools: "Security Tools",
    timer: "Focus Timer",
    achievements: "Achievements",
    settings: "Settings"
  };


  $("#pageTitle").textContent =
    titles[section] || "Dashboard";


  $("#headerTitle").textContent =
    section === "dashboard"
      ? "Security Command Center"
      : titles[section];


  $("#sidebar")
    .classList.remove("mobile-open");

}


/* =========================================================
   BUTTONS
   ========================================================= */

function initializeButtons() {

  $("#addLabBtn")
    .addEventListener(
      "click",
      openLabModal
    );

  $("#addChallengeBtn")
    .addEventListener(
      "click",
      openChallengeModal
    );

  $("#addNoteBtn")
    .addEventListener(
      "click",
      openNoteModal
    );


  $("#themeToggle")
    .addEventListener(
      "click",
      toggleTheme
    );


  $("#notificationBtn")
    .addEventListener(
      "click",
      () => {

        $("#notificationPanel")
          .classList.toggle("show");

      }
    );


  $("#closeNotifications")
    .addEventListener(
      "click",
      () => {

        $("#notificationPanel")
          .classList.remove("show");

      }
    );


  $("#modalClose")
    .addEventListener(
      "click",
      closeModal
    );


  $("#modalOverlay")
    .addEventListener(
      "click",
      event => {

        if (
          event.target ===
          $("#modalOverlay")
        ) {
          closeModal();
        }

      }
    );


  $("#labSearch")
    .addEventListener(
      "input",
      renderLabs
    );

  $("#labFilter")
    .addEventListener(
      "change",
      renderLabs
    );

  $("#labDifficulty")
    .addEventListener(
      "change",
      renderLabs
    );


  $("#noteSearch")
    .addEventListener(
      "input",
      renderNotes
    );

  $("#noteCategory")
    .addEventListener(
      "change",
      renderNotes
    );


  $("#passwordCheckInput")
    .addEventListener(
      "input",
      checkPassword
    );


  $("#base64Encode")
    .addEventListener(
      "click",
      encodeBase64
    );

  $("#base64Decode")
    .addEventListener(
      "click",
      decodeBase64
    );


  $("#urlEncode")
    .addEventListener(
      "click",
      encodeURL
    );

  $("#urlDecode")
    .addEventListener(
      "click",
      decodeURL
    );


  $("#hashInput")
    .addEventListener(
      "input",
      identifyHash
    );


  $$(".timer-presets button")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          setTimer(
            Number(button.dataset.minutes)
          );

        }
      );

    });


  $("#timerStart")
    .addEventListener(
      "click",
      toggleTimer
    );


  $("#timerReset")
    .addEventListener(
      "click",
      resetTimer
    );


  $("#darkModeSwitch")
    .addEventListener(
      "change",
      event => {

        settings.darkMode =
          event.target.checked;

        save(
          STORAGE.settings,
          settings
        );

        applyTheme();

      }
    );


  $("#notificationSwitch")
    .addEventListener(
      "change",
      event => {

        settings.notifications =
          event.target.checked;

        save(
          STORAGE.settings,
          settings
        );

        showToast(
          settings.notifications
            ? "Notifications enabled."
            : "Notifications disabled."
        );

      }
    );


  $("#exportDataBtn")
    .addEventListener(
      "click",
      exportData
    );


  $("#resetDataBtn")
    .addEventListener(
      "click",
      resetData
    );

}


/* =========================================================
   THEME
   ========================================================= */

function initializeTheme() {

  $("#darkModeSwitch").checked =
    settings.darkMode;

  applyTheme();

}


function applyTheme() {

  document.body.classList.toggle(
    "light-mode",
    !settings.darkMode
  );

  $("#darkModeSwitch").checked =
    settings.darkMode;

  const icon =
    $("#themeToggle i");

  icon.className =
    settings.darkMode
      ? "fa-solid fa-moon"
      : "fa-solid fa-sun";

}


function toggleTheme() {

  settings.darkMode =
    !settings.darkMode;

  save(
    STORAGE.settings,
    settings
  );

  applyTheme();

}


/* =========================================================
   MODAL
   ========================================================= */

function openModal(
  title,
  eyebrow,
  content
) {

  $("#modalTitle").textContent = title;
  $("#modalEyebrow").textContent = eyebrow;
  $("#modalBody").innerHTML = content;

  $("#modalOverlay")
    .classList.add("show");

}


function closeModal() {

  $("#modalOverlay")
    .classList.remove("show");

}


/* =========================================================
   LAB MODAL
   ========================================================= */

function openLabModal() {

  openModal(
    "Add Lab",
    "HANDS-ON PRACTICE",
    `
      <form id="labForm" class="modal-form">

        <div class="input-group">
          <label>Lab Name</label>
          <input id="labName" required
                 placeholder="e.g. Web Security Fundamentals">
        </div>

        <div class="input-group">
          <label>Platform</label>
          <input id="labPlatform" required
                 placeholder="e.g. Practice Lab">
        </div>

        <div class="input-group">
          <label>Category</label>
          <select id="labCategory">
            <option>Networking</option>
            <option>Linux</option>
            <option>Web Security</option>
            <option>Pentesting</option>
            <option>Defensive Security</option>
            <option>Cryptography</option>
          </select>
        </div>

        <div class="input-group">
          <label>Difficulty</label>
          <select id="labDifficultyModal">
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div class="input-group">
          <label>Status</label>
          <select id="labStatusModal">
            <option value="planned">Planned</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div class="input-group">
          <label>Notes</label>
          <textarea id="labNotes"
                    placeholder="What are you practicing?"></textarea>
        </div>

        <div class="modal-actions">
          <button type="button"
                  class="secondary-btn"
                  onclick="closeModal()">
            Cancel
          </button>

          <button type="submit"
                  class="primary-btn">
            <i class="fa-solid fa-plus"></i>
            Add Lab
          </button>
        </div>

      </form>
    `
  );


  $("#labForm").addEventListener(
    "submit",
    event => {

      event.preventDefault();

      const lab = {

        id: Date.now(),

        name:
          $("#labName").value.trim(),

        platform:
          $("#labPlatform").value.trim(),

        category:
          $("#labCategory").value,

        difficulty:
          $("#labDifficultyModal").value,

        status:
          $("#labStatusModal").value,

        date:
          today(),

        notes:
          $("#labNotes").value.trim()

      };


      labs.unshift(lab);

      save(
        STORAGE.labs,
        labs
      );


      addActivity(
        "fa-flask",
        `Lab "${lab.name}" added`
      );


      addNotification(
        "fa-flask",
        `New lab "${lab.name}" added.`
      );


      renderAll();

      closeModal();

      showToast(
        "Lab added successfully."
      );

    }
  );

}


/* =========================================================
   CHALLENGE MODAL
   ========================================================= */

function openChallengeModal() {

  openModal(
    "Add Challenge",
    "MISSION LOG",
    `
      <form id="challengeForm" class="modal-form">

        <div class="input-group">
          <label>Challenge Name</label>
          <input id="challengeName" required
                 placeholder="e.g. DNS Investigation">
        </div>

        <div class="input-group">
          <label>Platform</label>
          <input id="challengePlatform"
                 required
                 placeholder="e.g. Practice">
        </div>

        <div class="input-group">
          <label>Category</label>
          <select id="challengeCategory">
            <option>Networking</option>
            <option>Linux</option>
            <option>Web Security</option>
            <option>Cryptography</option>
            <option>Defensive Security</option>
          </select>
        </div>

        <div class="input-group">
          <label>Difficulty</label>
          <select id="challengeDifficulty">
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div class="input-group">
          <label>Status</label>
          <select id="challengeStatus">
            <option value="completed">Completed</option>
            <option value="in-progress">In Progress</option>
          </select>
        </div>

        <div class="modal-actions">
          <button type="button"
                  class="secondary-btn"
                  onclick="closeModal()">
            Cancel
          </button>

          <button type="submit"
                  class="primary-btn">
            Add Challenge
          </button>
        </div>

      </form>
    `
  );


  $("#challengeForm").addEventListener(
    "submit",
    event => {

      event.preventDefault();

      const challenge = {

        id: Date.now(),

        name:
          $("#challengeName").value.trim(),

        platform:
          $("#challengePlatform").value.trim(),

        category:
          $("#challengeCategory").value,

        difficulty:
          $("#challengeDifficulty").value,

        status:
          $("#challengeStatus").value,

        date:
          today()

      };


      challenges.unshift(challenge);

      save(
        STORAGE.challenges,
        challenges
      );


      addActivity(
        "fa-flag",
        `Challenge "${challenge.name}" added`
      );


      renderAll();

      closeModal();

      showToast(
        "Challenge added."
      );

    }
  );

}


/* =========================================================
   NOTE MODAL
   ========================================================= */

function openNoteModal() {

  openModal(
    "New Security Note",
    "KNOWLEDGE BASE",
    `
      <form id="noteForm" class="modal-form">

        <div class="input-group">
          <label>Title</label>
          <input id="noteTitle" required
                 placeholder="e.g. HTTP Methods">
        </div>

        <div class="input-group">
          <label>Category</label>
          <select id="noteCategoryModal">
            <option>Networking</option>
            <option>Linux</option>
            <option>Web Security</option>
            <option>Pentesting</option>
            <option>Defensive Security</option>
            <option>Tools</option>
          </select>
        </div>

        <div class="input-group">
          <label>Note</label>
          <textarea id="noteContent"
                    required
                    rows="7"
                    placeholder="Write your learning note..."></textarea>
        </div>

        <div class="modal-actions">
          <button type="button"
                  class="secondary-btn"
                  onclick="closeModal()">
            Cancel
          </button>

          <button type="submit"
                  class="primary-btn">
            Save Note
          </button>
        </div>

      </form>
    `
  );


  $("#noteForm").addEventListener(
    "submit",
    event => {

      event.preventDefault();

      const note = {

        id: Date.now(),

        title:
          $("#noteTitle").value.trim(),

        category:
          $("#noteCategoryModal").value,

        content:
          $("#noteContent").value.trim()

      };


      notes.unshift(note);

      save(
        STORAGE.notes,
        notes
      );


      addActivity(
        "fa-note-sticky",
        `Note "${note.title}" created`
      );


      renderAll();

      closeModal();

      showToast(
        "Note saved."
      );

    }
  );

          }
/* =========================================================
   RENDER ALL
   ========================================================= */

function renderAll() {

  renderDashboard();

  renderRoadmap();

  renderLabs();

  renderChallenges();

  renderNotes();

  renderAchievements();

  renderNotifications();

  updateTimerDisplay();

}


/* =========================================================
   DASHBOARD
   ========================================================= */

function renderDashboard() {

  const completedLabs =
    labs.filter(
      lab => lab.status === "completed"
    ).length;

  const completedChallenges =
    challenges.filter(
      challenge =>
        challenge.status === "completed"
    ).length;


  const overall =
    Math.round(
      skills.reduce(
        (sum, skill) =>
          sum + Number(skill.progress),
        0
      ) / skills.length
    );


  $("#dashLabs").textContent =
    completedLabs;

  $("#dashChallenges").textContent =
    completedChallenges;

  $("#dashSkills").textContent =
    `${overall}%`;


  $("#overallProgressLabel").textContent =
    `${overall}%`;

  $("#overallProgressBar").style.width =
    `${overall}%`;


  $("#skillProgressList").innerHTML =
    skills.map(
      skill => `

        <div class="skill-row">

          <div class="skill-meta">
            <span>${escapeHTML(skill.name)}</span>
            <span>${skill.progress}%</span>
          </div>

          <div class="skill-track">
            <div style="width:${skill.progress}%"></div>
          </div>

        </div>

      `
    ).join("");


  renderDashboardTasks();

  renderActivities();

}


function renderDashboardTasks() {

  const container =
    $("#dashboardTasks");

  const upcoming =
    labs
      .filter(
        lab => lab.status !== "completed"
      )
      .slice(0, 5);


  if (!upcoming.length) {

    container.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-circle-check"></i>
        <strong>All missions complete</strong>
        <span>No pending labs right now.</span>
      </div>
    `;

    return;
  }


  container.innerHTML =
    upcoming.map(
      lab => `

        <div class="task-item">

          <div class="task-info">
            <strong>${escapeHTML(lab.name)}</strong>
            <span>
              ${escapeHTML(lab.category)}
              · ${capitalize(lab.status)}
            </span>
          </div>

          <div class="task-actions">

            <button
              class="small-btn"
              onclick="completeLab(${lab.id})">
              ${
                lab.status === "completed"
                  ? "Completed"
                  : "Mark Done"
              }
            </button>

          </div>

        </div>

      `
    ).join("");

}


/* =========================================================
   ACTIVITY
   ========================================================= */

function addActivity(icon, title) {

  activities.unshift({
    icon,
    title,
    time: "Just now"
  });

  activities =
    activities.slice(0, 30);

  save(
    STORAGE.activities,
    activities
  );

}


function renderActivities() {

  const container =
    $("#activityList");

  container.innerHTML =
    activities
      .slice(0, 6)
      .map(
        activity => `

          <div class="activity-item">

            <div class="activity-icon">
              <i class="fa-solid ${
                escapeHTML(activity.icon)
              }"></i>
            </div>

            <div>
              <strong>
                ${escapeHTML(activity.title)}
              </strong>

              <span>
                ${escapeHTML(activity.time)}
              </span>
            </div>

          </div>

        `
      ).join("");

}


/* =========================================================
   ROADMAP
   ========================================================= */

const ROADMAP = [

  {
    title: "Networking",
    icon: "fa-network-wired",
    description: "Understand how systems communicate across networks.",
    topics: [
      "IP",
      "TCP/IP",
      "DNS",
      "HTTP",
      "Ports"
    ],
    progress: 72
  },

  {
    title: "Linux",
    icon: "fa-linux",
    description: "Build a strong foundation in Linux systems.",
    topics: [
      "CLI",
      "Filesystem",
      "Permissions",
      "Processes",
      "Bash"
    ],
    progress: 64
  },

  {
    title: "Web Security",
    icon: "fa-globe",
    description: "Learn the fundamentals of securing web applications.",
    topics: [
      "HTTP",
      "Sessions",
      "Auth",
      "XSS",
      "Access Control"
    ],
    progress: 48
  },

  {
    title: "Cryptography",
    icon: "fa-lock",
    description: "Understand hashes, encryption and security concepts.",
    topics: [
      "Hashes",
      "Encoding",
      "Encryption",
      "Keys"
    ],
    progress: 35
  },

  {
    title: "Defensive Security",
    icon: "fa-shield",
    description: "Explore monitoring, logs and incident response.",
    topics: [
      "Logs",
      "Monitoring",
      "Detection",
      "IR"
    ],
    progress: 42
  },

  {
    title: "Pentesting",
    icon: "fa-crosshairs",
    description: "Learn authorized security testing methodology.",
    topics: [
      "Recon",
      "Enumeration",
      "Assessment",
      "Reporting"
    ],
    progress: 31
  }

];


function renderRoadmap() {

  $("#roadmapGrid").innerHTML =
    ROADMAP.map(
      item => `

        <div class="roadmap-card">

          <div class="roadmap-icon">
            <i class="fa-solid ${item.icon}"></i>
          </div>

          <h3>${item.title}</h3>

          <p>${item.description}</p>

          <div class="roadmap-topics">

            ${item.topics
              .map(
                topic =>
                  `<span class="topic">
                    ${topic}
                  </span>`
              )
              .join("")}

          </div>

          <div class="roadmap-progress">

            <div class="skill-track">
              <div style="width:${item.progress}%"></div>
            </div>

            <span>
              ${item.progress}%
            </span>

          </div>

        </div>

      `
    ).join("");

        }
/* =========================================================
   LABS
   ========================================================= */

function renderLabs() {

  const search =
    $("#labSearch").value
      .toLowerCase()
      .trim();

  const status =
    $("#labFilter").value;

  const difficulty =
    $("#labDifficulty").value;


  const filtered =
    labs.filter(lab => {

      const matchesSearch =
        `${lab.name} ${lab.category} ${lab.platform}`
          .toLowerCase()
          .includes(search);

      const matchesStatus =
        status === "all" ||
        lab.status === status;

      const matchesDifficulty =
        difficulty === "all" ||
        lab.difficulty === difficulty;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDifficulty
      );

    });


  if (!filtered.length) {

    $("#labsGrid").innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-flask"></i>
        <strong>No labs found</strong>
        <span>Try another search or add a new lab.</span>
      </div>
    `;

    return;
  }


  $("#labsGrid").innerHTML =
    filtered.map(
      lab => `

        <article class="lab-card">

          <div class="card-top">

            <span class="tag">
              ${escapeHTML(lab.category)}
            </span>

            <span class="status ${lab.status}">
              ${capitalize(lab.status)}
            </span>

          </div>

          <h3>${escapeHTML(lab.name)}</h3>

          <p>
            ${escapeHTML(lab.notes || "No notes added.")}
          </p>

          <div class="lab-meta">

            <span class="tag">
              ${escapeHTML(lab.platform)}
            </span>

            <span class="tag">
              ${capitalize(lab.difficulty)}
            </span>

            <span class="tag">
              ${formatDate(lab.date)}
            </span>

          </div>

          <div class="card-actions">

            <button
              class="small-btn"
              onclick="completeLab(${lab.id})">
              ${
                lab.status === "completed"
                  ? "Completed"
                  : "Mark Complete"
              }
            </button>

            <button
              class="small-btn"
              onclick="deleteLab(${lab.id})">
              <i class="fa-solid fa-trash"></i>
            </button>

          </div>

        </article>

      `
    ).join("");

}


function completeLab(id) {

  const lab =
    labs.find(
      item => item.id === id
    );

  if (!lab) return;


  if (lab.status === "completed") {

    lab.status = "in-progress";

    showToast("Lab moved back to in progress.");

  } else {

    lab.status = "completed";

    addActivity(
      "fa-circle-check",
      `Lab "${lab.name}" completed`
    );

    addNotification(
      "fa-circle-check",
      `Lab "${lab.name}" completed.`
    );

    showToast("Lab completed.");

  }


  save(
    STORAGE.labs,
    labs
  );


  renderAll();

}


function deleteLab(id) {

  const lab =
    labs.find(
      item => item.id === id
    );

  if (!lab) return;


  if (
    !confirm(
      `Delete "${lab.name}"?`
    )
  ) return;


  labs =
    labs.filter(
      item => item.id !== id
    );


  save(
    STORAGE.labs,
    labs
  );


  addActivity(
    "fa-trash",
    `Lab "${lab.name}" deleted`
  );


  renderAll();

  showToast("Lab deleted.");

}


/* =========================================================
   CHALLENGES
   ========================================================= */
function renderChallenges() {

  const completed =
    challenges.filter(
      item =>
        item.status === "completed"
    ).length;


  const progress =
    challenges.filter(
      item =>
        item.status === "in-progress"
    ).length;


  $("#challengeCompleted").textContent =
    completed;

  $("#challengeProgress").textContent =
    progress;

  $("#challengeTotal").textContent =
    challenges.length;


  if (!challenges.length) {

    $("#challengeList").innerHTML =
      `
        <div class="empty-state">
          <i class="fa-solid fa-flag"></i>
          <strong>No challenges yet</strong>
          <span>Add your first challenge.</span>
        </div>
      `;

    return;
  }


  $("#challengeList").innerHTML =
    challenges.map(
      challenge => `

        <div class="challenge-row">

          <strong>
            ${escapeHTML(challenge.name)}
          </strong>

          <span>
            ${escapeHTML(challenge.category)}
          </span>

          <span>
            ${capitalize(challenge.difficulty)}
          </span>

          <span>
            ${capitalize(challenge.status)}
          </span>

          <button
            class="small-btn"
            onclick="deleteChallenge(${challenge.id})">
            Delete
          </button>

        </div>

      `
    ).join("");

}


function deleteChallenge(id) {

  const item =
    challenges.find(
      challenge =>
        challenge.id === id
    );

  if (!item) return;


  if (
    !confirm(
      `Delete "${item.name}"?`
    )
  ) return;


  challenges =
    challenges.filter(
      challenge =>
        challenge.id !== id
    );


  save(
    STORAGE.challenges,
    challenges
  );


  renderAll();

  showToast(
    "Challenge deleted."
  );

}
/* =========================================================
   NOTES
   ========================================================= */

function renderNotes() {

  const search =
    $("#noteSearch").value
      .toLowerCase()
      .trim();

  const category =
    $("#noteCategory").value;


  const filtered =
    notes.filter(note => {

      const matchesSearch =
        `${note.title} ${note.content} ${note.category}`
          .toLowerCase()
          .includes(search);

      const matchesCategory =
        category === "all" ||
        note.category === category;

      return (
        matchesSearch &&
        matchesCategory
      );

    });


  if (!filtered.length) {

    $("#notesGrid").innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-note-sticky"></i>
        <strong>No notes found</strong>
        <span>Create your first security note.</span>
      </div>
    `;

    return;
  }


  $("#notesGrid").innerHTML =
    filtered.map(
      note => `

        <article class="note-card">

          <span class="note-category">
            ${escapeHTML(note.category)}
          </span>

          <h3>
            ${escapeHTML(note.title)}
          </h3>

          <p>
            ${escapeHTML(note.content)}
          </p>

          <div class="card-actions">

            <span></span>

            <button
              class="small-btn"
              onclick="deleteNote(${note.id})">
              Delete
            </button>

          </div>

        </article>

      `
    ).join("");

}


function deleteNote(id) {

  const note =
    notes.find(
      item => item.id === id
    );

  if (!note) return;


  if (
    !confirm(
      `Delete "${note.title}"?`
    )
  ) return;


  notes =
    notes.filter(
      item => item.id !== id
    );


  save(
    STORAGE.notes,
    notes
  );


  addActivity(
    "fa-trash",
    `Note "${note.title}" deleted`
  );


  renderAll();

  showToast("Note deleted.");

}

/* =========================================================
   ACHIEVEMENTS
   ========================================================= */

const ACHIEVEMENTS = [

  {
    title: "First Lab",
    description: "Complete your first lab.",
    icon: "fa-flask",
    check: () =>
      labs.some(
        lab =>
          lab.status === "completed"
      )
  },

  {
    title: "Challenge Hunter",
    description: "Complete 3 challenges.",
    icon: "fa-flag",
    check: () =>
      challenges.filter(
        item =>
          item.status === "completed"
      ).length >= 3
  },

  {
    title: "Knowledge Builder",
    description: "Create 3 security notes.",
    icon: "fa-book",
    check: () =>
      notes.length >= 3
  },

  {
    title: "Linux Explorer",
    description: "Complete a Linux lab.",
    icon: "fa-terminal",
    check: () =>
      labs.some(
        lab =>
          lab.category === "Linux" &&
          lab.status === "completed"
      )
  },

  {
    title: "Web Learner",
    description: "Work on web security.",
    icon: "fa-globe",
    check: () =>
      labs.some(
        lab =>
          lab.category === "Web Security"
      )
  },

  {
    title: "Security Builder",
    description: "Complete 5 labs.",
    icon: "fa-shield-halved",
    check: () =>
      labs.filter(
        lab =>
          lab.status === "completed"
      ).length >= 5
  },

  {
    title: "Dedicated Learner",
    description: "Complete 10 challenges.",
    icon: "fa-fire",
    check: () =>
      challenges.filter(
        item =>
          item.status === "completed"
      ).length >= 10
  },

  {
    title: "Vault Master",
    description: "Reach 80% average skill progress.",
    icon: "fa-crown",
    check: () =>
      skills.reduce(
        (sum, skill) =>
          sum + skill.progress,
        0
      ) / skills.length >= 80
  }

];


function renderAchievements() {

  $("#achievementGrid").innerHTML =
    ACHIEVEMENTS.map(
      achievement => {

        const unlocked =
          achievement.check();

        return `

          <div class="achievement-card ${
            unlocked
              ? "unlocked"
              : ""
          }">

            <div class="achievement-icon">

              <i class="fa-solid ${
                achievement.icon
              }"></i>

            </div>

            <h3>
              ${achievement.title}
            </h3>

            <p>
              ${achievement.description}
            </p>

          </div>

        `;

      }
    ).join("");

}


/* =========================================================
   NOTIFICATIONS
   ========================================================= */

function addNotification(
  icon,
  title
) {

  if (!settings.notifications) {
    return;
  }


  notifications.unshift({

    icon,

    title,

    time: "Just now"

  });


  notifications =
    notifications.slice(0, 20);


  save(
    STORAGE.notifications,
    notifications
  );


  renderNotifications();

}


function renderNotifications() {

  const container =
    $("#notificationItems");

  if (!notifications.length) {

    container.innerHTML =
      `<div class="empty-state">
        <strong>No notifications</strong>
      </div>`;

    return;
  }


  container.innerHTML =
    notifications
      .slice(0, 8)
      .map(
        notification => `

          <div class="notification-item">

            <div class="notification-icon">
              <i class="fa-solid ${
                escapeHTML(
                  notification.icon ||
                  "fa-bell"
                )
              }"></i>
            </div>

            <div>

              <strong>
                ${escapeHTML(
                  notification.title
                )}
              </strong>

              <span>
                ${escapeHTML(
                  notification.time
                )}
              </span>

            </div>

          </div>

        `
      ).join("");
}


    /* =========================================================
   PASSWORD STRENGTH
   ========================================================= */

function checkPassword() {

  const value =
    $("#passwordCheckInput").value;

  const bar =
    $("#passwordStrengthBar");

  const text =
    $("#passwordStrengthText");


  if (!value) {

    bar.style.width = "0%";
    text.textContent =
      "Enter a password";

    return;

  }


  let score = 0;

  if (value.length >= 8)
    score++;

  if (value.length >= 12)
    score++;

  if (/[A-Z]/.test(value))
    score++;

  if (/[a-z]/.test(value))
    score++;

  if (/[0-9]/.test(value))
    score++;

  if (/[^A-Za-z0-9]/.test(value))
    score++;


  const percentage =
    Math.min(
      100,
      Math.round(
        (score / 6) * 100
      )
    );


  bar.style.width =
    `${percentage}%`;


  if (score <= 2) {

    text.textContent =
      "Weak";

  } else if (score <= 4) {

    text.textContent =
      "Moderate";

  } else {

    text.textContent =
      "Strong";

  }

}


/* =========================================================
   BASE64
   ========================================================= */

function encodeBase64() {

  const input =
    $("#base64Input").value;

  try {

    $("#base64Output").value =
      btoa(
        unescape(
          encodeURIComponent(input)
        )
      );

  } catch {

    showToast(
      "Could not encode the text.",
      "error"
    );

  }

}


function decodeBase64() {

  const input =
    $("#base64Input").value;

  try {

    $("#base64Output").value =
      decodeURIComponent(
        escape(
          atob(input)
        )
      );

  } catch {

    showToast(
      "Invalid Base64 input.",
      "error"
    );

  }

}


/* =========================================================
   URL
   ========================================================= */
function encodeURL() {

  const input =
    $("#urlInput").value;

  $("#urlOutput").value =
    encodeURIComponent(input);

}


function decodeURL() {

  const input =
    $("#urlInput").value;

  try {

    $("#urlOutput").value =
      decodeURIComponent(input);

  } catch {

    showToast(
      "Invalid encoded URL text.",
      "error"
    );

  }

}


/* =========================================================
   HASH IDENTIFIER
   ========================================================= */

function identifyHash() {

  const value =
    $("#hashInput").value.trim();

  const result =
    $("#hashResult");


  if (!value) {

    result.textContent =
      "Waiting for input...";

    return;

  }


  const length =
    value.length;


  let possible = [];


  if (
    /^[a-fA-F0-9]{32}$/.test(value)
  ) {
    possible.push("MD5-like length");
  }


  if (
    /^[a-fA-F0-9]{40}$/.test(value)
  ) {
    possible.push("SHA-1-like length");
  }


  if (
    /^[a-fA-F0-9]{64}$/.test(value)
  ) {
    possible.push("SHA-256-like length");
  }


  if (
    /^[a-fA-F0-9]{128}$/.test(value)
  ) {
    possible.push("SHA-512-like length");
  }


  if (!possible.length) {

    result.textContent =
      `Length: ${length} characters. No common hex hash pattern detected.`;

  } else {

    result.textContent =
      `Possible pattern: ${possible.join(", ")}. Pattern detection only; not definitive.`;

  }

}


/* =========================================================
   TIMER
   ========================================================= */

function setTimer(minutes) {

  stopTimer();

  currentTimerMinutes =
    Math.max(
      1,
      Math.min(
        180,
        Number(minutes) || 25
      )
    );

  timerSeconds =
    currentTimerMinutes * 60;

  $("#timerMode").textContent =
    currentTimerMinutes <= 5
      ? "Short Break"
      : "Focus Session";

  $("#timerStatus").textContent =
    "Ready when you are.";

  updateTimerDisplay();

}


function updateTimerDisplay() {

  const minutes =
    Math.floor(
      timerSeconds / 60
    );

  const seconds =
    timerSeconds % 60;


  $("#timerDisplay").textContent =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;


  $("#timerSessions").textContent =
    timerData.sessions;

  $("#timerMinutes").textContent =
    timerData.minutes;

}


function toggleTimer() {

  if (timerRunning) {

    stopTimer();

    $("#timerStatus").textContent =
      "Timer paused.";

    return;

  }


  timerRunning = true;

  $("#timerStart").innerHTML =
    `<i class="fa-solid fa-pause"></i> Pause`;

  $("#timerStatus").textContent =
    "Focus session running.";


  timerInterval =
    setInterval(
      () => {

        if (timerSeconds <= 0) {

          completeTimer();

          return;

        }


        timerSeconds--;

        updateTimerDisplay();

      },
      1000
    );

}


function stopTimer() {

  timerRunning = false;

  clearInterval(timerInterval);

  timerInterval = null;

  $("#timerStart").innerHTML =
    `<i class="fa-solid fa-play"></i> Start`;

}


function resetTimer() {

  stopTimer();

  timerSeconds =
    currentTimerMinutes * 60;

  $("#timerStatus").textContent =
    "Timer reset.";

  updateTimerDisplay();

}


function completeTimer() {

  stopTimer();

  timerData.sessions++;
  timerData.minutes +=
    currentTimerMinutes;


  save(
    STORAGE.timer,
    timerData
  );


  addActivity(
    "fa-stopwatch",
    `${currentTimerMinutes}-minute focus session completed`
  );


  addNotification(
    "fa-stopwatch",
    "Focus session completed."
  );


  timerSeconds =
    currentTimerMinutes * 60;


  $("#timerStatus").textContent =
    "Session complete. Nice work.";

  updateTimerDisplay();

  showToast(
    "Focus session completed."
  );

}


/* =========================================================
   SETTINGS / EXPORT
   ========================================================= */

function exportData() {

  const data = {

    labs,

    challenges,

    notes,

    skills,

    activities,

    notifications,
    settings,

    timerData,

    exportedAt:
      new Date().toISOString()

  };


  const blob =
    new Blob(
      [
        JSON.stringify(
          data,
          null,
          2
        )
      ],
      {
        type: "application/json"
      }
    );


  const url =
    URL.createObjectURL(blob);


  const link =
    document.createElement("a");


  link.href = url;

  link.download =
    "cybervault-backup.json";


  document.body.appendChild(link);

  link.click();

  link.remove();

  URL.revokeObjectURL(url);


  showToast(
    "CyberVault data exported."
  );

}


function resetData() {

  if (
    !confirm(
      "Reset CyberVault to the original demo data?"
    )
  ) return;


  labs =
    structuredClone(DEFAULT_LABS);

  challenges =
    structuredClone(DEFAULT_CHALLENGES);

  notes =
    structuredClone(DEFAULT_NOTES);

  skills =
    structuredClone(DEFAULT_SKILLS);

  activities =
    structuredClone(DEFAULT_ACTIVITIES);

  notifications =
    structuredClone(DEFAULT_NOTIFICATIONS);


  timerData = {
    sessions: 0,
    minutes: 0
  };


  save(STORAGE.labs, labs);
  save(STORAGE.challenges, challenges);
  save(STORAGE.notes, notes);
  save(STORAGE.skills, skills);
  save(STORAGE.activities, activities);
  save(STORAGE.notifications, notifications);
  save(STORAGE.timer, timerData);


  renderAll();

  showToast(
    "CyberVault has been reset."
  );

}


/* =========================================================
   UTIL
   ========================================================= */

function capitalize(value) {

  if (!value) return "";

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );

}


/* =========================================================
   GLOBAL ESCAPE
   ========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (event.key === "Escape") {

      closeModal();

      $("#notificationPanel")
        ?.classList.remove("show");

    }

  }
);


/* =========================================================
   CONSOLE
   ========================================================= */

console.log(
  "%cCYBERVAULT",
  "color:#a78bfa;font-size:20px;font-weight:bold"
);

console.log(
  "%cCybersecurity learning dashboard loaded successfully.",
  "color:#22d3ee"
);
