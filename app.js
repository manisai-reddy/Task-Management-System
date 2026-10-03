/* =====================================================
   TASKFLOW
   LocalStorage Task Management System
   ===================================================== */

const USERS_KEY = "taskflow_users";
const TASKS_KEY = "taskflow_tasks";
const PROJECTS_KEY = "taskflow_projects";
const CURRENT_USER_KEY = "taskflow_current_user";

function initializeStorage() {
    let users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];

    const adminExists = users.some(user => user.email === "mani@gmail.com");

    if (!adminExists) {
        users.push({
            id: generateId(),
            name: "Mani",
            email: "mani@gmail.com",
            password: "mani@123",
            role: "admin",
            joined: new Date().toISOString()
        });

        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    let projects = JSON.parse(localStorage.getItem(PROJECTS_KEY));

    if (!projects) {
        projects = [
            {
                id: generateId(),
                name: "Website Development",
                description: "Tasks related to website development."
            },
            {
                id: generateId(),
                name: "Marketing",
                description: "Marketing and promotional activities."
            },
            {
                id: generateId(),
                name: "General",
                description: "General work and miscellaneous tasks."
            }
        ];

        localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    }

    if (!localStorage.getItem(TASKS_KEY)) {
        localStorage.setItem(TASKS_KEY, JSON.stringify([]));
    }
}

function generateId() {
    return Date.now().toString() + Math.random().toString(36).substring(2);
}

function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

function getTasks() {
    return JSON.parse(localStorage.getItem(TASKS_KEY)) || [];
}

function getProjects() {
    return JSON.parse(localStorage.getItem(PROJECTS_KEY)) || [];
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function saveTasks(tasks) {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

function saveProjects(projects) {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

function getCurrentUser() {
    const userId = localStorage.getItem(CURRENT_USER_KEY);
    if (!userId) return null;

    return getUsers().find(user => user.id === userId);
}

function escapeHTML(value) {
    if (!value) return "";

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatDate(date) {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function isOverdue(task) {
    if (task.status === "completed") return false;
    if (!task.deadline) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadline = new Date(task.deadline);
    deadline.setHours(0, 0, 0, 0);

    return deadline < today;
}

function showRegister() {
    document.getElementById("loginBox").classList.add("hidden");
    document.getElementById("registerBox").classList.remove("hidden");
}

function showLogin() {
    document.getElementById("registerBox").classList.add("hidden");
    document.getElementById("loginBox").classList.remove("hidden");
}

document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;
    const users = getUsers();

    const user = users.find(
        item => item.email.toLowerCase() === email && item.password === password
    );

    if (!user) {
        alert("Invalid email or password.");
        return;
    }

    localStorage.setItem(CURRENT_USER_KEY, user.id);
    openApplication();
});

document.getElementById("registerForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim().toLowerCase();
    const password = document.getElementById("registerPassword").value;
    const users = getUsers();

    const exists = users.some(user => user.email.toLowerCase() === email);

    if (exists) {
        alert("An account with this email already exists.");
        return;
    }

    const newUser = {
        id: generateId(),
        name,
        email,
        password,
        role: "user",
        joined: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    alert("Account created successfully. You can now login.");

    document.getElementById("registerForm").reset();
    showLogin();
});

function openApplication() {
    const user = getCurrentUser();

    if (!user) {
        showAuth();
        return;
    }

    document.getElementById("authPage").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");

    setupUserInterface();
    showSection("dashboard");
    refreshEverything();
}

function showAuth() {
    document.getElementById("authPage").classList.remove("hidden");
    document.getElementById("app").classList.add("hidden");
}

function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    location.reload();
}

function setupUserInterface() {
    const user = getCurrentUser();
    if (!user) return;

    const initial = user.name.charAt(0).toUpperCase();

    document.getElementById("sidebarName").textContent = user.name;
    document.getElementById("sidebarRole").textContent =
        user.role === "admin" ? "Administrator" : "Team Member";
    document.getElementById("sidebarAvatar").textContent = initial;
    document.getElementById("topAvatar").textContent = initial;

    const adminElements = document.querySelectorAll(".admin-only");

    adminElements.forEach(element => {
        element.style.display = user.role === "admin" ? "" : "none";
    });

    document.getElementById("welcomeText").textContent =
        `Welcome back, ${user.name}!`;
}

const sectionTitles = {
    dashboard: "Dashboard",
    tasks: "My Tasks",
    projects: "Projects",
    users: "Users",
    allTasks: "All Tasks"
};

function showSection(section) {
    const sections = [
        "dashboardSection",
        "tasksSection",
        "projectsSection",
        "usersSection",
        "allTasksSection"
    ];

    sections.forEach(id => {
        document.getElementById(id).classList.add("hidden");
    });

    document.getElementById(section + "Section").classList.remove("hidden");
    document.getElementById("pageTitle").textContent = sectionTitles[section];

    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");
    });

    const buttons = document.querySelectorAll(".nav-item");

    buttons.forEach(button => {
        if (button.textContent.toLowerCase().includes(
            section === "allTasks" ? "all tasks" : section
        )) {
            button.classList.add("active");
        }
    });

    if (section === "dashboard") renderDashboard();
    if (section === "tasks") renderTasks();
    if (section === "projects") renderProjects();
    if (section === "users") renderUsers();
    if (section === "allTasks") renderAllTasks();
}

