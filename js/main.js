// Todo App - Main JavaScript File
class TodoApp {
    constructor() {
        this.tasks = [];
        this.currentTab = 'dashboard';
        this.currentDate = new Date();
        this.currentWeek = this.getWeekStart(new Date());
        this.timer = null;
        this.timerInterval = null;
        this.timerDuration = 25 * 60; // 25 minutes in seconds
        this.timerRemaining = 25 * 60; // Current timer remaining time
        this.timerRunning = false;
        
        this.init();
    }

    init() {
        this.loadTasks();
        this.setupEventListeners();
        this.updateCurrentTime();
        this.renderDashboard();
        this.setupTheme();
        this.setupNotifications();
        
        // Update time every second
        setInterval(() => this.updateCurrentTime(), 1000);
        
        // Auto-save tasks every 30 seconds
        setInterval(() => this.saveTasks(), 30000);
        
        // Initialize timer display
        this.updateTimerDisplay();
    }

    // Local Storage Management
    saveTasks() {
        localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
        localStorage.setItem('todoAppSettings', JSON.stringify({
            theme: document.documentElement.getAttribute('data-theme') || 'light',
            timerDuration: this.timerDuration
        }));
    }

    loadTasks() {
        const savedTasks = localStorage.getItem('todoTasks');
        if (savedTasks) {
            this.tasks = JSON.parse(savedTasks);
        }
        
        const settings = localStorage.getItem('todoAppSettings');
        if (settings) {
            const parsedSettings = JSON.parse(settings);
            this.timerDuration = parsedSettings.timerDuration || 25 * 60;
            this.timerRemaining = this.timerDuration;
        }
    }

    // Theme Management
    setupTheme() {
        const savedTheme = localStorage.getItem('todoAppSettings') ? 
            JSON.parse(localStorage.getItem('todoAppSettings')).theme : 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        this.saveTasks();
    }

    setupNotifications() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    // Event Listeners
    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Quick actions
        document.getElementById('addQuickTask').addEventListener('click', () => {
            this.openQuickTaskModal();
        });

        document.getElementById('startTimer').addEventListener('click', () => {
            this.openTimerModal();
        });

        // Floating timer button
        document.getElementById('floatingTimerBtn').addEventListener('click', () => {
            if (this.timerRunning) {
                this.pauseTimer();
            } else {
                this.startTimer();
            }
        });

        document.getElementById('viewToday').addEventListener('click', () => {
            this.switchTab('daily');
        });

        // Add task button
        document.getElementById('addTaskBtn').addEventListener('click', () => {
            this.openTaskModal();
        });

        // Modal close buttons
        document.getElementById('closeTaskModal').addEventListener('click', () => {
            this.closeTaskModal();
        });

        document.getElementById('closeQuickTaskModal').addEventListener('click', () => {
            this.closeQuickTaskModal();
        });

        document.getElementById('closeTimerModal').addEventListener('click', () => {
            this.closeTimerModal();
        });

