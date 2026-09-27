/**
 * ====================================================================
 * writter.app (2026) - Logika Interaktif Frontend (Vanilla JavaScript)
 * Microblogging Teks Murni & Autentikasi Pengguna Nyata
 * File: script.js
 * ====================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------------------------------
   * 1. Kunci Penyimpanan & Data Awal (Mock Data 2008 & Users)
   * ------------------------------------------------------------------ */
  const STORAGE_USERS = 'writter_app_users_v2026';
  const STORAGE_SESSION = 'writter_app_session_v2026';
  const STORAGE_TWEETS = 'writter_app_tweets_v2026';

  const DEFAULT_AVATARS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=faces'
  ];

  const SEED_USERS = [
    {
      id: 'u-alex',
      name: 'Alex Rivera',
      username: 'alex',
      email: 'alex@writter.app',
      password: 'password',
      avatar: DEFAULT_AVATARS[0],
      bio: 'Software engineer & minimalist web advocate. Building tools that feel like 2008.',
      location: 'San Francisco, CA',
      joinedDate: 'Joined March 2008',
      following: ['u-maya', 'u-sam'],
      followers: ['u-maya', 'u-leo', 'u-sam']
    },
    {
      id: 'u-maya',
      name: 'Maya Lin',
      username: 'maya',
      email: 'maya@writter.app',
      password: 'password',
      avatar: DEFAULT_AVATARS[1],
      bio: 'Designer, coffee nerd, typography enthusiast.',
      location: 'Oakland, CA',
      joinedDate: 'Joined April 2008',
      following: ['u-alex', 'u-leo'],
      followers: ['u-alex']
    },
    {
      id: 'u-sam',
      name: 'Sam Vance',
      username: 'sam',
      email: 'sam@writter.app',
      password: 'password',
      avatar: DEFAULT_AVATARS[2],
      bio: 'Street tacos & photography. Living life 140 characters at a time.',
      location: 'Mission District, SF',
      joinedDate: 'Joined June 2008',
      following: ['u-alex'],
      followers: ['u-alex']
    },
    {
      id: 'u-leo',
      name: 'Leo Sterling',
      username: 'leo',
      email: 'leo@writter.app',
      password: 'password',
      avatar: DEFAULT_AVATARS[3],
      bio: 'Ruby on Rails hacker. IRC regular.',
      location: 'Berkeley, CA',
      joinedDate: 'Joined July 2008',
      following: ['u-alex', 'u-maya'],
      followers: ['u-maya']
    }
  ];

  const SEED_TWEETS = [
    {
      id: 'tw-1',
      userId: 'u-alex',
      name: 'Alex Rivera',
      username: 'alex',
      avatar: DEFAULT_AVATARS[0],
      content: 'welcome to writter.app! A real community for 140 character thoughts without the algorithmic noise.',
      timestamp: '2 minutes ago',
      source: 'web',
      favorites: ['u-maya', 'u-sam']
    },
    {
      id: 'tw-2',
      userId: 'u-maya',
      name: 'Maya Lin',
      username: 'maya',
      avatar: DEFAULT_AVATARS[1],
      content: 'sipping pour-over coffee at Blue Bottle. trying to get my head around this microblogging concept. #minimalism',
      timestamp: '14 minutes ago',
      source: 'iPhone 16 Pro',
      favorites: ['u-alex']
    },
    {
      id: 'tw-3',
      userId: 'u-sam',
      name: 'Sam Vance',
      username: 'sam',
      avatar: DEFAULT_AVATARS[2],
      content: 'eating tacos in the Mission. send text to 40404 to subscribe to my updates on the go.',
      timestamp: '42 minutes ago',
      source: 'SMS',
      favorites: ['u-alex', 'u-maya', 'u-leo']
    },
    {
      id: 'tw-4',
      userId: 'u-leo',
      name: 'Leo Sterling',
      username: 'leo',
      avatar: DEFAULT_AVATARS[3],
      content: 'writing a ruby script to sync writter status with my AIM away message. 2007 is wild.',
      timestamp: 'about 2 hours ago',
      source: 'Google Pixel 8',
      favorites: ['u-alex']
    }
  ];

  // Muat data dari localStorage
  let users = (() => {
    try {
      const saved = localStorage.getItem(STORAGE_USERS);
      return saved ? JSON.parse(saved) : SEED_USERS;
    } catch (e) {
      return SEED_USERS;
    }
  })();

  let currentUserId = (() => {
    try {
      return localStorage.getItem(STORAGE_SESSION) || null; // null jika pengunjung baru
    } catch (e) {
      return null;
    }
  })();

  let tweets = (() => {
    try {
      const saved = localStorage.getItem(STORAGE_TWEETS);
      return saved ? JSON.parse(saved) : SEED_TWEETS;
    } catch (e) {
      return SEED_TWEETS;
    }
  })();

  let activeTab = 'home';        // 'home' | 'profile' | 'favorites' | 'people'
  let activeTrend = null;
  let selectedAvatarUrl = DEFAULT_AVATARS[0];

  /* ------------------------------------------------------------------
   * 2. Selektor Elemen DOM
   * ------------------------------------------------------------------ */
  const flashNotice = document.getElementById('flash-notice');
  const guestBanner = document.getElementById('guest-banner');
  const mainNav = document.getElementById('main-nav');
  const navUserSection = document.getElementById('nav-user-section');
  const authButtonsContainer = document.getElementById('auth-buttons-container');

  const navHome = document.getElementById('nav-home');
  const navProfile = document.getElementById('nav-profile');
  const navFavorites = document.getElementById('nav-favorites');
  const navPeople = document.getElementById('nav-people');
  const navFavCount = document.getElementById('nav-fav-count');

  const viewTimeline = document.getElementById('view-timeline');
  const viewPeople = document.getElementById('view-people');
  const peopleList = document.getElementById('people-list');
  const peopleCount = document.getElementById('people-count');

  const composerAuthWrap = document.getElementById('composer-auth-wrap');
  const composerGuestWrap = document.getElementById('composer-guest-wrap');
  const composerUsername = document.getElementById('composer-username');
  const tweetForm = document.getElementById('tweet-form');
  const tweetInput = document.getElementById('tweet-input');
  const charCounter = document.getElementById('char-counter');
  const btnUpdate = document.getElementById('btn-update');
  const deviceSelect = document.getElementById('device-select');

  const timelineStream = document.getElementById('timeline-stream');
  const timelineTitle = document.getElementById('timeline-title');
  const timelineCount = document.getElementById('timeline-count');
  const filterBanner = document.getElementById('filter-banner');
  const filterKeyword = document.getElementById('filter-keyword');
  const btnClearFilter = document.getElementById('btn-clear-filter');

  const sidebarUserBox = document.getElementById('sidebar-user-box');
  const sidebarGuestBox = document.getElementById('sidebar-guest-box');
  const sidebarUserAvatar = document.getElementById('sidebar-user-avatar');
  const sidebarUserName = document.getElementById('sidebar-user-name');
  const sidebarUserHandle = document.getElementById('sidebar-user-handle');
  const sidebarUserBio = document.getElementById('sidebar-user-bio');
  const statTweetCount = document.getElementById('stat-tweet-count');
  const statFollowingCount = document.getElementById('stat-following-count');
  const statFollowersCount = document.getElementById('stat-followers-count');
  const statFavCount = document.getElementById('stat-fav-count');
  const linkFavShortcut = document.getElementById('link-fav-shortcut');

  const detectedHardwareText = document.getElementById('detected-hardware-text');
  const currentDeviceDisplay = document.getElementById('current-device-display');
  const communityAvatars = document.getElementById('community-avatars');
  const linkViewAllPeople = document.getElementById('link-view-all-people');
  const btnResetDemo = document.getElementById('btn-reset-demo');

  // Modals
  const authModal = document.getElementById('auth-modal');
  const authModalTitle = document.getElementById('auth-modal-title');
  const authModalSubtitle = document.getElementById('auth-modal-subtitle');
  const btnCloseAuthModal = document.getElementById('btn-close-auth-modal');
  const tabBtnLogin = document.getElementById('tab-btn-login');
  const tabBtnSignup = document.getElementById('tab-btn-signup');
  const authErrorBox = document.getElementById('auth-error-box');
  const formLogin = document.getElementById('form-login');
  const formSignup = document.getElementById('form-signup');
  const loginUsername = document.getElementById('login-username');
  const loginPassword = document.getElementById('login-password');
  const signupName = document.getElementById('signup-name');
  const signupUsername = document.getElementById('signup-username');
  const signupEmail = document.getElementById('signup-email');
  const signupPassword = document.getElementById('signup-password');
  const signupBio = document.getElementById('signup-bio');
  const avatarChoicesContainer = document.getElementById('avatar-choices');

  const downloadModal = document.getElementById('download-modal');
  const btnOpenDownload = document.getElementById('btn-open-download');
  const btnCloseDownloadModal = document.getElementById('btn-close-download-modal');

  /* ------------------------------------------------------------------
   * 3. Utilitas: Web Audio API & Notifikasi
   * ------------------------------------------------------------------ */
  function playSound(type) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      if (type === 'send') {
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      } else if (type === 'fav') {
        osc.frequency.setValueAtTime(659.25, now);
        osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.09);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }

  let noticeTimer = null;
  function showNotice(msg) {
    if (!flashNotice) return;
    clearTimeout(noticeTimer);
    flashNotice.textContent = msg;
    flashNotice.classList.remove('hidden');
    noticeTimer = setTimeout(() => {
      flashNotice.classList.add('hidden');
    }, 3200);
  }

  function getCurrentUser() {
    if (!currentUserId) return null;
    return users.find(u => u.id === currentUserId) || null;
  }

  function persistData() {
    try {
      localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
      localStorage.setItem(STORAGE_TWEETS, JSON.stringify(tweets));
      if (currentUserId) {
        localStorage.setItem(STORAGE_SESSION, currentUserId);
      } else {
        localStorage.removeItem(STORAGE_SESSION);
      }
    } catch (e) {}
  }

  /* ------------------------------------------------------------------
   * 4. Deteksi Hardware Ponsel Nyata
   * ------------------------------------------------------------------ */
  function detectHardware() {
    const ua = navigator.userAgent;
    const screenW = window.screen.width;
    const screenH = window.screen.height;
    const dpr = window.devicePixelRatio || 1;
    let detected = 'Desktop Web';

    if (/iPhone|iPad|iPod/i.test(ua)) {
      const pW = Math.min(screenW, screenH);
      const pH = Math.max(screenW, screenH);
      if ((pW === 440 && pH === 956) || (pW === 430 && pH === 932)) {
        detected = 'iPhone 16 Pro Max';
      } else if (pW === 393 && pH === 852) {
        detected = 'iPhone 16 Pro';
      } else if (pW === 390 && pH === 844) {
        detected = 'iPhone 15';
      } else if (pW === 375 && pH === 812 && dpr === 3) {
        detected = 'iPhone 13 mini';
      } else {
        detected = 'Apple iPhone';
      }
    } else if (/Android/i.test(ua)) {
      const pixelMatch = ua.match(/;\s*(Pixel[^;)]+?)(?:\s+Build|\))/i);
      const samsungMatch = ua.match(/(SM-[A-Z0-9]+)/i);

      if (pixelMatch && pixelMatch[1]) {
        detected = `Google ${pixelMatch[1]}`;
      } else if (samsungMatch && samsungMatch[1]) {
        detected = `Samsung Galaxy (${samsungMatch[1]})`;
      } else {
        detected = 'Android Device';
      }
    } else if (/Macintosh|Mac OS X/i.test(ua)) {
      detected = 'MacBook Pro';
    } else if (/Windows/i.test(ua)) {
      detected = 'Windows PC';
    }

    if (detectedHardwareText) {
      detectedHardwareText.textContent = `${detected} (${screenW}×${screenH})`;
    }

    if (deviceSelect) {
      const existing = Array.from(deviceSelect.options).find(o => o.value === detected);
      if (!existing) {
        const opt = document.createElement('option');
        opt.value = detected;
        opt.textContent = `${detected} (Detected)`;
        deviceSelect.insertBefore(opt, deviceSelect.firstChild);
        deviceSelect.value = detected;
      }
      currentDeviceDisplay.textContent = deviceSelect.value;
    }
  }

  /* ------------------------------------------------------------------
   * 5. Navigasi & Tampilan Header
   * ------------------------------------------------------------------ */
  function updateNavState() {
    const user = getCurrentUser();

    if (user) {
      guestBanner.classList.add('hidden');
      navUserSection.classList.remove('hidden');
      composerAuthWrap.classList.remove('hidden');
      composerGuestWrap.classList.add('hidden');
      sidebarUserBox.classList.remove('hidden');
      sidebarGuestBox.classList.add('hidden');

      composerUsername.textContent = `@${user.username}`;
      sidebarUserAvatar.src = user.avatar;
      sidebarUserName.textContent = user.name;
      sidebarUserHandle.textContent = `@${user.username}`;
      sidebarUserBio.textContent = user.bio ? `"${user.bio}"` : '';

      const userTweetTotal = tweets.filter(t => t.userId === user.id).length;
      const userFavTotal = tweets.filter(t => t.favorites.includes(user.id)).length;

      statTweetCount.textContent = userTweetTotal;
      statFollowingCount.textContent = user.following.length;
      statFollowersCount.textContent = user.followers.length;
      statFavCount.textContent = userFavTotal;
      navFavCount.textContent = userFavTotal;

      authButtonsContainer.innerHTML = `
        <button type="button" id="btn-signout" class="nav-link font-medium">Sign Out</button>
      `;
      document.getElementById('btn-signout')?.addEventListener('click', handleSignOut);
    } else {
      guestBanner.classList.remove('hidden');
      navUserSection.classList.add('hidden');
      composerAuthWrap.classList.add('hidden');
      composerGuestWrap.classList.remove('hidden');
      sidebarUserBox.classList.add('hidden');
      sidebarGuestBox.classList.remove('hidden');

      authButtonsContainer.innerHTML = `
        <button type="button" id="btn-nav-login" class="nav-link font-bold">Sign In</button>
        <span class="nav-separator">/</span>
        <button type="button" id="btn-nav-signup" class="btn-primary-sm">Join writter.app</button>
      `;
      document.getElementById('btn-nav-login')?.addEventListener('click', () => openAuthModal('login'));
      document.getElementById('btn-nav-signup')?.addEventListener('click', () => openAuthModal('signup'));
    }

    // Perbarui avatar komunitas di sidebar
    communityAvatars.innerHTML = '';
    users.slice(0, 8).forEach(u => {
      const img = document.createElement('img');
      img.src = u.avatar;
      img.alt = u.name;
      img.title = `@${u.username} (${u.name})`;
      img.className = 'mini-avatar';
      communityAvatars.appendChild(img);
    });
  }

  /* ------------------------------------------------------------------
   * 6. Render Linimasa & Direktori Orang
   * ------------------------------------------------------------------ */
  function renderTimeline() {
    const user = getCurrentUser();
    let filtered = [...tweets];

    if (activeTab === 'profile') {
      if (!user) {
        openAuthModal('login');
        return;
      }
      filtered = filtered.filter(t => t.userId === user.id);
      timelineTitle.textContent = `Status Milik @${user.username}`;
    } else if (activeTab === 'favorites') {
      if (!user) {
        openAuthModal('login');
        return;
      }
      filtered = filtered.filter(t => t.favorites.includes(user.id));
      timelineTitle.textContent = 'Favorit Anda';
    } else {
      timelineTitle.textContent = 'Latest Updates';
    }

    if (activeTrend) {
      filtered = filtered.filter(t => t.content.toLowerCase().includes(activeTrend.toLowerCase()));
      filterBanner.classList.remove('hidden');
      filterKeyword.textContent = activeTrend;
    } else {
      filterBanner.classList.add('hidden');
    }

    timelineCount.textContent = `${filtered.length} ${filtered.length === 1 ? 'update' : 'updates'}`;
    timelineStream.innerHTML = '';

    if (filtered.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.style.padding = '36px 0';
      emptyDiv.style.textAlign = 'center';
      emptyDiv.style.color = 'var(--text-muted)';
      emptyDiv.textContent = activeTab === 'favorites'
        ? 'Belum ada status yang disukai. Klik "☆ favorite" pada status untuk menyimpannya.'
        : 'Belum ada status yang ditemukan.';
      timelineStream.appendChild(emptyDiv);
      return;
    }

    filtered.forEach(tw => {
      const isMine = user ? tw.userId === user.id : false;
      const isFavorited = user ? tw.favorites.includes(user.id) : false;
      const isFollowing = user ? user.following.includes(tw.userId) : false;

      const article = document.createElement('article');
      article.className = 'tweet-item';

      let followBtnHtml = '';
      if (!isMine && user) {
        followBtnHtml = `
          <button type="button" class="btn-follow-badge ${isFollowing ? 'following' : ''}" data-action="toggle-follow" data-author-id="${tw.userId}">
            ${isFollowing ? 'following' : '+ follow'}
          </button>
        `;
      }

      let deleteBtnHtml = '';
      if (isMine) {
        deleteBtnHtml = `
          <span class="meta-dot">&middot;</span>
          <button type="button" class="btn-meta delete-btn" data-action="delete" data-id="${tw.id}">delete</button>
        `;
      }

      article.innerHTML = `
        <img src="${tw.avatar}" alt="${tw.name}" class="tweet-avatar" />
        <div class="tweet-body">
          <p class="tweet-text">
            <strong class="tweet-author" data-action="reply" data-user="${tw.username}">${tw.username}</strong>
            ${followBtnHtml}
            <span>${tw.content}</span>
          </p>
          <div class="tweet-meta">
            <span>${tw.timestamp}</span>
            <span>from ${tw.source}</span>
            <span class="meta-dot">&middot;</span>
            <button type="button" class="btn-meta ${isFavorited ? 'favorited' : ''}" data-action="fav" data-id="${tw.id}">
              ${isFavorited ? '★ favorited' : '☆ favorite'} ${tw.favorites.length ? `(${tw.favorites.length})` : ''}
            </button>
            <span class="meta-dot">&middot;</span>
            <button type="button" class="btn-meta" data-action="reply" data-user="${tw.username}">reply</button>
            ${deleteBtnHtml}
          </div>
        </div>
      `;

      timelineStream.appendChild(article);
    });
  }

  function renderPeople() {
    const user = getCurrentUser();
    peopleCount.textContent = `${users.length} members`;
    peopleList.innerHTML = '';

    users.forEach(u => {
      const isMe = user?.id === u.id;
      const isFollowing = user ? user.following.includes(u.id) : false;

      const item = document.createElement('div');
      item.className = 'people-item';

      item.innerHTML = `
        <div class="people-user-col">
          <img src="${u.avatar}" alt="${u.name}" class="tweet-avatar" />
          <div class="people-info">
            <div class="people-name-row">
              <span class="people-name">${u.name}</span>
              <span class="people-handle">@${u.username}</span>
            </div>
            ${u.bio ? `<p class="people-bio">${u.bio}</p>` : ''}
            <div class="people-stats">
              <span>${u.followers.length} followers</span> &middot;
              <span>${u.following.length} following</span> &middot;
              <span>${u.joinedDate}</span>
            </div>
          </div>
        </div>

        <div>
          ${
            isMe
              ? '<span class="btn-download-tag">You</span>'
              : `<button type="button" class="btn-secondary-sm ${isFollowing ? 'following' : ''}" data-action="toggle-follow" data-author-id="${u.id}">
                  ${isFollowing ? 'Following' : '+ Follow'}
                </button>`
          }
        </div>
      `;

      peopleList.appendChild(item);
    });
  }

  function switchTab(newTab) {
    activeTab = newTab;
    activeTrend = null;

    [navHome, navProfile, navFavorites, navPeople].forEach(l => l?.classList.remove('active'));

    if (newTab === 'home') navHome?.classList.add('active');
    if (newTab === 'profile') navProfile?.classList.add('active');
    if (newTab === 'favorites') navFavorites?.classList.add('active');
    if (newTab === 'people') navPeople?.classList.add('active');

    if (newTab === 'people') {
      viewTimeline.classList.add('hidden');
      viewPeople.classList.remove('hidden');
      renderPeople();
    } else {
      viewTimeline.classList.remove('hidden');
      viewPeople.classList.add('hidden');
      renderTimeline();
    }

    updateNavState();
  }

  /* ------------------------------------------------------------------
   * 7. Penghitung Karakter 140 & Pengiriman Status
   * ------------------------------------------------------------------ */
  const MAX_CHARS = 140;

  function updateCharCounter() {
    const len = tweetInput.value.length;
    const remaining = MAX_CHARS - len;
    charCounter.textContent = remaining;

    charCounter.classList.remove('warning', 'danger');
    if (remaining < 0) {
      charCounter.classList.add('danger');
    } else if (remaining <= 20) {
      charCounter.classList.add('warning');
    }

    const isEmpty = tweetInput.value.trim().length === 0;
    const isOver = remaining < 0;
    btnUpdate.disabled = isEmpty || isOver;
  }

  tweetInput.addEventListener('input', updateCharCounter);

  tweetInput.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!btnUpdate.disabled) {
        tweetForm.dispatchEvent(new Event('submit'));
      }
    }
  });

  deviceSelect.addEventListener('change', () => {
    currentDeviceDisplay.textContent = deviceSelect.value;
  });

  tweetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) {
      openAuthModal('login');
      return;
    }

    const content = tweetInput.value.trim();
    if (!content || content.length > MAX_CHARS) return;

    playSound('send');

    const newTweet = {
      id: `tw-${Date.now()}`,
      userId: user.id,
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      content: content,
      timestamp: 'less than 20 seconds ago',
      source: deviceSelect.value,
      favorites: []
    };

    tweets.unshift(newTweet);
    tweetInput.value = '';
    updateCharCounter();
    persistData();
    renderTimeline();
    updateNavState();
    showNotice(`Status berhasil diperbarui dari ${newTweet.source}!`);
  });

  /* ------------------------------------------------------------------
   * 8. Event Delegation: Aksi Tweet (Favorite, Follow, Reply, Delete)
   * ------------------------------------------------------------------ */
  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) return;

    const action = target.getAttribute('data-action');
    const user = getCurrentUser();

    if (action === 'fav') {
      if (!user) {
        openAuthModal('login');
        return;
      }
      const tweetId = target.getAttribute('data-id');
      const tweet = tweets.find(t => t.id === tweetId);
      if (tweet) {
        const hasFav = tweet.favorites.includes(user.id);
        if (hasFav) {
          tweet.favorites = tweet.favorites.filter(id => id !== user.id);
        } else {
          tweet.favorites.push(user.id);
          playSound('fav');
        }
        persistData();
        renderTimeline();
        updateNavState();
      }
    } else if (action === 'toggle-follow') {
      if (!user) {
        openAuthModal('login');
        return;
      }
      const authorId = target.getAttribute('data-author-id');
      if (authorId === user.id) return;

      const isFollowing = user.following.includes(authorId);
      const targetUser = users.find(u => u.id === authorId);

      if (isFollowing) {
        user.following = user.following.filter(id => id !== authorId);
        if (targetUser) targetUser.followers = targetUser.followers.filter(id => id !== user.id);
        showNotice(`Berhenti mengikuti @${targetUser ? targetUser.username : ''}`);
      } else {
        user.following.push(authorId);
        if (targetUser) targetUser.followers.push(user.id);
        showNotice(`Sekarang mengikuti @${targetUser ? targetUser.username : ''}!`);
      }

      persistData();
      if (activeTab === 'people') renderPeople();
      else renderTimeline();
      updateNavState();
    } else if (action === 'reply') {
      const userToReply = target.getAttribute('data-user');
      if (!user) {
        openAuthModal('login');
        return;
      }
      tweetInput.value = `@${userToReply} ${tweetInput.value}`.trimStart();
      tweetInput.focus();
      updateCharCounter();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (action === 'delete') {
      const tweetId = target.getAttribute('data-id');
      if (window.confirm('Yakin ingin menghapus status ini?')) {
        tweets = tweets.filter(t => t.id !== tweetId);
        persistData();
        renderTimeline();
        updateNavState();
        showNotice('Status dihapus.');
      }
    }
  });

  /* ------------------------------------------------------------------
   * 9. Autentikasi Pengguna: Sign In, Sign Up, & Sign Out
   * ------------------------------------------------------------------ */
  function openAuthModal(mode) {
    authErrorBox.classList.add('hidden');
    authErrorBox.textContent = '';

    if (mode === 'signup') {
      tabBtnSignup.classList.add('active');
      tabBtnLogin.classList.remove('active');
      formSignup.classList.remove('hidden');
      formLogin.classList.add('hidden');
      authModalSubtitle.textContent = 'Daftarkan akun baru Anda di writter.app';
    } else {
      tabBtnLogin.classList.add('active');
      tabBtnSignup.classList.remove('active');
      formLogin.classList.remove('hidden');
      formSignup.classList.add('hidden');
      authModalSubtitle.textContent = 'Masuk ke akun writter.app Anda';
    }

    authModal.classList.remove('hidden');
  }

  function closeAuthModal() {
    authModal.classList.add('hidden');
  }

  tabBtnLogin.addEventListener('click', () => openAuthModal('login'));
  tabBtnSignup.addEventListener('click', () => openAuthModal('signup'));
  btnCloseAuthModal.addEventListener('click', closeAuthModal);

  // Render pilihan avatar pada form pendaftaran
  avatarChoicesContainer.innerHTML = '';
  DEFAULT_AVATARS.forEach((av, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `avatar-choice-btn ${idx === 0 ? 'selected' : ''}`;
    btn.innerHTML = `<img src="${av}" alt="Avatar ${idx}" class="avatar-choice-img" />`;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.avatar-choice-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedAvatarUrl = av;
    });
    avatarChoicesContainer.appendChild(btn);
  });

  // Handler Submit Login
  formLogin.addEventListener('submit', (e) => {
    e.preventDefault();
    authErrorBox.classList.add('hidden');

    const id = loginUsername.value.trim().toLowerCase().replace(/^@/, '');
    const pass = loginPassword.value;

    const user = users.find(u => (u.username.toLowerCase() === id || u.email.toLowerCase() === id) && u.password === pass);

    if (!user) {
      authErrorBox.textContent = 'Username/email atau kata sandi tidak cocok.';
      authErrorBox.classList.remove('hidden');
      return;
    }

    currentUserId = user.id;
    persistData();
    closeAuthModal();
    updateNavState();
    renderTimeline();
    showNotice(`Selamat datang kembali, @${user.username}!`);
  });

  // Handler Submit Sign Up
  formSignup.addEventListener('submit', (e) => {
    e.preventDefault();
    authErrorBox.classList.add('hidden');

    const name = signupName.value.trim();
    const uname = signupUsername.value.trim().toLowerCase().replace(/^@/, '');
    const email = signupEmail.value.trim().toLowerCase();
    const pass = signupPassword.value;
    const bio = signupBio.value.trim();

    if (!name || uname.length < 3 || !email.includes('@') || pass.length < 4) {
      authErrorBox.textContent = 'Harap periksa kembali isian form (username min 3 kar, pass min 4 kar).';
      authErrorBox.classList.remove('hidden');
      return;
    }

    const exists = users.find(u => u.username.toLowerCase() === uname || u.email.toLowerCase() === email);
    if (exists) {
      authErrorBox.textContent = exists.username.toLowerCase() === uname
        ? 'Username ini sudah digunakan. Silakan pilih username lain.'
        : 'Email ini sudah terdaftar. Silakan login.';
      authErrorBox.classList.remove('hidden');
      return;
    }

    const newUser = {
      id: `u-${Date.now()}`,
      name: name,
      username: uname,
      email: email,
      password: pass,
      avatar: selectedAvatarUrl,
      bio: bio,
      location: 'Indonesia',
      joinedDate: 'Joined September 2026',
      following: [],
      followers: []
    };

    users.unshift(newUser);
    currentUserId = newUser.id;
    persistData();
    closeAuthModal();
    updateNavState();
    renderTimeline();
    showNotice(`Akun @${newUser.username} berhasil dibuat! Selamat datang di writter.app.`);
  });

  // Uji Coba Cepat (Quick Demo Chips)
  document.querySelectorAll('[data-quick-user]').forEach(btn => {
    btn.addEventListener('click', () => {
      const uName = btn.getAttribute('data-quick-user');
      const u = users.find(x => x.username.toLowerCase() === uName);
      if (u) {
        currentUserId = u.id;
        persistData();
        closeAuthModal();
        updateNavState();
        renderTimeline();
        showNotice(`Masuk sebagai @${u.username}`);
      }
    });
  });

  function handleSignOut() {
    currentUserId = null;
    persistData();
    updateNavState();
    switchTab('home');
    showNotice('Anda telah keluar dari akun.');
  }

  // Tombol Sambutan Tamu
  document.getElementById('btn-banner-login')?.addEventListener('click', () => openAuthModal('login'));
  document.getElementById('btn-banner-signup')?.addEventListener('click', () => openAuthModal('signup'));
  document.getElementById('btn-prompt-login')?.addEventListener('click', () => openAuthModal('login'));
  document.getElementById('btn-prompt-signup')?.addEventListener('click', () => openAuthModal('signup'));
  document.getElementById('btn-side-login')?.addEventListener('click', () => openAuthModal('login'));
  document.getElementById('btn-side-signup')?.addEventListener('click', () => openAuthModal('signup'));

  /* ------------------------------------------------------------------
   * 10. Navigasi & Filter Tren
   * ------------------------------------------------------------------ */
  navHome.addEventListener('click', (e) => { e.preventDefault(); switchTab('home'); });
  navProfile?.addEventListener('click', (e) => { e.preventDefault(); switchTab('profile'); });
  navFavorites?.addEventListener('click', (e) => { e.preventDefault(); switchTab('favorites'); });
  navPeople.addEventListener('click', (e) => { e.preventDefault(); switchTab('people'); });
  linkFavShortcut?.addEventListener('click', (e) => { e.preventDefault(); switchTab('favorites'); });
  linkViewAllPeople.addEventListener('click', (e) => { e.preventDefault(); switchTab('people'); });

  document.getElementById('trends-list').addEventListener('click', (e) => {
    const link = e.target.closest('[data-trend]');
    if (!link) return;
    e.preventDefault();
    activeTrend = link.getAttribute('data-trend');
    switchTab('home');
  });

  btnClearFilter.addEventListener('click', () => {
    activeTrend = null;
    renderTimeline();
  });

  // Reset Demo
  btnResetDemo.addEventListener('click', () => {
    if (window.confirm('Reset semua data kembali ke default awal 2008?')) {
      users = [...SEED_USERS];
      tweets = [...SEED_TWEETS];
      currentUserId = 'u-alex';
      persistData();
      updateNavState();
      switchTab('home');
      showNotice('Data demo berhasil di-reset.');
    }
  });

  /* ------------------------------------------------------------------
   * 11. Modal Pengunduh Berkas (.TXT) untuk Netlify / Offline
   * ------------------------------------------------------------------ */
  btnOpenDownload.addEventListener('click', () => {
    downloadModal.classList.remove('hidden');
  });

  btnCloseDownloadModal.addEventListener('click', () => {
    downloadModal.classList.add('hidden');
  });

  function downloadTextFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotice(`Mengunduh ${filename}...`);
  }

  // Ambil konten file aktual dari dokumen atau script
  document.getElementById('btn-dl-html')?.addEventListener('click', () => {
    fetch('index.html')
      .then(res => res.text())
      .then(text => downloadTextFile('index.html.txt', text))
      .catch(() => downloadTextFile('index.html.txt', document.documentElement.outerHTML));
  });

  document.getElementById('btn-dl-css')?.addEventListener('click', () => {
    fetch('style.css')
      .then(res => res.text())
      .then(text => downloadTextFile('style.css.txt', text));
  });

  document.getElementById('btn-dl-js')?.addEventListener('click', () => {
    fetch('script.js')
      .then(res => res.text())
      .then(text => downloadTextFile('script.js.txt', text));
  });

  document.getElementById('btn-dl-all')?.addEventListener('click', () => {
    Promise.all([
      fetch('index.html').then(r => r.text()),
      fetch('style.css').then(r => r.text()),
      fetch('script.js').then(r => r.text())
    ]).then(([html, css, js]) => {
      const combined = `================================================================================
PROYEK writter.app (2026) - REPLIKA MICROBLOGGING TEKS MURNI 2008
Koleksi Lengkap 3 File: index.html, style.css, script.js
================================================================================

PETUNJUK UNGGAH KE NETLIFY:
1. Pisahkan ketiga bagian di bawah ini menjadi 3 file:
   - index.html
   - style.css
   - script.js
2. Masukkan ke dalam satu folder bernama "writter-app".
3. Buka https://app.netlify.com/drop lalu seret folder tersebut.
4. Situs sosial Anda langsung aktif secara publik dengan fitur registrasi & login!

================================================================================
BAGIAN 1: index.html
================================================================================
${html}

================================================================================
BAGIAN 2: style.css
================================================================================
${css}

================================================================================
BAGIAN 3: script.js
================================================================================
${js}
`;
      downloadTextFile('semua_kode_writter.txt', combined);
    });
  });

  /* ------------------------------------------------------------------
   * 12. Inisialisasi Aplikasi Saat Startup
   * ------------------------------------------------------------------ */
  detectHardware();
  updateCharCounter();
  updateNavState();
  renderTimeline();

});
