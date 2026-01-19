document.addEventListener('DOMContentLoaded', () => {
    // ========== ADMIN CONFIGURATION ==========
    // TODO: Replace with your actual admin email address
    // يرجى استبدال هذا بعنوان بريدك الإلكتروني الفعلي
    const ADMIN_EMAIL = 'ADMIN_EMAIL_HERE@example.com';
    // =========================================

    // Selectors
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    const authOverlay = document.getElementById('auth-overlay');
    const appWrapper = document.getElementById('app-wrapper');

    // Auth Selectors
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const logoutBtn = document.getElementById('logout-btn');

    // Profile Selectors
    const profileAvatar = document.getElementById('profile-avatar');
    const avatarOpts = document.querySelectorAll('.avatar-opt');
    const editDisplayName = document.getElementById('edit-display-name');
    const saveProfileBtn = document.getElementById('save-profile-btn');

    // Task Selectors
    const taskInput = document.getElementById('task-input');
    const addBtn = document.getElementById('add-btn');
    const fullTaskList = document.getElementById('full-task-list');
    const statTotal = document.getElementById('stat-total');
    const statDone = document.getElementById('stat-done');
    const statProgress = document.getElementById('stat-progress');

    // Materials Selectors
    const materialsUpload = document.getElementById('material-upload');
    const uploadMaterialBtn = document.getElementById('upload-material-btn');
    const materialsList = document.getElementById('materials-list');
    const filesCount = document.getElementById('files-count');
    const storageUsed = document.getElementById('storage-used');
    const addLectureBtn = document.getElementById('add-lecture-btn');
    const lectureTitleInput = document.getElementById('lecture-title-input');
    const lecturePdfInput = document.getElementById('lecture-pdf-input');
    const lectureHtmlInput = document.getElementById('lecture-html-input');

    // Chat Selectors
    const chatInput = document.getElementById('chat-input');
    const sendChatBtn = document.getElementById('send-chat-btn');
    const chatMessages = document.getElementById('chat-messages');
    const globalChatTab = document.getElementById('global-chat-tab');
    const privateChatsList = document.getElementById('private-chats-list');
    const startPrivateChatBtn = document.getElementById('start-private-chat-btn');

    // --- Navigation with Persistence ---
    const savedPage = localStorage.getItem('enjaz_current_page') || 'home';

    // Function to activate page
    const activatePage = (pageId) => {
        navLinks.forEach(l => l.classList.remove('active'));
        pages.forEach(p => p.classList.remove('active'));

        const targetLink = document.querySelector(`.nav-link[data-page="${pageId}"]`);
        const targetPage = document.getElementById(pageId);

        if (targetLink && targetPage) {
            targetLink.classList.add('active');
            targetPage.classList.add('active');
            localStorage.setItem('enjaz_current_page', pageId);

            // Setup clicks when entering chat page
            if (pageId === 'chat') {
                setTimeout(setupOnlineUsersClicks, 100);
            }
        }
    };

    // Initial Load
    activatePage(savedPage);

    navLinks.forEach(link => {
        link.onclick = (e) => {
            const pageId = link.dataset.page;
            activatePage(pageId);
        };
    });

    // State
    let currentUser = JSON.parse(localStorage.getItem('enjaz_user')) || null;

    // Generate username for existing users if missing
    if (currentUser && !currentUser.username) {
        const cleanName = currentUser.name.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '');
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        currentUser.username = `@${cleanName || 'User'}_${randomNum}`;
        localStorage.setItem('enjaz_user', JSON.stringify(currentUser));
    }

    let tasks = JSON.parse(localStorage.getItem('enjaz_plus_tasks')) || [];
    let globalMessages = JSON.parse(localStorage.getItem('enjaz_global_chat')) || [
        { name: 'سارة ✨', text: 'أهلاً بكل المنضمات الجدد! 🌸 الرابط يعمل الآن.', userId: 'bot_sara', avatar: '👧' }
    ];
    let privateChats = JSON.parse(localStorage.getItem('enjaz_private_chats')) || {}; // { userId: { name, avatar, messages: [] } }
    let activeChatId = 'global';

    // --- Auth Logic ---
    const updateUIForUser = () => {
        if (currentUser) {
            authOverlay.style.display = 'none';
            appWrapper.style.display = 'flex';
            editDisplayName.value = currentUser.name;

            // Handle custom image vs emoji
            // Handle custom image vs emoji
            if (currentUser.customAvatar || (currentUser.avatar && currentUser.avatar.startsWith('data:'))) {
                profileAvatar.style.backgroundImage = `url(${currentUser.avatar})`;
                profileAvatar.style.backgroundSize = 'cover';
                profileAvatar.style.backgroundPosition = 'center';
                profileAvatar.style.color = 'transparent';
                profileAvatar.innerHTML = '';
            } else {
                profileAvatar.style.backgroundImage = 'none';
                profileAvatar.style.color = '';
                profileAvatar.textContent = currentUser.avatar || '👤';
            }

            // Display Username
            let usernameDisplay = document.getElementById('username-display');
            if (!usernameDisplay && editDisplayName && editDisplayName.parentNode) {
                usernameDisplay = document.createElement('div');
                usernameDisplay.id = 'username-display';
                usernameDisplay.style.color = 'var(--text-muted)';
                usernameDisplay.style.fontSize = '0.9rem';
                usernameDisplay.style.marginTop = '5px';
                usernameDisplay.style.marginBottom = '15px';
                usernameDisplay.style.textAlign = 'center';
                usernameDisplay.style.direction = 'ltr';
                usernameDisplay.style.fontWeight = 'bold';
                editDisplayName.parentNode.insertBefore(usernameDisplay, editDisplayName.nextSibling);
            }
            if (usernameDisplay) usernameDisplay.textContent = currentUser.username || '';

            document.querySelector('.brand h2').textContent = currentUser.name;
        } else {
            authOverlay.style.display = 'flex';
            appWrapper.style.display = 'none';
        }
    };

    showSignup.onclick = () => { loginForm.style.display = 'none'; signupForm.style.display = 'block'; };
    showLogin.onclick = () => { signupForm.style.display = 'none'; loginForm.style.display = 'block'; };

    const generateUsername = (name) => {
        // Remove special chars, spaces, and keep english/arabic letters
        const cleanName = name.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '');
        const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 digit number
        return `@${cleanName || 'User'}_${randomNum}`;
    };

    signupBtn.onclick = () => {
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email-new').value;
        if (name && email) {
            const username = generateUsername(name);
            currentUser = { name, email, username, avatar: '👤', id: 'user_' + Date.now() };
            localStorage.setItem('enjaz_user', JSON.stringify(currentUser));
            updateUIForUser();
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        }
    };

    loginBtn.onclick = () => {
        const email = document.getElementById('login-email').value;
        if (email) {
            const name = email.split('@')[0];
            const username = generateUsername(name);
            currentUser = { name, email, username, avatar: '👤', id: 'user_' + Date.now() };
            localStorage.setItem('enjaz_user', JSON.stringify(currentUser));
            updateUIForUser();
        }
    };

    logoutBtn.onclick = () => {
        localStorage.removeItem('enjaz_user');
        currentUser = null;
        updateUIForUser();
    };

    // --- Task Logic ---
    const updateStats = () => {
        const total = tasks.length;
        const done = tasks.filter(t => t.completed).length;
        const percent = total === 0 ? 0 : Math.round((done / total) * 100);
        if (statTotal) statTotal.textContent = total;
        if (statDone) statDone.textContent = done;
        if (statProgress) statProgress.textContent = `${percent}%`;
        localStorage.setItem('enjaz_plus_tasks', JSON.stringify(tasks));
    };

    const renderTasks = () => {
        if (!fullTaskList) return;
        fullTaskList.innerHTML = '';
        tasks.forEach((task) => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <div class="check" style="width:20px; height:20px; border:2px solid var(--primary); border-radius:5px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:var(--primary); font-weight:bold;">
                    ${task.completed ? '✔' : ''}
                </div>
                <span style="flex:1; margin-right:10px; ${task.completed ? 'text-decoration:line-through; opacity:0.5;' : ''}">${task.text}</span>
                <i class="fas fa-trash delete-task" style="cursor:pointer; color:#fdeef2;"></i>
            `;
            li.querySelector('.check').onclick = () => {
                task.completed = !task.completed;
                if (task.completed) confetti({ particleCount: 40, colors: ['#ff85a2'] });
                renderTasks(); updateStats();
            };
            li.querySelector('.delete-task').onclick = () => {
                tasks = tasks.filter(t => t.id !== task.id);
                renderTasks(); updateStats();
            };
            fullTaskList.appendChild(li);
        });
    };

    if (addBtn) {
        addBtn.onclick = () => {
            const text = taskInput.value.trim();
            if (text) {
                tasks.unshift({ id: Date.now(), text, completed: false });
                taskInput.value = '';
                renderTasks(); updateStats();
            }
        };
    }

    // --- Profile Logic ---
    const avatarUploadInput = document.getElementById('avatar-upload');
    const uploadAvatarBtn = document.getElementById('upload-avatar-btn');

    // Handle custom image upload
    if (uploadAvatarBtn && avatarUploadInput) {
        uploadAvatarBtn.onclick = () => avatarUploadInput.click();

        avatarUploadInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const imgData = event.target.result;
                    profileAvatar.style.backgroundImage = `url(${imgData})`;
                    profileAvatar.style.backgroundSize = 'cover';
                    profileAvatar.style.backgroundPosition = 'center';
                    profileAvatar.style.color = 'transparent'; // Make text invisible
                    profileAvatar.innerHTML = ''; // Clear all content

                    // Save as custom image
                    if (currentUser) {
                        currentUser.customAvatar = imgData;
                        currentUser.avatar = imgData; // Use image as avatar
                        localStorage.setItem('enjaz_user', JSON.stringify(currentUser));
                    }
                };
                reader.readAsDataURL(file);
            }
        };
    }

    saveProfileBtn.onclick = () => {
        if (currentUser) {
            currentUser.name = editDisplayName.value;
            if (!currentUser.customAvatar) {
                currentUser.avatar = '👤'; // Default neutral avatar
            }
            localStorage.setItem('enjaz_user', JSON.stringify(currentUser));
            updateUIForUser();
            alert('تم حفظ البيانات بنجاح! ✨🔒');
        }
    };

    // --- Theme System ---
    const applyTheme = (themeName) => {
        document.documentElement.setAttribute('data-theme', themeName);
        localStorage.setItem('enjaz_theme', themeName);

        // Update active state
        document.querySelectorAll('.theme-opt').forEach(opt => {
            if (opt.dataset.theme === themeName) {
                opt.classList.add('active');
                opt.style.borderColor = 'var(--primary)';
            } else {
                opt.classList.remove('active');
                opt.style.borderColor = '#ddd';
            }
        });
    };

    // Load saved theme or default to purple
    const savedTheme = localStorage.getItem('enjaz_theme') || 'purple';
    applyTheme(savedTheme);

    // Theme selector clicks
    document.querySelectorAll('.theme-opt').forEach(opt => {
        opt.onclick = () => {
            const theme = opt.dataset.theme;
            applyTheme(theme);
        };
    });

    // --- View Profiles Modal Logic ---
    const userModal = document.getElementById('user-profile-modal');
    const viewAvatar = document.getElementById('view-user-avatar');
    const viewName = document.getElementById('view-user-name');
    const closeModalBtn = document.querySelector('.close-modal');
    let currentlyViewingUser = null;

    const showUserProfile = (name, avatar, userId) => {
        viewName.textContent = name;
        if (avatar && (avatar.startsWith('data:image') || avatar.startsWith('blob:'))) {
            viewAvatar.innerHTML = `<img src="${avatar}" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 4px solid var(--primary); box-shadow: 0 4px 15px rgba(0,0,0,0.15);">`;
            viewAvatar.style.fontSize = '';
        } else {
            viewAvatar.textContent = avatar || '👩‍🎓';
            viewAvatar.style.fontSize = '4rem';
        }
        currentlyViewingUser = { name, avatar, id: userId || 'bot_' + name };
        userModal.style.display = 'flex';
    };

    if (closeModalBtn) closeModalBtn.onclick = () => userModal.style.display = 'none';
    window.addEventListener('click', (e) => { if (e.target === userModal) userModal.style.display = 'none'; });


    // --- Helper to Render Avatar (Image or Text) ---
    const getAvatarHTML = (avatar) => {
        if (!avatar) return '👩‍🎓';
        if (avatar.startsWith('data:image') || avatar.startsWith('blob:')) {
            return `<img src="${avatar}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; vertical-align: middle; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.1); margin-left: 8px;">`;
        }
        return `<span style="font-size: 1.2rem; vertical-align: middle; margin-left: 5px;">${avatar}</span>`;
    };

    // --- Chat Logic ---
    const botUsers = [
        { name: 'أحمد ⚡', avatar: '👨‍🎓', id: 'bot_ahmed', username: '@Ahmed_Bot' },
        { name: 'سارة ✨', avatar: '👩‍🎓', id: 'bot_sara', username: '@Sarah_Bot' },
        { name: 'محمد 🌟', avatar: '👑', id: 'bot_mohamed', username: '@Mohamed_Star' },
        { name: 'نور 🌸', avatar: '👸', id: 'bot_nour', username: '@Nour_Flower' }
    ];

    const renderOnlineUsers = (filter = '') => {
        const onlineListContainer = document.getElementById('online-users-list');
        // If container doesn't exist, we might be using the static list in HTML which we should clear or hide
        // For this implementation, let's target the static list container parent or clear previous static items
        // To be safe, let's look for where we added the empty div in index.html
        if (!onlineListContainer) return;

        onlineListContainer.innerHTML = '';

        const filteredUsers = botUsers.filter(u =>
            u.name.toLowerCase().includes(filter.toLowerCase()) ||
            (u.username && u.username.toLowerCase().includes(filter.toLowerCase()))
        );

        // Add current user to search results if they match
        if (currentUser && (
            currentUser.name.toLowerCase().includes(filter.toLowerCase()) ||
            (currentUser.username && currentUser.username.toLowerCase().includes(filter.toLowerCase()))
        )) {
            filteredUsers.unshift({
                name: currentUser.name + ' (أنت)',
                avatar: currentUser.avatar,
                id: currentUser.id,
                username: currentUser.username,
                isMe: true
            });
        }

        if (filteredUsers.length === 0) {
            onlineListContainer.innerHTML = `<div style="text-align:center; font-size:0.8rem; color:var(--text-muted); padding:10px;">لا يوجد نتائج 😕</div>`;
            return;
        }

        filteredUsers.forEach(user => {
            const div = document.createElement('div');
            div.className = 'user-online';
            div.style.display = 'flex';
            div.style.alignItems = 'center';
            div.style.gap = '10px';
            div.style.fontSize = '0.85rem';
            div.style.cursor = 'pointer';
            div.style.marginBottom = '10px';

            // Check if it is the current user to handle click differently
            const isMe = user.isMe;

            div.innerHTML = `
                <div style="width: 35px; height: 35px; background: ${isMe ? 'var(--primary)' : '#ffb3c6'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
                    ${getAvatarHTML(user.avatar)}
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: bold; ${isMe ? 'color:var(--primary);' : ''}">${user.name}</div>
                    <div style="font-size: 0.7rem; color: var(--text-muted);">${user.username || ''}</div>
                </div>
                <div style="width: 8px; height: 8px; background: #4ade80; border-radius: 50%;"></div>
            `;

            if (isMe) {
                div.onclick = () => {
                    // Go to profile page instead of chat
                    const profileLink = document.querySelector('.nav-link[data-page="profile"]');
                    if (profileLink) profileLink.click();
                };
            } else {
                div.onclick = () => showUserProfile(user.name, user.avatar, user.id);
            }
            onlineListContainer.appendChild(div);
        });
    };

    // User Search Logic
    const searchInput = document.getElementById('user-search-input');
    if (searchInput) {
        searchInput.oninput = (e) => {
            renderOnlineUsers(e.target.value);
        };
    }

    // Initial Render
    renderOnlineUsers();
    const renderChatSidebar = () => {
        privateChatsList.innerHTML = '';
        Object.keys(privateChats).forEach(id => {
            const chat = privateChats[id];
            const div = document.createElement('div');
            div.className = `chat-tab ${activeChatId === id ? 'active' : ''}`;
            div.style.padding = '10px';
            div.style.cursor = 'pointer';
            div.style.borderRadius = '15px';
            div.style.background = activeChatId === id ? 'var(--primary)' : 'white';
            div.style.color = activeChatId === id ? 'white' : 'var(--text-main)';
            div.style.display = 'flex';
            div.style.alignItems = 'center';
            div.style.gap = '10px';
            div.style.fontSize = '0.85rem';
            div.style.boxShadow = '0 2px 5px rgba(0,0,0,0.02)';

            div.innerHTML = `${getAvatarHTML(chat.avatar)} <span>${chat.name}</span>`;
            div.onclick = () => {
                activeChatId = id;
                globalChatTab.classList.remove('active');
                globalChatTab.style.background = 'white';
                globalChatTab.style.color = 'var(--text-main)';
                renderChatSidebar();
                renderMessages();
            };
            privateChatsList.appendChild(div);
        });
    };

    globalChatTab.onclick = () => {
        activeChatId = 'global';
        globalChatTab.classList.add('active');
        globalChatTab.style.background = 'var(--primary)';
        globalChatTab.style.color = 'white';
        renderChatSidebar();
        renderMessages();
    };

    startPrivateChatBtn.onclick = () => {
        if (!currentlyViewingUser) return;
        const id = currentlyViewingUser.id;
        if (!privateChats[id]) {
            privateChats[id] = {
                name: currentlyViewingUser.name,
                avatar: currentlyViewingUser.avatar,
                messages: []
            };
            localStorage.setItem('enjaz_private_chats', JSON.stringify(privateChats));
        }
        activeChatId = id;
        userModal.style.display = 'none';
        globalChatTab.classList.remove('active');
        globalChatTab.style.background = 'white';
        globalChatTab.style.color = 'var(--text-main)';
        renderChatSidebar();
        renderMessages();
        // Switch to chat page if not there
        navLinks.forEach(l => {
            if (l.dataset.page === 'chat') l.click();
        });
    };

    const renderMessages = () => {
        chatMessages.innerHTML = '';
        const currentMessages = activeChatId === 'global' ? globalMessages : privateChats[activeChatId].messages;

        currentMessages.forEach(msg => {
            const isMe = msg.userId === currentUser?.id;
            const msgDiv = document.createElement('div');
            msgDiv.className = `message ${isMe ? 'outgoing' : 'incoming'}`;
            msgDiv.style.alignSelf = isMe ? 'flex-end' : 'flex-start';
            msgDiv.style.background = isMe ? 'var(--primary)' : '#fdeef2';
            msgDiv.style.color = isMe ? 'white' : 'var(--text-main)';
            msgDiv.style.padding = '12px 20px';
            msgDiv.style.borderRadius = isMe ? '20px 20px 5px 20px' : '20px 20px 20px 5px';
            msgDiv.style.maxWidth = '80%';
            msgDiv.style.marginBottom = '10px';
            msgDiv.innerHTML = `
                <strong class="user-link" style="display:block; font-size:0.7rem; margin-bottom:5px; color:${isMe ? '#fff' : 'var(--primary)'}; cursor:pointer;">
                    ${msg.name} <span style="vertical-align: middle;">${getAvatarHTML(msg.avatar)}</span>
                </strong>
                ${msg.text}
            `;

            msgDiv.querySelector('.user-link').onclick = (e) => {
                e.stopPropagation();
                showUserProfile(msg.name, msg.avatar, msg.userId);
            };

            chatMessages.appendChild(msgDiv);
        });
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const sendMsg = () => {
        const text = chatInput.value.trim();
        if (text && currentUser) {
            const newMsg = {
                name: currentUser.name,
                text: text,
                avatar: currentUser.avatar,
                userId: currentUser.id,
                timestamp: Date.now()
            };

            if (activeChatId === 'global') {
                globalMessages.push(newMsg);
                localStorage.setItem('enjaz_global_chat', JSON.stringify(globalMessages));
            } else {
                privateChats[activeChatId].messages.push(newMsg);
                localStorage.setItem('enjaz_private_chats', JSON.stringify(privateChats));
            }

            chatInput.value = '';
            renderMessages();

            // Simulation
            if (activeChatId === 'global' && globalMessages.length % 5 === 0) {
                setTimeout(() => {
                    globalMessages.push({ name: 'نور الهُدى', text: 'أهلاً بكِ في الغرفة العامة! ✨🔒', avatar: '🕊️', userId: 'bot_nour' });
                    renderMessages();
                }, 1500);
            } else if (activeChatId !== 'global') {
                setTimeout(() => {
                    const chat = privateChats[activeChatId];
                    chat.messages.push({ name: chat.name, text: 'وصلت رسالتكِ الخاصة يا جميلة! 🌸💖', avatar: chat.avatar, userId: activeChatId });
                    localStorage.setItem('enjaz_private_chats', JSON.stringify(privateChats));
                    if (activeChatId === activeChatId) renderMessages();
                }, 2000);
            }
        }
    };

    if (sendChatBtn) sendChatBtn.onclick = sendMsg;
    chatInput.onkeypress = (e) => { if (e.key === 'Enter') sendMsg(); };

    // --- Make Online Users Clickable ---
    const setupOnlineUsersClicks = () => {
        const onlineUsers = document.querySelectorAll('.user-online');
        onlineUsers.forEach(userEl => {
            userEl.onclick = () => {
                const nameEl = userEl.querySelector('span');
                const name = nameEl ? nameEl.textContent.trim() : '';
                // Get avatar from the user element's first div or img
                const avatarImg = userEl.querySelector('img');
                const avatarDiv = userEl.querySelector('div');
                let avatar = '👩‍🎓';

                if (avatarImg) {
                    avatar = avatarImg.src;
                } else if (avatarDiv) {
                    avatar = avatarDiv.textContent.trim();
                }

                showUserProfile(name, avatar, 'online_' + name);
            };
        });
    };

    // --- Navigation (Handled by persistence logic above) ---

    // --- Share Logic ---
    document.getElementById('share-site-btn').onclick = () => {
        const shareLink = window.location.protocol === "file:" ? "ارفعي الموقع أولاً للحصول على رابط آمن HTTPS ✨" : window.location.href;
        navigator.clipboard.writeText(shareLink).then(() => {
            alert(window.location.protocol === "file:" ? shareLink : 'تم نسخ الرابط الآمن! أرسليه لصديقاتكِ الآن 🔗💖');
        });
    };

    // ========== Materials Management System ==========

    let materials = JSON.parse(localStorage.getItem('enjaz_materials')) || { files: [] };
    let currentSubject = 'Image Processing';

    const saveMaterials = () => {
        localStorage.setItem('enjaz_materials', JSON.stringify(materials));
    };

    // Category Tabs Handler (Theory vs Practical)
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.onclick = () => {
            const category = tab.dataset.category;

            // Update tab styles
            document.querySelectorAll('.category-tab').forEach(t => {
                t.style.background = 'white';
                t.style.color = 'var(--text-main)';
            });
            tab.style.background = 'var(--primary)';
            tab.style.color = 'white';

            // Toggle sections
            const theorySection = document.getElementById('theory-subjects');
            const practicalSection = document.getElementById('practical-subjects');

            if (category === 'theory') {
                theorySection.style.display = 'block';
                practicalSection.style.display = 'none';
                currentSubject = 'Image Processing';
            } else {
                theorySection.style.display = 'none';
                practicalSection.style.display = 'block';
                currentSubject = 'Compilers II Lab';
            }

            // Update title
            const titleEl = document.getElementById('current-subject-title');
            if (titleEl) titleEl.textContent = currentSubject;

            renderMaterials();
        };
    });

    // Subject Tabs Handler
    document.querySelectorAll('.subject-tab').forEach(tab => {
        tab.onclick = () => {
            currentSubject = tab.dataset.subject;

            // Find parent section
            const parentSection = tab.closest('#theory-subjects, #practical-subjects');

            // Update only tabs in this section
            if (parentSection) {
                parentSection.querySelectorAll('.subject-tab').forEach(t => {
                    t.style.background = 'white';
                    t.style.color = 'var(--text-main)';
                });
            }
            tab.style.background = 'var(--primary)';
            tab.style.color = 'white';

            // Update title
            const titleEl = document.getElementById('current-subject-title');
            if (titleEl) titleEl.textContent = currentSubject;

            renderMaterials();
        };
    });

    const getFileIcon = (type) => {
        const icons = {
            pdf: '📄',
            doc: '📝',
            docx: '📝',
            ppt: '📊',
            pptx: '📊',
            jpg: '🖼️',
            jpeg: '🖼️',
            png: '🖼️',
            txt: '📃'
        };
        return icons[type] || '📎';
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getTotalStorage = () => {
        return materials.files.reduce((total, file) => total + file.size, 0);
    };

    const updateMaterialsStats = () => {
        const storedMaterials = JSON.parse(localStorage.getItem('enjaz_materials')) || { files: [] };
        const subjectFiles = storedMaterials.files.filter(f => f.subject === currentSubject);
        const subjectStorage = subjectFiles.reduce((total, file) => total + file.size, 0);

        if (filesCount) filesCount.textContent = subjectFiles.length;
        if (storageUsed) storageUsed.textContent = formatFileSize(subjectStorage);
    };

    const renderMaterials = () => {
        if (!materialsList) return;

        // Always read fresh data from localStorage
        const storedMaterials = JSON.parse(localStorage.getItem('enjaz_materials')) || { files: [] };

        // Filter by current subject
        const subjectFiles = storedMaterials.files.filter(f => f.subject === currentSubject);

        if (subjectFiles.length === 0) {
            materialsList.innerHTML = `
                <div style="text-align: center; padding: 60px 20px;">
                    <i class="fas fa-inbox" style="font-size: 4rem; color: #e0e0e0; margin-bottom: 20px;"></i>
                    <p style="color: var(--text-muted); font-size: 1.1rem;">لا توجد ملفات لهذه المادة بعد</p>
                    <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 10px;">ابدأ برفع ملفاتك الآن!</p>
                </div>
            `;
            updateMaterialsStats();
            return;
        }

        let html = '<div style="display: grid; gap: 12px;">';


        subjectFiles.forEach(file => {
            if (file.type === 'lecture_unit') {
                // RENDER LECTURE UNIT
                const date = new Date(file.uploadDate).toLocaleDateString('ar-EG');
                html += `
                    <div style="background: white; padding: 20px; border-radius: 18px; box-shadow: var(--card-shadow); margin-bottom: 15px; border-right: 5px solid var(--primary); transition: all 0.3s;" onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 25px rgba(0,0,0,0.1)';" onmouseout="this.style.transform=''; this.style.boxShadow='var(--card-shadow)';">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                            <div>
                                <h4 style="margin: 0; color: var(--primary); font-size: 1.1rem; font-family: 'Tajawal', sans-serif;">
                                    <i class="fas fa-chalkboard-teacher"></i> ${file.title}
                                </h4>
                                <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 5px;">${date}</div>
                            </div>
                            <button onclick="deleteMaterial('${file.id}')" style="background: none; border: none; color: #ff4757; cursor: pointer;" title="حذف المحاضرة">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                        
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            <!-- PDF Button -->
                            <button onclick="viewLecturePart('${file.id}', 'pdf')" style="flex: 1; padding: 10px; background: #fff0f3; border: 1px solid #ffccd5; border-radius: 12px; color: var(--text-main); font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s;">
                                <i class="fas fa-file-pdf" style="color: #e74c3c;"></i> ملف المحاضرة
                            </button>
                            
                            <!-- HTML Button -->
                            <button onclick="viewLecturePart('${file.id}', 'html')" style="flex: 1; padding: 10px; background: #e3f2fd; border: 1px solid #bbdefb; border-radius: 12px; color: var(--text-main); font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s;">
                                <i class="fab fa-html5" style="color: #e67e22;"></i> شرح المحاضرة
                            </button>
                        </div>
                    </div>
                 `;
            } else {
                // RENDER TRADITIONAL FILE
                const icon = getFileIcon(file.type);
                const date = new Date(file.uploadDate).toLocaleDateString('ar-EG');
                html += `
                    <div style="background: white; padding: 18px; border-radius: 18px; box-shadow: var(--card-shadow); display: flex; align-items: center; gap: 15px; transition: all 0.3s;" onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 25px rgba(0,0,0,0.1)';" onmouseout="this.style.transform=''; this.style.boxShadow='var(--card-shadow)';">
                        <div style="font-size: 2.5rem;">${icon}</div>
                        <div style="flex: 1;">
                            <div style="font-weight: bold; font-size: 1rem; color: var(--text-main); margin-bottom: 5px;">${file.name}</div>
                            <div style="font-size: 0.85rem; color: var(--text-muted);">
                                ${formatFileSize(file.size)} • ${date}
                            </div>
                            ${file.notes ? `<div style="font-size: 0.8rem; color: var(--accent); margin-top: 5px;"><i class="fas fa-sticky-note"></i> ${file.notes}</div>` : ''}
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button onclick="viewMaterial(${file.id})" style="padding: 10px 15px; border: none; border-radius: 12px; background: var(--accent); color: white; cursor: pointer; transition: all 0.3s;" title="فتح">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button onclick="downloadMaterial(${file.id})" style="padding: 10px 15px; border: none; border-radius: 12px; background: var(--primary); color: white; cursor: pointer; transition: all 0.3s;" title="تحميل">
                                <i class="fas fa-download"></i>
                            </button>
                            <button onclick="deleteMaterial('${file.id}')" style="padding: 10px 15px; border: none; border-radius: 12px; background: #ff4757; color: white; cursor: pointer; transition: all 0.3s;" title="حذف">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            }
        });

        html += '</div>';
        materialsList.innerHTML = html;
        updateMaterialsStats();
    };

    window.downloadMaterial = (id) => {
        // Get fresh data from localStorage
        const storedMaterials = JSON.parse(localStorage.getItem('enjaz_materials')) || { files: [] };
        const material = storedMaterials.files.find(m => m.id === id);
        if (!material) {
            alert('الملف غير موجود!');
            return;
        }

        try {
            // Convert base64 to blob for better browser compatibility
            const base64Data = material.data.split(',')[1];
            const mimeType = material.data.split(',')[0].split(':')[1].split(';')[0];

            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: mimeType });

            // Create download link using Blob URL
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = material.fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up the URL after a brief delay
            setTimeout(() => URL.revokeObjectURL(url), 100);
        } catch (error) {
            alert('حدث خطأ أثناء تحميل الملف: ' + error.message);
        }
    };

    window.viewMaterial = (id) => {
        // Get fresh data from localStorage
        const storedMaterials = JSON.parse(localStorage.getItem('enjaz_materials')) || { files: [] };
        const material = storedMaterials.files.find(m => m.id === id);
        if (!material) {
            alert('الملف غير موجود!');
            return;
        }

        try {
            // Convert base64 to blob
            const base64Data = material.data.split(',')[1];
            const mimeType = material.data.split(',')[0].split(':')[1].split(';')[0];

            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: mimeType });

            // Open in new tab
            const url = URL.createObjectURL(blob);
            const newWindow = window.open(url, '_blank');

            // Clean up after window opens
            if (newWindow) {
                newWindow.onload = () => {
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                };
            } else {
                alert('تم حظر النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة لهذا الموقع.');
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            alert('حدث خطأ أثناء فتح الملف: ' + error.message);
        }
    };

    window.viewLecturePart = (id, part) => {
        const storedMaterials = JSON.parse(localStorage.getItem('enjaz_materials')) || { files: [] };
        // Comparison with string ID for safety
        const material = storedMaterials.files.find(m => String(m.id) === String(id));

        if (!material || material.type !== 'lecture_unit') {
            alert('المحاضرة غير موجودة!');
            return;
        }

        const fileData = part === 'pdf' ? material.pdf : material.html;

        try {
            const base64Data = fileData.data.split(',')[1];
            const mimeType = fileData.data.split(',')[0].split(':')[1].split(';')[0];

            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: mimeType });

            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (e) {
            alert('خطأ في فتح الملف: ' + e.message);
        }
    };

    window.deleteMaterial = (id) => {
        // Force string comparison
        const targetId = String(id);
        console.log('Attempting to delete material with ID:', targetId);

        // if (confirm('هل أنت متأكد من حذف هذا الملف؟')) {
        try {
            // 1. Get RAW localStorage data
            const rawData = localStorage.getItem('enjaz_materials');
            const storedMaterials = rawData ? JSON.parse(rawData) : { files: [] };

            // 2. Filter
            const originalLength = storedMaterials.files.length;
            const newFiles = storedMaterials.files.filter(m => String(m.id) !== targetId);

            if (newFiles.length === originalLength) {
                console.warn('ID not found in storage:', targetId);
                // Attempt fallback: try ID number conversion
                const fallbackFiles = storedMaterials.files.filter(m => m.id != id);
                if (fallbackFiles.length === originalLength) {
                    alert('خطأ: لم يتم العثور على الملف. يرجى تحديث الصفحة.');
                    return;
                }
                storedMaterials.files = fallbackFiles;
            } else {
                storedMaterials.files = newFiles;
            }

            // 3. Save IMMEDIATELY
            localStorage.setItem('enjaz_materials', JSON.stringify(storedMaterials));

            // 4. Update memory (just in case)
            if (typeof materials !== 'undefined') {
                materials.files = storedMaterials.files;
            }

            // 5. Notify and RELOAD
            alert('تم الحذف بنجاح! ✅');
            window.location.reload();

        } catch (e) {
            console.error('Delete error:', e);
            alert('حدث خطأ غير متوقع أثناء الحذف: ' + e.message);
        }
        // }
    };

    if (uploadMaterialBtn) {
        uploadMaterialBtn.onclick = () => materialsUpload.click();
    }

    if (materialsUpload) {
        materialsUpload.onchange = (e) => {
            const files = Array.from(e.target.files);

            if (files.length === 0) return;

            // Check storage limit (5MB warning)
            const currentStorage = getTotalStorage();
            const newStorage = files.reduce((sum, f) => sum + f.size, 0);

            if (currentStorage + newStorage > 5 * 1024 * 1024) {
                alert('تحذير: اقتربت من حد التخزين (5 MB). قد تواجه مشاكل في حفظ الملفات الكبيرة.');
            }

            const notes = prompt('ملاحظات (اختياري):', '');

            let processed = 0;
            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const extension = file.name.split('.').pop().toLowerCase();
                    const material = {
                        id: Date.now() + processed,
                        name: file.name.replace(/\.[^/.]+$/, ""),
                        fileName: file.name,
                        subject: currentSubject,
                        type: extension,
                        size: file.size,
                        data: event.target.result,
                        uploadDate: new Date().toISOString(),
                        notes: notes
                    };

                    materials.files.push(material);
                    processed++;

                    if (processed === files.length) {
                        saveMaterials();
                        renderMaterials();
                        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                    }
                };
                reader.readAsDataURL(file);
            });

            e.target.value = '';
        };
    }

    // --- New Lecture Unit Logic ---
    if (addLectureBtn) {
        addLectureBtn.onclick = () => {
            const title = lectureTitleInput.value.trim();
            const pdfFile = lecturePdfInput.files[0];
            const htmlFile = lectureHtmlInput.files[0];

            if (!title) {
                alert('يرجى كتابة عنوان للمحاضرة');
                return;
            }
            if (!pdfFile || !htmlFile) {
                alert('يرجى اختيار ملف المحاضرة (PDF) وملف الشرح (HTML)');
                return;
            }

            // Check Size
            const totalSize = pdfFile.size + htmlFile.size;
            if (getTotalStorage() + totalSize > 5 * 1024 * 1024) {
                alert('مساحة التخزين غير كافية! يرجى حذف بعض الملفات القديمة.');
                return;
            }

            // Read Files
            const readerPDF = new FileReader();
            const readerHTML = new FileReader();

            // Nested callbacks to ensure both are read
            readerPDF.onload = (ePDF) => {
                readerHTML.onload = (eHTML) => {

                    const lectureUnit = {
                        id: Date.now(),
                        type: 'lecture_unit',
                        subject: currentSubject,
                        title: title,
                        size: totalSize,
                        uploadDate: new Date().toISOString(),
                        pdf: {
                            name: pdfFile.name,
                            size: pdfFile.size,
                            type: 'pdf',
                            data: ePDF.target.result
                        },
                        html: {
                            name: htmlFile.name,
                            size: htmlFile.size,
                            type: 'html',
                            data: eHTML.target.result
                        }
                    };

                    materials.files.push(lectureUnit);
                    saveMaterials();
                    renderMaterials();

                    // Reset inputs
                    lectureTitleInput.value = '';
                    lecturePdfInput.value = '';
                    lectureHtmlInput.value = '';

                    confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
                    alert('تم إضافة المحاضرة بنجاح! 📚✨');
                };
                readerHTML.readAsDataURL(htmlFile);
            };
            readerPDF.readAsDataURL(pdfFile);
        };
    }

    // Init
    updateUIForUser();
    renderTasks();
    updateStats();
    renderChatSidebar();
    renderMessages();
    setupOnlineUsersClicks();
    renderMaterials();
});