        // Form submissions
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTask();
        });

        document.getElementById('quickTaskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveQuickTask();
        });

        // Timer controls
        document.getElementById('startTimerBtn').addEventListener('click', () => {
            this.startTimer();
        });

        document.getElementById('pauseTimerBtn').addEventListener('click', () => {
            this.pauseTimer();
        });

        document.getElementById('resetTimerBtn').addEventListener('click', () => {
            this.resetTimer();
        });

        // Date navigation
        document.getElementById('prevDay').addEventListener('click', () => {
            this.currentDate = new Date(this.currentDate.getTime() - 24 * 60 * 60 * 1000);
            this.renderDaily();
        });

        document.getElementById('nextDay').addEventListener('click', () => {
            this.currentDate = new Date(this.currentDate.getTime() + 24 * 60 * 60 * 1000);
            this.renderDaily();
        });

        document.getElementById('prevWeek').addEventListener('click', () => {
            this.currentWeek = new Date(this.currentWeek.getTime() - 7 * 24 * 60 * 60 * 1000);
            this.renderWeekly();
        });

        document.getElementById('nextWeek').addEventListener('click', () => {
            this.currentWeek = new Date(this.currentWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
            this.renderWeekly();
        });

        // Filters and search
        document.getElementById('priorityFilter').addEventListener('change', () => {
            this.renderTasks();
        });

        document.getElementById('statusFilter').addEventListener('change', () => {
            this.renderTasks();
        });

        document.getElementById('searchTasks').addEventListener('input', () => {
            this.renderTasks();
        });

        document.getElementById('completedTimeFilter').addEventListener('change', () => {
            this.renderCompleted();
        });

        // Close modals on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });

        // Cancel buttons
        document.getElementById('cancelTask').addEventListener('click', () => {
            this.closeTaskModal();
        });

        document.getElementById('cancelQuickTask').addEventListener('click', () => {
            this.closeQuickTaskModal();
        });
    }

    // Tab Management
    switchTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        this.currentTab = tabName;

        // Render appropriate content
        switch (tabName) {
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'tasks':
                this.renderTasks();
                break;
            case 'daily':
                this.renderDaily();
                break;
            case 'weekly':
                this.renderWeekly();
                break;
            case 'completed':
                this.renderCompleted();
                break;
            case 'analytics':
                this.renderAnalytics();
                break;
        }
    }

    // Time Management
    updateCurrentTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        document.getElementById('currentTime').textContent = timeString;
    }

    // Task Management
    addTask(taskData) {
        const task = {
            id: Date.now().toString(),
            title: taskData.title,
            description: taskData.description || '',
            priority: taskData.priority || 'medium',
            category: taskData.category || 'other',
            status: 'pending',
            dueDate: taskData.dueDate || null,
            dueTime: taskData.dueTime || null,
            createdAt: new Date().toISOString(),
            completedAt: null,
            completedDate: null
        };

        this.tasks.push(task);
        this.saveTasks();
        return task;
    }

    updateTask(taskId, updates) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updates };
            this.saveTasks();
            return this.tasks[taskIndex];
        }
        return null;
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.saveTasks();
    }

    toggleTaskStatus(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            let newStatus;
            if (task.status === 'completed') {
                newStatus = 'pending';
            } else if (task.status === 'pending') {
                newStatus = 'in-progress';
            } else {
                newStatus = 'completed';
            }
            
            const updates = {
                status: newStatus,
                completedAt: newStatus === 'completed' ? new Date().toISOString() : null,
                completedDate: newStatus === 'completed' ? new Date().toDateString() : null
            };
            this.updateTask(taskId, updates);
        }
    }

    // Rendering Functions
    renderDashboard() {
        const totalTasks = this.tasks.length;
        const pendingTasks = this.tasks.filter(task => task.status !== 'completed').length;
        const completedTasks = this.tasks.filter(task => task.status === 'completed').length;
        const streakDays = this.calculateStreak();

        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('pendingTasks').textContent = pendingTasks;
        document.getElementById('completedTasks').textContent = completedTasks;
        document.getElementById('streakDays').textContent = streakDays;

        // Render recent tasks
        const recentTasks = this.tasks
            .filter(task => task.status !== 'completed')
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        this.renderTaskList('recentTasksList', recentTasks, true);
    }

    renderTasks() {
        const priorityFilter = document.getElementById('priorityFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        const searchTerm = document.getElementById('searchTasks').value.toLowerCase();

        let filteredTasks = this.tasks;

        if (priorityFilter) {
            filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
        }

        if (statusFilter) {
            filteredTasks = filteredTasks.filter(task => task.status === statusFilter);
        }

        if (searchTerm) {
            filteredTasks = filteredTasks.filter(task => 
                task.title.toLowerCase().includes(searchTerm) ||
                task.description.toLowerCase().includes(searchTerm)
            );
        }

        this.renderTaskList('allTasksList', filteredTasks, false);
    }

    renderDaily() {
        const dateString = this.currentDate.toDateString();
        document.getElementById('currentDate').textContent = this.currentDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Get tasks for the current date (due date or created today)
        const dailyTasks = this.tasks.filter(task => {
            const taskDate = task.dueDate ? new Date(task.dueDate).toDateString() : new Date(task.createdAt).toDateString();
            return taskDate === dateString;
        });

        const completedToday = dailyTasks.filter(task => task.status === 'completed').length;
        const totalToday = dailyTasks.length;
        const progress = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

        document.getElementById('dailyProgress').textContent = `${progress}%`;
        document.getElementById('dailyCompleted').textContent = completedToday;
        document.getElementById('dailyTotal').textContent = totalToday;

        // Update progress circle
        const circle = document.querySelector('.progress-ring-circle');
        if (circle) {
            const circumference = 2 * Math.PI * 52;
            const offset = circumference - (progress / 100) * circumference;
            circle.style.strokeDasharray = `${circumference} ${circumference}`;
            circle.style.strokeDashoffset = offset;
        }

        this.renderTaskList('dailyTasksList', dailyTasks, false);
    }

    renderWeekly() {
        const weekStart = new Date(this.currentWeek);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        document.getElementById('currentWeek').textContent = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

        const weeklyData = this.getWeeklyData();
        this.renderWeeklyChart(weeklyData);

        // Get tasks for the current week (due date or created this week)
        const weeklyTasks = this.tasks.filter(task => {
            const taskDate = task.dueDate ? new Date(task.dueDate) : new Date(task.createdAt);
            return taskDate >= weekStart && taskDate <= weekEnd;
        });

        const completedThisWeek = weeklyTasks.filter(task => task.status === 'completed').length;
        const totalThisWeek = weeklyTasks.length;
        const weeklyProgress = totalThisWeek > 0 ? Math.round((completedThisWeek / totalThisWeek) * 100) : 0;

        document.getElementById('weeklyTotal').textContent = totalThisWeek;
        document.getElementById('weeklyCompleted').textContent = completedThisWeek;
        document.getElementById('weeklyProgress').textContent = `${weeklyProgress}%`;
    }

    renderCompleted() {
        const timeFilter = document.getElementById('completedTimeFilter').value;
        const now = new Date();
        let filteredTasks = this.tasks.filter(task => task.status === 'completed');

        switch (timeFilter) {
            case 'today':
                const today = now.toDateString();
                filteredTasks = filteredTasks.filter(task => 
                    task.completedDate === today
                );
                break;
            case 'week':
                const weekStart = this.getWeekStart(now);
                filteredTasks = filteredTasks.filter(task => {
                    const completedDate = new Date(task.completedAt);
                    return completedDate >= weekStart;
                });
                break;
            case 'month':
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                filteredTasks = filteredTasks.filter(task => {
                    const completedDate = new Date(task.completedAt);
                    return completedDate >= monthStart;
                });
                break;
        }

        this.renderTaskList('completedTasksList', filteredTasks, false);
    }

    renderAnalytics() {
        this.renderProductivityChart();
        this.renderCategoryChart();
        this.renderInsights();
        this.renderAchievements();
    }

    // Task List Rendering
    renderTaskList(containerId, tasks, isRecent = false) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                    <p style="color: var(--text-secondary); text-align: center;">No tasks found</p>
                </div>
            `;
            return;
        }

        tasks.forEach(task => {
            const taskElement = this.createTaskElement(task, isRecent);
            container.appendChild(taskElement);
        });
    }

    createTaskElement(task, isRecent = false) {
        const taskDiv = document.createElement('div');
        taskDiv.className = `task-item ${task.status === 'completed' ? 'completed' : ''}`;
        taskDiv.dataset.taskId = task.id;

        const statusClass = `status-${task.status.replace('-', '-')}`;
        const priorityClass = `priority-${task.priority}`;

        const dueDateText = task.dueDate ? 
            new Date(task.dueDate).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: task.dueDate.includes(new Date().getFullYear().toString()) ? undefined : 'numeric'
            }) : '';

        taskDiv.innerHTML = `
            <div class="task-status">
                <span class="status-badge ${statusClass}">${task.status.replace('-', ' ')}</span>
            </div>
            <div class="task-header">
                <div>
                    <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                    ${task.description ? `<p class="task-description">${this.escapeHtml(task.description)}</p>` : ''}
                </div>
            </div>
            <div class="task-meta">
                <span class="task-priority ${priorityClass}">${task.priority}</span>
                <span class="task-category">${task.category}</span>
                ${dueDateText ? `<span class="task-due-date"><i class="fas fa-calendar"></i> ${dueDateText}</span>` : ''}
            </div>
            <div class="task-actions">
                ${!isRecent ? `
                    <button class="btn btn-secondary btn-edit-task" data-task-id="${task.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                ` : ''}
                <button class="btn btn-primary btn-toggle-status" data-task-id="${task.id}">
                    <i class="fas fa-${task.status === 'completed' ? 'undo' : 'check'}"></i>
                    ${task.status === 'completed' ? 'Undo' : 'Complete'}
                </button>
                ${!isRecent ? `
                    <button class="btn btn-danger btn-delete-task" data-task-id="${task.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : ''}
            </div>
        `;

        // Add event listeners
        const toggleBtn = taskDiv.querySelector('.btn-toggle-status');
        toggleBtn.addEventListener('click', () => {
            this.toggleTaskStatus(task.id);
            this.refreshCurrentTab();
        });

        if (!isRecent) {
            const editBtn = taskDiv.querySelector('.btn-edit-task');
            editBtn.addEventListener('click', () => {
                this.editTask(task.id);
            });

            const deleteBtn = taskDiv.querySelector('.btn-delete-task');
            deleteBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this task?')) {
                    this.deleteTask(task.id);
                    this.refreshCurrentTab();
                }
            });
        }

        return taskDiv;
    }

    // Modal Management
    openTaskModal(taskId = null) {
        const modal = document.getElementById('taskModal');
        const title = document.getElementById('taskModalTitle');
        const form = document.getElementById('taskForm');

        if (taskId) {
            const task = this.tasks.find(t => t.id === taskId);
            if (task) {
                title.textContent = 'Edit Task';
                this.populateTaskForm(task);
                form.dataset.editTaskId = taskId;
            }
        } else {
            title.textContent = 'Add New Task';
            form.reset();
            delete form.dataset.editTaskId;
        }

        modal.classList.add('active');
    }

    closeTaskModal() {
        document.getElementById('taskModal').classList.remove('active');
        document.getElementById('taskForm').reset();
    }

    openQuickTaskModal() {
        document.getElementById('quickTaskModal').classList.add('active');
    }

    closeQuickTaskModal() {
        document.getElementById('quickTaskModal').classList.remove('active');
        document.getElementById('quickTaskForm').reset();
    }

    openTimerModal() {
        document.getElementById('timerModal').classList.add('active');
        document.getElementById('timerDuration').value = Math.floor(this.timerDuration / 60);
    }

    closeTimerModal() {
        document.getElementById('timerModal').classList.remove('active');
        this.resetTimer();
    }

    // Form Handling
    populateTaskForm(task) {
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description;
        document.getElementById('taskPriority').value = task.priority;
        document.getElementById('taskCategory').value = task.category;
        if (task.dueDate) {
            document.getElementById('taskDueDate').value = task.dueDate;
        }
        if (task.dueTime) {
            document.getElementById('taskDueTime').value = task.dueTime;
        }
    }

    saveTask() {
        const form = document.getElementById('taskForm');
        const editTaskId = form.dataset.editTaskId;

        const taskData = {
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            priority: document.getElementById('taskPriority').value,
            category: document.getElementById('taskCategory').value,
            dueDate: document.getElementById('taskDueDate').value || null,
            dueTime: document.getElementById('taskDueTime').value || null
        };

        if (editTaskId) {
            this.updateTask(editTaskId, taskData);
        } else {
            this.addTask(taskData);
        }

        this.closeTaskModal();
        this.refreshCurrentTab();
    }

    saveQuickTask() {
        const taskData = {
            title: document.getElementById('quickTaskTitle').value,
            priority: document.getElementById('quickTaskPriority').value
        };

        this.addTask(taskData);
        this.closeQuickTaskModal();
        this.refreshCurrentTab();
    }

    editTask(taskId) {
        this.openTaskModal(taskId);
    }

    // Timer Management
    startTimer() {
        if (!this.timerRunning) {
            this.timerRunning = true;
            this.timerInterval = setInterval(() => {
                this.timerRemaining--;
                this.updateTimerDisplay();
                
                if (this.timerRemaining <= 0) {
                    this.timerComplete();
                }
            }, 1000);

            document.getElementById('startTimerBtn').style.display = 'none';
            document.getElementById('pauseTimerBtn').style.display = 'inline-flex';
        }
    }

    pauseTimer() {
        this.timerRunning = false;
        clearInterval(this.timerInterval);
        document.getElementById('startTimerBtn').style.display = 'inline-flex';
        document.getElementById('pauseTimerBtn').style.display = 'none';
    }

    resetTimer() {
        this.pauseTimer();
        this.timerRemaining = parseInt(document.getElementById('timerDuration').value) * 60;
        this.updateTimerDisplay();
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timerRemaining / 60);
        const seconds = this.timerRemaining % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Update modal timer display
        const timerDisplay = document.getElementById('timerDisplay');
        if (timerDisplay) {
            timerDisplay.textContent = timeString;
        }
        
        // Update floating timer display
        const floatingTimerText = document.getElementById('floatingTimerText');
        if (floatingTimerText) {
            floatingTimerText.textContent = timeString;
        }
        
        // Update floating timer button state
        const floatingTimerBtn = document.getElementById('floatingTimerBtn');
        if (floatingTimerBtn) {
            floatingTimerBtn.classList.remove('running', 'paused');
            if (this.timerRunning) {
                floatingTimerBtn.classList.add('running');
            } else if (this.timerRemaining < this.timerDuration) {
                floatingTimerBtn.classList.add('paused');
            }
        }
    }

    timerComplete() {
        this.pauseTimer();
        
        // Show notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Timer Completed!', {
                body: 'Your Pomodoro session is complete. Take a break!',
                icon: '/favicon.ico'
            });
        } else {
            alert('Timer completed! Take a break!');
        }
        
        this.resetTimer();
    }

    // Analytics and Charts
    getWeeklyData() {
        const weekStart = new Date(this.currentWeek);
        const data = [];

        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + i);
            const dateString = date.toDateString();

            const dayTasks = this.tasks.filter(task => {
                const taskDate = task.dueDate ? new Date(task.dueDate).toDateString() : new Date(task.createdAt).toDateString();
                return taskDate === dateString;
            });

            const completed = dayTasks.filter(task => task.status === 'completed').length;
            const total = dayTasks.length;

            data.push({
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                completed,
                total
            });
        }

        return data;
    }

    renderWeeklyChart(data) {
        const canvas = document.getElementById('weeklyChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (data.length === 0) return;

        const maxValue = Math.max(...data.map(d => Math.max(d.completed, d.total)));
        if (maxValue === 0) return;

        const barWidth = canvas.width / data.length - 10;
        const scale = (canvas.height - 40) / maxValue;

        data.forEach((day, index) => {
            const x = index * (barWidth + 10) + 5;
            
            // Total bar (background)
            ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
            ctx.fillRect(x, canvas.height - 20 - day.total * scale, barWidth, day.total * scale);
            
            // Completed bar
            ctx.fillStyle = '#6366f1';
            ctx.fillRect(x, canvas.height - 20 - day.completed * scale, barWidth, day.completed * scale);
            
            // Day label
            ctx.fillStyle = 'var(--text-secondary)';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(day.day, x + barWidth / 2, canvas.height - 5);
        });
    }

    renderProductivityChart() {
        const canvas = document.getElementById('productivityChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Simple line chart for productivity trend
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateString = date.toDateString();
            
            const completed = this.tasks.filter(task => 
                task.status === 'completed' && 
                task.completedDate === dateString
            ).length;
            
            last7Days.push(completed);
        }

        const maxValue = Math.max(...last7Days);
        if (maxValue === 0) return;

        const scale = (canvas.height - 40) / maxValue;

        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 3;
        ctx.beginPath();

        last7Days.forEach((value, index) => {
            const x = (index / (last7Days.length - 1)) * (canvas.width - 40) + 20;
            const y = canvas.height - 20 - value * scale;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();
    }

    renderCategoryChart() {
        const canvas = document.getElementById('categoryChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const categories = {};
        this.tasks.forEach(task => {
            categories[task.category] = (categories[task.category] || 0) + 1;
        });

        if (Object.keys(categories).length === 0) return;

        const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
        const total = Object.values(categories).reduce((sum, count) => sum + count, 0);

        if (total === 0) return;

        let currentAngle = 0;
        Object.entries(categories).forEach(([category, count], index) => {
            const sliceAngle = (count / total) * 2 * Math.PI;
            const color = colors[index % colors.length];

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, canvas.height / 2);
            ctx.arc(canvas.width / 2, canvas.height / 2, 80, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fill();

            currentAngle += sliceAngle;
        });
    }

    renderInsights() {
        const insights = [];
        
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.status === 'completed').length;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        insights.push(`You've completed ${completionRate}% of all tasks`);
        
        const mostProductiveDay = this.getMostProductiveDay();
        if (mostProductiveDay) {
            insights.push(`Your most productive day is ${mostProductiveDay}`);
        }
        
        const averageTasksPerDay = this.getAverageTasksPerDay();
        insights.push(`You complete an average of ${averageTasksPerDay} tasks per day`);

        const container = document.getElementById('insightsList');
        container.innerHTML = insights.map(insight => 
            `<div class="insight-item"><i class="fas fa-lightbulb"></i> ${insight}</div>`
        ).join('');
    }

    renderAchievements() {
        const achievements = [];
        
        const totalCompleted = this.tasks.filter(task => task.status === 'completed').length;
        
        if (totalCompleted >= 10) achievements.push('Task Master - Completed 10 tasks');
        if (totalCompleted >= 50) achievements.push('Productivity Pro - Completed 50 tasks');
        if (totalCompleted >= 100) achievements.push('Goal Crusher - Completed 100 tasks');
        
        const streak = this.calculateStreak();
        if (streak >= 3) achievements.push('Consistency King - 3 day streak');
        if (streak >= 7) achievements.push('Week Warrior - 7 day streak');
        if (streak >= 30) achievements.push('Monthly Master - 30 day streak');

        const container = document.getElementById('achievementsList');
        container.innerHTML = achievements.map(achievement => 
            `<div class="achievement-item"><i class="fas fa-trophy"></i> ${achievement}</div>`
        ).join('');
    }

    // Utility Functions
    calculateStreak() {
        const completedDates = [...new Set(
            this.tasks
                .filter(task => task.status === 'completed' && task.completedDate)
                .map(task => task.completedDate)
        )].sort().reverse();

        if (completedDates.length === 0) return 0;

        let streak = 0;
        const today = new Date().toDateString();
        let currentDate = new Date();

        for (let i = 0; i < 30; i++) { // Check last 30 days
            const dateString = currentDate.toDateString();
            if (completedDates.includes(dateString)) {
                streak++;
            } else {
                break;
            }
            currentDate.setDate(currentDate.getDate() - 1);
        }

        return streak;
    }

    getMostProductiveDay() {
        const dayCounts = {};
        this.tasks
            .filter(task => task.status === 'completed' && task.completedAt)
            .forEach(task => {
                const day = new Date(task.completedAt).toLocaleDateString('en-US', { weekday: 'long' });
                dayCounts[day] = (dayCounts[day] || 0) + 1;
            });

        const mostProductive = Object.entries(dayCounts)
            .sort(([,a], [,b]) => b - a)[0];
        
        return mostProductive ? mostProductive[0] : null;
    }

    getAverageTasksPerDay() {
        const completedTasks = this.tasks.filter(task => task.status === 'completed');
        if (completedTasks.length === 0) return 0;

        const firstTask = new Date(completedTasks[0].completedAt);
        const lastTask = new Date(completedTasks[completedTasks.length - 1].completedAt);
        const daysDiff = Math.ceil((lastTask - firstTask) / (1000 * 60 * 60 * 24)) + 1;

        return Math.round(completedTasks.length / daysDiff);
    }

    getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    }

    refreshCurrentTab() {
        this.switchTab(this.currentTab);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});
