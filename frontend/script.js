const API_BASE = "https://student-result-management-system-z6lc.onrender.com/api";

function $(id) { return document.getElementById(id); }

function showPopup(message, type = "success") {
  const popup = $("popup");
  const text = $("popupText");

  text.textContent = message;

  popup.className = "popup show";
  if (type === "error") popup.classList.add("error");

  setTimeout(() => {
    popup.className = "popup hidden";
  }, 2000);
}

//login
async function login() {
  const username = $("username").value.trim();
  const password = $("password").value.trim();
  const msg = $("loginMsg");

  msg.textContent = "";

  if (!username || !password) {
    msg.textContent = "Please enter username and password.";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      msg.textContent = "Invalid credentials";
      return;
    }

    window.location.href = "dashboard.html";

  } catch (err) {
    msg.textContent = "Server error";
  }
}

//logout
function logout() {
  window.location.href = "index.html";
}

//add_student
async function addStudent() {
  const rollNo = $("rollNo").value.trim();
  const name = $("name").value.trim();
  const className = $("className").value.trim();
  const year = $("year").value.trim();
  const msg = $("studentMsg");

  msg.textContent = "";

  if (!rollNo || !name) {
    msg.textContent = "Roll number & name required.";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rollNo, name, className, year })
    });

    const data = await res.json();

    if (!data.success) {
      showPopup("Failed to add student", "error");
      return;
    }

    showPopup("Student added successfully!");

  } catch (err) {
    showPopup("Server error", "error");
  }
}

//load-student
let allStudents = [];

async function loadStudents() {
  const tbody = document.querySelector("#studentsTable tbody");
  const msg = $("studentsMsg");

  if (!tbody) return;

  msg.textContent = "Loading...";

  try {
    const res = await fetch(`${API_BASE}/students`);
    const data = await res.json();

    if (!data.success) {
      msg.textContent = "Failed to load students";
      return;
    }

    allStudents = data.students;
    tbody.innerHTML = "";

    allStudents.forEach(st => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${st.rollNo}</td>
        <td>${st.name}</td>
        <td>${st.className}</td>
        <td>${st.year}</td>
        <td class="action-buttons">
          <button class="btn btn-secondary btn-small" onclick="goToAddMarks('${st.rollNo}')">Marks</button>
          <button class="btn btn-primary btn-small" onclick="openEditStudent('${st.rollNo}', '${st.name}', '${st.className}', '${st.year}')">Edit</button>
          <button class="btn btn-warning btn-small" onclick="viewResult('${st.rollNo}')">Result</button>
          <button class="btn btn-danger btn-small" onclick="deleteStudent('${st.rollNo}')">Delete</button>
        </td>
      `;

      tbody.appendChild(tr);
    });

    msg.textContent = `${allStudents.length} students loaded`;

  } catch (err) {
    msg.textContent = "Server error";
  }
}

//delete_student
async function deleteStudent(rollNo) {
  if (!confirm(`Delete student ${rollNo}?`)) return;

  try {
    const res = await fetch(`${API_BASE}/students/${rollNo}`, {
      method: "DELETE"
    });

    const data = await res.json();

    if (!data.success) {
      showPopup("Failed to delete", "error");
      return;
    }

    showPopup("Student deleted");
    loadStudents();

  } catch (err) {
    showPopup("Server error", "error");
  }
}

//edit
function openEditStudent(rollNo, name, className, year) {
  $("editRoll").value = rollNo;
  $("editName").value = name;
  $("editClass").value = className;
  $("editYear").value = year;

  $("editModal").classList.remove("hidden");
}

function closeEditModal() {
  $("editModal").classList.add("hidden");
}

async function saveEditedStudent() {
  const rollNo = $("editRoll").value;
  const name = $("editName").value.trim();
  const className = $("editClass").value.trim();
  const year = $("editYear").value.trim();

  try {
    const res = await fetch(`${API_BASE}/students/${rollNo}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, className, year })
    });

    const data = await res.json();

    if (!data.success) {
      showPopup("Failed to update", "error");
      return;
    }

    closeEditModal();
    showPopup("Student updated!");
    loadStudents();

  } catch (err) {
    showPopup("Server error", "error");
  }
}

//search
function filterStudents() {
  const term = $("searchBox").value.toLowerCase();
  const rows = document.querySelectorAll("#studentsTable tbody tr");

  rows.forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(term) ? "" : "none";
  });
}

//nav
function goToAddMarks(rollNo) {
  localStorage.setItem("currentRoll", rollNo);
  window.location.href = "add-marks.html";
}

function viewResult(rollNo) {
  localStorage.setItem("currentRoll", rollNo);
  window.location.href = "result.html";
}

function openBlankMarksPage() {
  localStorage.removeItem("currentRoll"); 
  window.location.href = "add-marks.html";
}


async function loadMarksForEditing(rollNo) {
  try {
    const res = await fetch(`${API_BASE}/results/${rollNo}`);
    const data = await res.json();

    if (!data.success || !data.result) return;

    const sub = data.result.subjects;

    $("math").value = sub.math ?? "";
    $("science").value = sub.science ?? "";
    $("english").value = sub.english ?? "";
    $("social").value = sub.social ?? "";
    $("hindi").value = sub.hindi ?? "";
    $("computer").value = sub.computer ?? "";

  } catch (err) {
    console.log("Error loading marks");
  }
}

//add/update marks
async function addMarks() {
  const storedRoll = localStorage.getItem("currentRoll");
  const rollNo = $("rollMarks").value.trim() || storedRoll;

  if (!rollNo) {
    showPopup("Enter roll number", "error");
    return;
  }

  const marks = {
    math: Number($("math").value || 0),
    science: Number($("science").value || 0),
    english: Number($("english").value || 0),
    social: Number($("social").value || 0),
    hindi: Number($("hindi").value || 0),
    computer: Number($("computer").value || 0)
  };

  try {
    const res = await fetch(`${API_BASE}/results/${rollNo}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(marks)
    });

    const data = await res.json();

    if (!data.success) {
      showPopup("Failed to save marks", "error");
      return;
    }

    showPopup("Marks saved!");

  } catch (err) {
    showPopup("Server error", "error");
  }
}

//res page
async function loadResult() {
  const rollNo = localStorage.getItem("currentRoll");
  $("rRoll").textContent = "Roll No: " + rollNo;

  try {
    const res = await fetch(`${API_BASE}/results/${rollNo}`);
    const data = await res.json();

    const tbody = document.querySelector("#resultTable tbody");
    tbody.innerHTML = "";

    if (!data.result) {
      $("resultMsg").textContent = "No result found";
      return;
    }

    const sub = data.result.subjects;

    for (const s in sub) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${s}</td><td>${sub[s]}</td>`;
      tbody.appendChild(tr);
    }

    $("total").textContent = "Total: " + data.result.total;
    $("percentage").textContent = "Percentage: " + data.result.percentage.toFixed(2);
    $("grade").textContent = "Grade: " + data.result.grade;

  } catch (err) {
    $("resultMsg").textContent = "Server error";
  }
}

//pdf print
function printResult() {
  window.print();
}


document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.getAttribute("data-page");

  if (page === "dashboard") loadStudents();

  else if (page === "add-marks") {
    const storedRoll = localStorage.getItem("currentRoll");

    if (storedRoll) {
      $("rollMarks").value = storedRoll;
      loadMarksForEditing(storedRoll);
    } else {
      $("rollMarks").value = "";
      $("math").value = "";
      $("science").value = "";
      $("english").value = "";
      $("social").value = "";
      $("hindi").value = "";
      $("computer").value = "";
    }
  }

  else if (page === "result") loadResult();
});