function getVisibleTasks() {
    const user = getCurrentUser();
    if (!user) return [];

    const tasks = getTasks();

    if (user.role === "admin") return tasks;

    return tasks.filter(task => task.assigneeId === user.id);
}

function renderDashboard() {
    const tasks = getVisibleTasks();
    const total = tasks.length;

    const completed = tasks.filter(task => task.status === "completed").length;
    const pending = tasks.filter(task => task.status !== "completed").length;
    const overdue = tasks.filter(task => isOverdue(task)).length;

    document.getElementById("totalTasks").textContent = total;
    document.getElementById("completedTasks").textContent = completed;
    document.getElementById("pendingTasks").textContent = pending;
    document.getElementById("overdueTasks").textContent = overdue;

    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    document.getElementById("progressPercentage").textContent = percentage + "%";
    document.getElementById("progressCompleted").textContent = completed;
    document.getElementById("progressPending").textContent = pending;

    document.querySelector(".progress-circle").style.background =
        `conic-gradient(
            var(--primary) ${percentage * 3.6}deg,
            #e9ecf3 ${percentage * 3.6}deg
        )`;

    renderRecentTasks();
}

function renderRecentTasks() {
    const container = document.getElementById("recentTasks");

    const tasks = getVisibleTasks()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    if (tasks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div>📋</div>
                <p>No tasks available.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = tasks.map(task => {
        const user = getUsers().find(u => u.id === task.assigneeId);

        return `
            <div class="task-card">
                <div class="task-top">
                    <div class="task-title">${escapeHTML(task.title)}</div>
                    <span class="badge badge-${task.priority}">${task.priority}</span>
                </div>

                <p class="task-description">
                    ${escapeHTML(task.description || "No description")}
                </p>

                <div class="task-info">
                    <div class="task-info-item">
                        <span>Deadline</span>
                        <strong class="${isOverdue(task) ? "overdue" : ""}">
                            ${formatDate(task.deadline)}
                        </strong>
                    </div>

                    <div class="task-info-item">
                        <span>Assigned To</span>
                        <strong>
                            ${escapeHTML(user ? user.name : "Unknown")}
                        </strong>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

function renderTasks() {
    const container = document.getElementById("tasksContainer");
    const currentUser = getCurrentUser();

    if (!currentUser) return;

    let tasks = getVisibleTasks();

    const search = document.getElementById("taskSearch").value.toLowerCase();
    const filter = document.getElementById("statusFilter").value;

    if (search) {
        tasks = tasks.filter(task =>
            task.title.toLowerCase().includes(search) ||
            (task.description || "").toLowerCase().includes(search)
        );
    }

    if (filter !== "all") {
        tasks = tasks.filter(task => task.status === filter);
    }

    if (tasks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div>📋</div>
                <h3>No Tasks Found</h3>
                <p>There are no tasks matching your search.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = tasks.map(task => createTaskCard(task)).join("");
}

function createTaskCard(task) {
    const users = getUsers();

    const assignee = users.find(user => user.id === task.assigneeId);
    const project = getProjects().find(p => p.id === task.projectId);

    return `
        <div class="task-card">

            <div class="task-top">
                <div class="task-title">${escapeHTML(task.title)}</div>

                <span class="badge badge-${task.priority}">
                    ${task.priority}
                </span>
            </div>

            <p class="task-description">
                ${escapeHTML(task.description || "No description available.")}
            </p>

            <div class="task-info">

                <div class="task-info-item">
                    <span>Project</span>
                    <strong>
                        ${escapeHTML(project ? project.name : "General")}
                    </strong>
                </div>

                <div class="task-info-item">
                    <span>Assigned To</span>
                    <strong>
                        ${escapeHTML(assignee ? assignee.name : "Unknown")}
                    </strong>
                </div>

                <div class="task-info-item">
                    <span>Deadline</span>

                    <strong class="${isOverdue(task) ? "overdue" : ""}">
                        ${formatDate(task.deadline)}
                        ${isOverdue(task) ? " • Overdue" : ""}
                    </strong>
                </div>

            </div>

            <div class="task-footer">

                <select
                    class="status-select"
                    onchange="changeTaskStatus('${task.id}', this.value)"
                >
                    <option value="pending" ${task.status === "pending" ? "selected" : ""}>
                        Pending
                    </option>

                    <option value="in-progress" ${task.status === "in-progress" ? "selected" : ""}>
                        In Progress
                    </option>

                    <option value="completed" ${task.status === "completed" ? "selected" : ""}>
                        Completed
                    </option>
                </select>

                <div class="task-actions">

                    ${getCurrentUser().role === "admin" ? `
                        <button class="icon-btn" onclick="editTask('${task.id}')">
                            ✏️
                        </button>

                        <button
                            class="icon-btn delete-btn"
                            onclick="deleteTask('${task.id}')"
                        >
                            🗑️
                        </button>
                    ` : ""}

                </div>

            </div>

        </div>
    `;
}

function changeTaskStatus(taskId, status) {
    const tasks = getTasks();
    const task = tasks.find(task => task.id === taskId);

    if (!task) return;

    task.status = status;
    task.updatedAt = new Date().toISOString();

    saveTasks(tasks);
    refreshEverything();
}

function openTaskModal(taskId = null) {
    const user = getCurrentUser();

    if (!user || user.role !== "admin") {
        alert("Only the administrator can create or assign tasks.");
        return;
    }

    populateTaskDropdowns();

    document.getElementById("taskModal").classList.remove("hidden");

    if (taskId) {
        const task = getTasks().find(t => t.id === taskId);

        if (!task) return;

        document.getElementById("taskModalTitle").textContent = "Edit Task";
        document.getElementById("editTaskId").value = task.id;
        document.getElementById("taskTitle").value = task.title;
        document.getElementById("taskDescription").value = task.description || "";
        document.getElementById("taskProject").value = task.projectId;
        document.getElementById("taskAssignee").value = task.assigneeId;
        document.getElementById("taskDeadline").value = task.deadline;
        document.getElementById("taskPriority").value = task.priority;
        document.getElementById("taskStatus").value = task.status;
    } else {
        document.getElementById("taskModalTitle").textContent = "Create Task";
        document.getElementById("taskForm").reset();
        document.getElementById("editTaskId").value = "";
        document.getElementById("taskStatus").value = "pending";
    }
}

function closeTaskModal() {
    document.getElementById("taskModal").classList.add("hidden");
    document.getElementById("taskForm").reset();
}

function populateTaskDropdowns() {
    const users = getUsers().filter(user => user.role === "user");
    const projects = getProjects();

    const assigneeSelect = document.getElementById("taskAssignee");
    const projectSelect = document.getElementById("taskProject");

    if (users.length === 0) {
        assigneeSelect.innerHTML = `
            <option value="">No registered users</option>
        `;
    } else {
        assigneeSelect.innerHTML = users.map(user => `
            <option value="${user.id}">
                ${escapeHTML(user.name)} (${escapeHTML(user.email)})
            </option>
        `).join("");
    }

    projectSelect.innerHTML = projects.map(project => `
        <option value="${project.id}">
            ${escapeHTML(project.name)}
        </option>
    `).join("");
}

document.getElementById("taskForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const title = document.getElementById("taskTitle").value.trim();
    const description = document.getElementById("taskDescription").value.trim();
    const projectId = document.getElementById("taskProject").value;
    const assigneeId = document.getElementById("taskAssignee").value;
    const deadline = document.getElementById("taskDeadline").value;
    const priority = document.getElementById("taskPriority").value;
    const status = document.getElementById("taskStatus").value;
    const editId = document.getElementById("editTaskId").value;

    if (!assigneeId) {
        alert("Please create a user account before assigning a task.");
        return;
    }

    const tasks = getTasks();

    if (editId) {
        const task = tasks.find(t => t.id === editId);

        if (!task) return;

        task.title = title;
        task.description = description;
        task.projectId = projectId;
        task.assigneeId = assigneeId;
        task.deadline = deadline;
        task.priority = priority;
        task.status = status;
        task.updatedAt = new Date().toISOString();
    } else {
        tasks.push({
            id: generateId(),
            title,
            description,
            projectId,
            assigneeId,
            deadline,
            priority,
            status,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    }

    saveTasks(tasks);
    closeTaskModal();
    refreshEverything();

    alert(editId ? "Task updated successfully." : "Task assigned successfully.");
});

function editTask(taskId) {
    openTaskModal(taskId);
}

function deleteTask(taskId) {
    const confirmDelete = confirm("Are you sure you want to delete this task?");

    if (!confirmDelete) return;

    let tasks = getTasks();
    tasks = tasks.filter(task => task.id !== taskId);

    saveTasks(tasks);
    refreshEverything();
}

function renderAllTasks() {
    const container = document.getElementById("allTasksContainer");
    const user = getCurrentUser();

    if (!user || user.role !== "admin") {
        container.innerHTML = "";
        return;
    }

    const tasks = getTasks();

    if (tasks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div>📋</div>
                <h3>No Tasks</h3>
                <p>Create a task and assign it to a user.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = tasks.map(task => createTaskCard(task)).join("");
}

function openProjectModal() {
    document.getElementById("projectModal").classList.remove("hidden");
}

function closeProjectModal() {
    document.getElementById("projectModal").classList.add("hidden");
    document.getElementById("projectForm").reset();
}

document.getElementById("projectForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const name = document.getElementById("projectName").value.trim();
    const description = document.getElementById("projectDescription").value.trim();

    const projects = getProjects();

    projects.push({
        id: generateId(),
        name,
        description
    });

    saveProjects(projects);
    closeProjectModal();
    refreshEverything();

    alert("Project created successfully.");
});

function renderProjects() {
    const container = document.getElementById("projectsContainer");
    const projects = getProjects();
    const tasks = getVisibleTasks();

    if (projects.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div>📁</div>
                <p>No projects created.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = projects.map(project => {
        const count = tasks.filter(task => task.projectId === project.id).length;

        return `
            <div class="project-card">

                <div class="project-icon">📁</div>

                <h3>${escapeHTML(project.name)}</h3>

                <p>
                    ${escapeHTML(project.description || "No description")}
                </p>

                <div class="project-count">
                    ${count} task${count !== 1 ? "s" : ""}
                </div>

            </div>
        `;
    }).join("");
}

function renderUsers() {
    const table = document.getElementById("usersTable");
    const users = getUsers();

    document.getElementById("userCount").textContent =
        users.filter(user => user.role === "user").length;

    table.innerHTML = users.map(user => {
        const initial = user.name.charAt(0).toUpperCase();

        return `
            <tr>

                <td>
                    <div class="user-cell">
                        <div class="avatar">${initial}</div>

                        <strong>
                            ${escapeHTML(user.name)}
                        </strong>
                    </div>
                </td>

                <td>${escapeHTML(user.email)}</td>

                <td>
                    ${user.role === "admin" ? "Administrator" : "Team Member"}
                </td>

                <td>${formatDate(user.joined)}</td>

                <td>

                    <button
                        class="icon-btn"
                        onclick="viewUser('${user.id}')"
                    >
                        👁️
                    </button>

                    ${user.role !== "admin" ? `
                        <button
                            class="icon-btn delete-btn"
                            onclick="deleteUser('${user.id}')"
                        >
                            🗑️
                        </button>
                    ` : ""}

                </td>

            </tr>
        `;
    }).join("");
}

function viewUser(userId) {
    const user = getUsers().find(u => u.id === userId);

    if (!user) return;

    const assignedTasks = getTasks().filter(
        task => task.assigneeId === user.id
    );

    document.getElementById("userDetails").innerHTML = `
        <div class="user-detail">
            <span>Name</span>
            <strong>${escapeHTML(user.name)}</strong>
        </div>

        <div class="user-detail">
            <span>Email</span>
            <strong>${escapeHTML(user.email)}</strong>
        </div>

        <div class="user-detail">
            <span>Role</span>
            <strong>${user.role}</strong>
        </div>

        <div class="user-detail">
            <span>Joined</span>
            <strong>${formatDate(user.joined)}</strong>
        </div>

        <div class="user-detail">
            <span>Assigned Tasks</span>
            <strong>${assignedTasks.length}</strong>
        </div>
    `;

    document.getElementById("userModal").classList.remove("hidden");
}

function closeUserModal() {
    document.getElementById("userModal").classList.add("hidden");
}

function deleteUser(userId) {
    const user = getUsers().find(u => u.id === userId);

    if (!user) return;

    const confirmDelete = confirm(
        `Delete account "${user.name}"?

All tasks assigned to this user will also be deleted.`
    );

    if (!confirmDelete) return;

    let users = getUsers().filter(u => u.id !== userId);
    saveUsers(users);

    let tasks = getTasks().filter(
        task => task.assigneeId !== userId
    );

    saveTasks(tasks);

    refreshEverything();

    alert("User account deleted successfully.");
}

function getNotifications() {
    const tasks = getVisibleTasks();
    const notifications = [];

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    tasks.forEach(task => {
        if (task.status === "completed") return;
        if (!task.deadline) return;

        const deadline = new Date(task.deadline);

        deadline.setHours(0, 0, 0, 0);

        const difference = Math.ceil(
            (deadline - today) / (1000 * 60 * 60 * 24)
        );

        if (difference < 0) {
            notifications.push({
                title: "Task Overdue",
                message: `"${task.title}" is overdue.`
            });
        } else if (difference === 0) {
            notifications.push({
                title: "Due Today",
                message: `"${task.title}" is due today.`
            });
        } else if (difference <= 2) {
            notifications.push({
                title: "Upcoming Deadline",
                message: `"${task.title}" is due in ${difference} day(s).`
            });
        }
    });

    return notifications;
}

function updateNotificationCount() {
    const count = getNotifications().length;

    document.getElementById("notificationCount").textContent = count;
}

function showNotifications() {
    const notifications = getNotifications();
    const container = document.getElementById("notifications");

    if (notifications.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div>🔔</div>
                <p>No notifications.</p>
            </div>
        `;
    } else {
        container.innerHTML = notifications.map(
            notification => `
                <div class="notification-item">
                    <strong>${notification.title}</strong>
                    <span>${notification.message}</span>
                </div>
            `
        ).join("");
    }

    document.getElementById("notificationModal").classList.remove("hidden");
}

function closeNotificationModal() {
    document.getElementById("notificationModal").classList.add("hidden");
}

function refreshEverything() {
    setupUserInterface();
    renderDashboard();
    renderTasks();
    renderProjects();
    renderUsers();
    renderAllTasks();
    updateNotificationCount();
}

initializeStorage();

document.addEventListener("DOMContentLoaded", function() {
    const currentUser = getCurrentUser();

    if (currentUser) {
        openApplication();
    } else {
        showAuth();
    }
});
