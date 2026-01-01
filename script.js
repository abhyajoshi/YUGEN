// YŪGEN - Enhanced Version with Comments, Follow/Unfollow, Dark Mode, Profile Customization, Delete Posts
var currentUser = null;
var allUsers = JSON.parse(localStorage.getItem('yugen_users')) || [];
var allPosts = JSON.parse(localStorage.getItem('yugen_posts')) || [];
var conversations = JSON.parse(localStorage.getItem('yugen_conversations')) || [];
var selectedFeelings = ['soft'];
var currentMedia = 'https://images.unsplash.com/photo-1604537529428-15bcbeecfe4d?w=800&q=80';
var currentFeedFilter = 'all';

// Content Moderation - Enhanced to catch variations
var offensiveWords = ['hate', 'kill', 'stupid', 'idiot', 'dumb', 'loser', 'ugly'];
var hateSpeechPatterns = [
    /\bkys\b/i, 
    /\bstfu\b/i, 
    /f+[\W_]*u+[\W_]*c+[\W_]*k+/i, 
    /s+[\W_]*h+[\W_]*i+[\W_]*t+/i, 
    /b+[\W_]*i+[\W_]*t+[\W_]*c+[\W_]*h+/i, 
    /a+[\W_]*s+[\W_]*s+[\W_]*h+[\W_]*o+[\W_]*l+[\W_]*e+/i
];

function containsHateSpeech(text) {
    if (!text) return false;
    var lower = text.toLowerCase();
    for (var i = 0; i < offensiveWords.length; i++) {
        if (lower.includes(offensiveWords[i])) return true;
    }
    for (var j = 0; j < hateSpeechPatterns.length; j++) {
        if (hateSpeechPatterns[j].test(text)) return true;
    }
    return false;
}

function showWarning(msg) {
    var modal = document.createElement('div');
    modal.className = 'warning-modal';
    modal.innerHTML = '<div class="warning-content"><div class="warning-icon">⚠️</div><h3>Content Warning</h3><p>' + msg + '</p><p class="warning-subtitle">YŪGEN is a space for kindness and empathy. Please choose your words with care.</p><button class="warning-btn" onclick="this.parentElement.parentElement.remove()">I Understand</button></div>';
    document.body.appendChild(modal);
    setTimeout(function() { if (modal.parentElement) modal.remove(); }, 10000);
}

// Dark Mode
function toggleDarkMode() {
    var isDark = document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
    
    var sunIcon = document.querySelector('.sun-icon');
    var moonIcon = document.querySelector('.moon-icon');
    
    if (isDark) {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
        localStorage.setItem('yugen_theme', 'dark');
    } else {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
        localStorage.setItem('yugen_theme', 'light');
    }
}

// Initialize
window.onload = function() {
    var loggedIn = localStorage.getItem('yugen_current_user');
    if (loggedIn) {
        currentUser = JSON.parse(loggedIn);
        showMainApp();
    }
    
    // Apply saved theme
    var savedTheme = localStorage.getItem('yugen_theme');
    if (savedTheme === 'dark') {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
        document.querySelector('.sun-icon').style.display = 'none';
        document.querySelector('.moon-icon').style.display = 'block';
    }
    
    // Daily prompts
    var prompts = [
        "What does home feel like to you right now?",
        "When did you last feel truly seen?",
        "What are you holding onto that you need to release?",
        "Describe a moment when time felt different.",
        "What does your younger self need to hear today?"
    ];
    var today = new Date();
    var dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
    document.getElementById('daily-prompt-text').textContent = prompts[dayOfYear % prompts.length];
    document.getElementById('prompt-date').textContent = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

// Auth Toggle
document.getElementById('show-signup').addEventListener('click', function() {
    document.getElementById('login-form').classList.remove('active');
    document.getElementById('signup-form').classList.add('active');
});

document.getElementById('show-login').addEventListener('click', function() {
    document.getElementById('signup-form').classList.remove('active');
    document.getElementById('login-form').classList.add('active');
});

// Sign Up
document.getElementById('signup-btn').addEventListener('click', function() {
    var name = document.getElementById('signup-name').value.trim();
    var username = document.getElementById('signup-username').value.trim();
    var email = document.getElementById('signup-email').value.trim();
    var password = document.getElementById('signup-password').value;
    
    if (!name || !username || !email || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }
    
    var exists = allUsers.find(function(u) { return u.username === username || u.email === email; });
    if (exists) {
        alert('Username or email already exists');
        return;
    }
    
    var newUser = {
        id: Date.now().toString(),
        name: name,
        username: username,
        email: email,
        password: password,
        following: [],
        bio: '',
        profilePic: ''
    };
    
    allUsers.push(newUser);
    localStorage.setItem('yugen_users', JSON.stringify(allUsers));
    
    currentUser = newUser;
    localStorage.setItem('yugen_current_user', JSON.stringify(currentUser));
    
    alert('Account created successfully! Welcome to YŪGEN 🕊️');
    showMainApp();
});

// Login
document.getElementById('login-btn').addEventListener('click', function() {
    var username = document.getElementById('login-username').value.trim();
    var password = document.getElementById('login-password').value;
    
    if (!username || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    var user = allUsers.find(function(u) {
        return (u.username === username || u.email === username) && u.password === password;
    });
    
    if (user) {
        if (!user.following) user.following = [];
        if (!user.bio) user.bio = '';
        if (!user.profilePic) user.profilePic = '';
        currentUser = user;
        localStorage.setItem('yugen_current_user', JSON.stringify(currentUser));
        showMainApp();
    } else {
        alert('Invalid username/email or password');
    }
});

// Logout
document.getElementById('logout-btn').addEventListener('click', function() {
    localStorage.removeItem('yugen_current_user');
    location.reload();
});

function showMainApp() {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
    document.getElementById('profile-name').textContent = currentUser.name;
    document.getElementById('profile-username').textContent = '@' + currentUser.username;
    document.getElementById('following-count').textContent = currentUser.following ? currentUser.following.length : 0;
    
    updateProfileDisplay();
    loadPosts();
    loadFriends();
    
    // Initialize profile customization event listeners
    initializeProfileCustomization();
}

// Profile Customization Functions
function initializeProfileCustomization() {
    document.getElementById('edit-avatar-btn').addEventListener('click', function() {
        document.getElementById('profile-pic-input').click();
    });

    document.getElementById('profile-pic-input').addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (file) {
            var reader = new FileReader();
            reader.onload = function(event) {
                var profilePic = event.target.result;
                
                // Update current user
                currentUser.profilePic = profilePic;
                
                // Update in allUsers array
                var userIndex = allUsers.findIndex(function(u) { return u.id === currentUser.id; });
                if (userIndex !== -1) {
                    allUsers[userIndex].profilePic = profilePic;
                    localStorage.setItem('yugen_users', JSON.stringify(allUsers));
                }
                
                // Save to current user storage
                localStorage.setItem('yugen_current_user', JSON.stringify(currentUser));
                
                // Update display
                updateProfileDisplay();
                
                alert('Profile picture updated! 📸');
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('edit-bio-btn').addEventListener('click', function() {
        var currentBio = currentUser.bio || '';
        var newBio = prompt('Edit your bio (max 150 characters):', currentBio);
        
        if (newBio !== null) {
            if (newBio.length > 150) {
                alert('Bio must be 150 characters or less');
                return;
            }
            
            if (containsHateSpeech(newBio)) {
                showWarning('Your bio contains inappropriate language. Please choose kinder words.');
                return;
            }
            
            // Update current user
            currentUser.bio = newBio.trim();
            
            // Update in allUsers array
            var userIndex = allUsers.findIndex(function(u) { return u.id === currentUser.id; });
            if (userIndex !== -1) {
                allUsers[userIndex].bio = newBio.trim();
                localStorage.setItem('yugen_users', JSON.stringify(allUsers));
            }
            
            // Save to current user storage
            localStorage.setItem('yugen_current_user', JSON.stringify(currentUser));
            
            // Update display
            updateProfileDisplay();
        }
    });
}

function updateProfileDisplay() {
    // Update profile picture in profile page
    if (currentUser.profilePic) {
        document.getElementById('profile-pic').src = currentUser.profilePic;
        document.getElementById('profile-pic').style.display = 'block';
        document.getElementById('profile-avatar-text').style.display = 'none';
    } else {
        document.getElementById('profile-pic').style.display = 'none';
        document.getElementById('profile-avatar-text').style.display = 'flex';
        document.getElementById('profile-avatar-text').textContent = currentUser.name.charAt(0).toUpperCase();
    }
    
    // Update bio
    if (currentUser.bio && currentUser.bio.trim()) {
        document.getElementById('profile-bio-display').textContent = currentUser.bio;
        document.getElementById('profile-bio-display').style.fontStyle = 'normal';
        document.getElementById('profile-bio-display').style.color = '';
    } else {
        document.getElementById('profile-bio-display').textContent = 'Add a bio to express yourself...';
        document.getElementById('profile-bio-display').style.fontStyle = 'italic';
    }
}

// Theme Toggle
document.getElementById('theme-toggle').addEventListener('click', toggleDarkMode);

// Navigation
document.querySelectorAll('.nav-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
        if (btn.id === 'profile-btn') {
            document.querySelectorAll('.nav-btn').forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            document.querySelectorAll('.view').forEach(function(v) { v.classList.remove('active'); });
            document.getElementById('profile-view').classList.add('active');
            var userPosts = allPosts.filter(function(p) { return p.userId === currentUser.id; });
            document.getElementById('posts-count').textContent = userPosts.length;
            return;
        }
        
        var view = btn.dataset.view;
        if (!view) return;
        
        document.querySelectorAll('.nav-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        document.querySelectorAll('.view').forEach(function(v) { v.classList.remove('active'); });
        document.getElementById(view + '-view').classList.add('active');
        
        if (view === 'feed') loadPosts();
        if (view === 'friends') loadFriends();
        if (view === 'chat') loadChats();
    });
});

// Feed Filters
document.querySelectorAll('.filter-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        currentFeedFilter = btn.dataset.filter;
        loadPosts();
    });
});

// Feelings
document.getElementById('feelings-grid').addEventListener('click', function(e) {
    if (e.target.classList.contains('feeling-btn')) {
        var feeling = e.target.dataset.feeling;
        if (selectedFeelings.includes(feeling)) {
            selectedFeelings = selectedFeelings.filter(function(f) { return f !== feeling; });
            e.target.classList.remove('selected');
        } else {
            selectedFeelings.push(feeling);
            e.target.classList.add('selected');
        }
    }
});

// Media Upload
document.getElementById('upload-trigger').addEventListener('click', function() {
    document.getElementById('file-input').click();
});

document.getElementById('file-input').addEventListener('change', function(e) {
    var file = e.target.files[0];
    if (file) {
        var reader = new FileReader();
        reader.onload = function(event) {
            currentMedia = event.target.result;
            document.getElementById('preview-image').src = currentMedia;
            document.getElementById('remove-media').style.display = 'inline-block';
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('remove-media').addEventListener('click', function() {
    currentMedia = 'https://images.unsplash.com/photo-1604537529428-15bcbeecfe4d?w=800&q=80';
    document.getElementById('preview-image').src = currentMedia;
    document.getElementById('file-input').value = '';
    document.getElementById('remove-media').style.display = 'none';
});

document.getElementById('respond-btn').addEventListener('click', function() {
    document.getElementById('micro-entry').focus();
    document.getElementById('micro-entry').scrollIntoView({ behavior: 'smooth', block: 'center' });
});

// Create Post
document.getElementById('post-btn').addEventListener('click', function() {
    var entry = document.getElementById('micro-entry').value.trim();
    var destination = document.querySelector('input[name="destination"]:checked').value;
    
    if (!entry) {
        alert('Please write something in your micro-entry');
        return;
    }
    
    if (containsHateSpeech(entry)) {
        showWarning('Your post contains inappropriate language or hate speech. Please revise your message to maintain our community of kindness.');
        return;
    }
    
    var post = {
        id: Date.now().toString(),
        userId: currentUser.id,
        author: currentUser.name,
        username: currentUser.username,
        feelings: selectedFeelings.slice(),
        media: currentMedia,
        entry: entry,
        location: destination === 'limerence' ? 'limerence lounge' : 'memory garden',
        createdAt: new Date().toISOString(),
        empathy: { feel: 0, softened: 0 },
        comments: []
    };
    
    allPosts.unshift(post);
    localStorage.setItem('yugen_posts', JSON.stringify(allPosts));
    
    document.getElementById('micro-entry').value = '';
    selectedFeelings = ['soft'];
    document.querySelectorAll('.feeling-btn').forEach(function(btn) {
        btn.classList.remove('selected');
        if (btn.dataset.feeling === 'soft') btn.classList.add('selected');
    });
    
    document.querySelector('.nav-btn[data-view="feed"]').click();
});

function loadPosts() {
    allPosts = JSON.parse(localStorage.getItem('yugen_posts')) || [];
    var container = document.getElementById('posts-container');
    
    var filteredPosts = allPosts;
    if (currentFeedFilter === 'following') {
        filteredPosts = allPosts.filter(function(p) {
            return currentUser.following && currentUser.following.includes(p.userId);
        });
    }
    
    var html = '';
    
    for (var i = 0; i < filteredPosts.length; i++) {
        var p = filteredPosts[i];
        var tags = '';
        for (var j = 0; j < p.feelings.length; j++) {
            tags += '<span class="post-feeling-tag">' + p.feelings[j] + '</span>';
        }
        
        var timeAgo = getTimeAgo(new Date(p.createdAt));
        var isFollowing = currentUser.following && currentUser.following.includes(p.userId);
        var isOwnPost = p.userId === currentUser.id;
        
        html += '<article class="post-card">' +
            '<div class="post-header">' +
            '<div class="post-feelings">' + tags + '</div>' +
            '<div class="post-meta">' +
            '<span>' + p.author + '</span>' +
            '<span>' + timeAgo + '</span>' +
            '</div>';
        
        if (!isOwnPost) {
            html += '<button class="follow-btn' + (isFollowing ? ' following' : '') + '" onclick="toggleFollow(\'' + p.userId + '\')">' +
                (isFollowing ? 'Following' : '+ Follow') +
                '</button>';
        } else {
            html += '<button class="delete-post-btn" onclick="deletePost(\'' + p.id + '\')" title="Delete post">' +
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                '<polyline points="3 6 5 6 21 6"></polyline>' +
                '<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>' +
                '<line x1="10" y1="11" x2="10" y2="17"></line>' +
                '<line x1="14" y1="11" x2="14" y2="17"></line>' +
                '</svg>' +
                '</button>';
        }
        
        html += '</div>' +
            '<div class="post-image-container"><div class="post-image"><img src="' + p.media + '" alt="moment"></div></div>' +
            '<div class="post-content"><p class="post-text">' + p.entry + '</p>' +
            '<span class="post-location">' + p.location + '</span></div>' +
            '<div class="post-footer">' +
            '<button class="empathy-btn" onclick="handleEmpathy(\'' + p.id + '\',\'feel\')">' +
            '<svg class="empathy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>' +
            '<span>' + p.empathy.feel + '</span><span class="empathy-label">I feel this too</span></button>' +
            '<button class="empathy-btn" onclick="handleEmpathy(\'' + p.id + '\',\'softened\')">' +
            '<svg class="empathy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path><line x1="16" y1="8" x2="2" y2="22"></line><line x1="17.5" y1="15" x2="9" y2="15"></line></svg>' +
            '<span>' + p.empathy.softened + '</span><span class="empathy-label">This softened me</span></button>' +
            '<button class="comment-toggle-btn" onclick="toggleComments(\'' + p.id + '\')">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>' +
            '<span>' + (p.comments ? p.comments.length : 0) + '</span></button>' +
            '</div>';
        
        html += '<div class="comments-section" id="comments-' + p.id + '" style="display:none">' +
            '<div class="comments-list" id="comments-list-' + p.id + '">';
        
        if (p.comments && p.comments.length > 0) {
            for (var k = 0; k < p.comments.length; k++) {
                var c = p.comments[k];
                html += '<div class="comment">' +
                    '<div class="comment-avatar">' + c.author.charAt(0).toUpperCase() + '</div>' +
                    '<div class="comment-content">' +
                    '<div class="comment-header"><strong>' + c.author + '</strong><span>' + getTimeAgo(new Date(c.createdAt)) + '</span></div>' +
                    '<p>' + c.text + '</p>' +
                    '</div></div>';
            }
        }
        
        html += '</div>' +
            '<div class="comment-input-area">' +
            '<input type="text" class="comment-input" id="comment-input-' + p.id + '" placeholder="Share a gentle thought...">' +
            '<button class="comment-send-btn" onclick="addComment(\'' + p.id + '\')">Send</button>' +
            '</div></div>';
        
        html += '</article>';
    }
    
    container.innerHTML = html || '<p style="text-align:center;color:#8B7355;padding:40px;font-style:italic">No posts yet. Be the first to share! 🕊️</p>';
}

function toggleFollow(userId) {
    if (!currentUser.following) currentUser.following = [];
    
    var index = currentUser.following.indexOf(userId);
    if (index > -1) {
        currentUser.following.splice(index, 1);
    } else {
        currentUser.following.push(userId);
    }
    
    var userIndex = allUsers.findIndex(function(u) { return u.id === currentUser.id; });
    if (userIndex !== -1) {
        allUsers[userIndex].following = currentUser.following;
        localStorage.setItem('yugen_users', JSON.stringify(allUsers));
    }
    
    localStorage.setItem('yugen_current_user', JSON.stringify(currentUser));
    document.getElementById('following-count').textContent = currentUser.following.length;
    loadPosts();
}

function deletePost(postId) {
    if (confirm('Are you sure you want to delete this post? This cannot be undone.')) {
        var postIndex = allPosts.findIndex(function(p) { return p.id === postId; });
        if (postIndex !== -1) {
            allPosts.splice(postIndex, 1);
            localStorage.setItem('yugen_posts', JSON.stringify(allPosts));
            loadPosts();
            
            // Update post count in profile if on profile view
            var userPosts = allPosts.filter(function(p) { return p.userId === currentUser.id; });
            document.getElementById('posts-count').textContent = userPosts.length;
        }
    }
}

function toggleComments(postId) {
    var commentsSection = document.getElementById('comments-' + postId);
    if (commentsSection.style.display === 'none') {
        commentsSection.style.display = 'block';
    } else {
        commentsSection.style.display = 'none';
    }
}

function addComment(postId) {
    var input = document.getElementById('comment-input-' + postId);
    var text = input.value.trim();
    
    if (!text) return;
    
    if (containsHateSpeech(text)) {
        showWarning('Your comment contains inappropriate language. Please choose kinder words.');
        return;
    }
    
    var postIndex = allPosts.findIndex(function(p) { return p.id === postId; });
    if (postIndex !== -1) {
        if (!allPosts[postIndex].comments) allPosts[postIndex].comments = [];
        
        allPosts[postIndex].comments.push({
            id: Date.now().toString(),
            author: currentUser.name,
            text: text,
            createdAt: new Date().toISOString()
        });
        
        localStorage.setItem('yugen_posts', JSON.stringify(allPosts));
        input.value = '';
        loadPosts();
        
        setTimeout(function() {
            document.getElementById('comments-' + postId).style.display = 'block';
        }, 100);
    }
}

function getTimeAgo(date) {
    var seconds = Math.floor((new Date() - date) / 1000);
    var interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return interval + ' year' + (interval > 1 ? 's' : '') + ' ago';
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return interval + ' month' + (interval > 1 ? 's' : '') + ' ago';
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval + ' day' + (interval > 1 ? 's' : '') + ' ago';
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval + ' hour' + (interval > 1 ? 's' : '') + ' ago';
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval + ' minute' + (interval > 1 ? 's' : '') + ' ago';
    return 'just now';
}

function handleEmpathy(id, type) {
    var idx = allPosts.findIndex(function(p) { return p.id === id; });
    if (idx !== -1) {
        allPosts[idx].empathy[type]++;
        localStorage.setItem('yugen_posts', JSON.stringify(allPosts));
        loadPosts();
    }
}

function loadFriends() {
    var friends = allUsers.filter(function(u) { return u.id !== currentUser.id; });
    var html = '';
    for (var i = 0; i < friends.length; i++) {
        var f = friends[i];
        var isFollowing = currentUser.following && currentUser.following.includes(f.id);
        
        html += '<div class="friend-card">' +
            '<div class="friend-avatar">' + f.name.charAt(0).toUpperCase() + '</div>' +
            '<div class="friend-info"><h4>' + f.name + '</h4><p>@' + f.username + '</p></div>' +
            '<div class="friend-actions">' +
            '<button class="friend-action-btn' + (isFollowing ? ' following' : '') + '" onclick="toggleFollow(\'' + f.id + '\')">' +
            (isFollowing ? 'Following' : 'Follow') +
            '</button>' +
            '<button class="friend-action-btn message-btn" onclick="openChat(\'' + f.id + '\',\'' + f.name.replace(/'/g, "\\'") + '\')">Message</button>' +
            '</div></div>';
    }
    document.getElementById('friends-list').innerHTML = html || '<p style="text-align:center;padding:40px;color:#8B7355;font-style:italic">No other users yet. Invite friends to join! 🌸</p>';
    document.getElementById('friends-count').textContent = friends.length;
}

function loadChats() {
    conversations = JSON.parse(localStorage.getItem('yugen_conversations')) || [];
    var html = '';
    for (var i = 0; i < conversations.length; i++) {
        var c = conversations[i];
        var lastMsg = c.messages.length > 0 ? c.messages[c.messages.length-1].text : 'Start chatting';
        html += '<div class="chat-item" onclick="openChat(\'' + c.userId + '\',\'' + c.userName.replace(/'/g, "\\'") + '\')">' +
            '<div class="chat-avatar">' + c.userName.charAt(0).toUpperCase() + '</div>' +
            '<div class="chat-info"><h4>' + c.userName + '</h4><p>' + lastMsg.substring(0, 30) + (lastMsg.length > 30 ? '...' : '') + '</p></div></div>';
    }
    document.getElementById('chat-list').innerHTML = html || '<p style="text-align:center;padding:20px;color:#8B7355;font-size:14px;font-style:italic">No conversations yet 💬</p>';
}

function openChat(userId, userName) {
    document.querySelector('.nav-btn[data-view="chat"]').click();
    
    var conv = conversations.find(function(c) { return c.userId === userId; });
    if (!conv) {
        conv = { userId: userId, userName: userName, messages: [] };
        conversations.push(conv);
    }
    
    var html = '<div class="chat-header"><div class="chat-avatar">' + userName.charAt(0).toUpperCase() + '</div><h3>' + userName + '</h3></div>' +
        '<div class="chat-messages" id="chat-messages">';
    
    for (var i = 0; i < conv.messages.length; i++) {
        var m = conv.messages[i];
        html += '<div class="message ' + m.sender + '"><p>' + m.text + '</p><span class="message-time">' + m.time + '</span></div>';
    }
    
    if (conv.messages.length === 0) {
        html += '<p style="text-align:center;color:#8B7355;padding:40px;font-style:italic">Start a gentle conversation...</p>';
    }
    
    html += '</div><div class="chat-input-area">' +
        '<input type="text" id="chat-input" placeholder="Type a gentle message..." class="chat-input">' +
        '<button onclick="sendMsg(\'' + userId + '\')" class="send-btn">Send</button></div>';
    
    document.getElementById('chat-main').innerHTML = html;
    
    var chatMessages = document.getElementById('chat-messages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMsg(userId) {
    var input = document.getElementById('chat-input');
    var text = input.value.trim();
    if (!text) return;
    
    if (containsHateSpeech(text)) {
        showWarning('Your message contains inappropriate language or hate speech. Please choose kinder words for this conversation.');
        return;
    }
    
    var conv = conversations.find(function(c) { return c.userId === userId; });
    conv.messages.push({ sender: 'me', text: text, time: 'just now' });
    localStorage.setItem('yugen_conversations', JSON.stringify(conversations));
    
    input.value = '';
    openChat(userId, conv.userName);
    loadChats();
}