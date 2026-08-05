/**
 * Google Cloud Tech Summit 2026 - Main Front-End JavaScript Engine
 */

document.addEventListener('DOMContentLoaded', () => {
    // Global State
    let currentCategory = 'all';
    let currentQuery = '';
    let bookmarkedTalks = JSON.parse(localStorage.getItem('gcp_summit_bookmarks') || '[]');

    // DOM Elements
    const searchInput = document.getElementById('search-input');
    const clearSearchBtn = document.getElementById('clear-search-btn');
    const categoryPills = document.querySelectorAll('.category-pill');
    const visibleCountSpan = document.getElementById('visible-talk-count');
    const timetableContainer = document.getElementById('timetable-container');
    const allCards = document.querySelectorAll('.schedule-card');
    const noResultsState = document.getElementById('no-results-state');
    const resetFiltersBtn = document.getElementById('reset-filters-btn');

    // View Toggle Elements
    const viewTimelineBtn = document.getElementById('view-timeline-btn');
    const viewCardsBtn = document.getElementById('view-cards-btn');

    // Modal Elements
    const talkModalOverlay = document.getElementById('talk-modal-overlay');
    const closeTalkModalBtn = document.getElementById('close-talk-modal-btn');
    const modalCategory = document.getElementById('modal-talk-category');
    const modalTime = document.getElementById('modal-talk-time');
    const modalTitle = document.getElementById('modal-talk-title');
    const modalDescription = document.getElementById('modal-talk-description');
    const modalSpeakersList = document.getElementById('modal-speakers-list');
    const modalBookmarkBtn = document.getElementById('modal-bookmark-btn');
    const modalIcsBtn = document.getElementById('modal-ics-btn');

    // Drawer & Bookmarks
    const bookmarkCountBadge = document.getElementById('bookmark-count');
    const openBookmarksBtn = document.getElementById('open-bookmarks-btn');
    const bookmarksDrawerOverlay = document.getElementById('bookmarks-drawer-overlay');
    const closeDrawerBtn = document.getElementById('close-drawer-btn');
    const bookmarkedSessionsList = document.getElementById('bookmarked-sessions-list');
    const clearAllBookmarksBtn = document.getElementById('clear-all-bookmarks-btn');

    // Speaker Showcase Elements
    const speakerSearchInput = document.getElementById('speaker-search-input');
    const speakerCards = document.querySelectorAll('.speaker-card');

    // Export Calendar Buttons
    const exportFullIcsBtn = document.getElementById('export-full-ics-btn');

    let activeModalTalkId = null;

    // --- 1. SEARCH & FILTER ENGINE ---
    function applyFilters() {
        const query = currentQuery.trim().toLowerCase();
        let visibleTalkCount = 0;

        allCards.forEach(card => {
            const isLunch = card.classList.contains('lunch-break-card');

            if (isLunch) {
                // Keep lunch break visible on 'all' or when no query is typed
                if ((currentCategory === 'all' || currentCategory === 'lunch-break') && !query) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
                return;
            }

            // Check Category Match
            const cardCategory = card.getAttribute('data-category');
            const cardCategoryFull = card.getAttribute('data-category-full') || '';
            let categoryMatch = false;

            if (currentCategory === 'all') {
                categoryMatch = true;
            } else if (currentCategory === 'cat1') {
                categoryMatch = cardCategoryFull.includes('category 1');
            } else if (currentCategory === 'cat2') {
                categoryMatch = cardCategoryFull.includes('category 2');
            } else {
                categoryMatch = cardCategory === currentCategory || cardCategoryFull.includes(currentCategory);
            }

            // Check Search Query Match (Title, Description, Category, Speaker First/Last name)
            const title = card.getAttribute('data-title') || '';
            const speakers = card.getAttribute('data-speakers') || '';
            const desc = card.querySelector('.talk-description')?.textContent.toLowerCase() || '';

            let queryMatch = true;
            if (query) {
                queryMatch = title.includes(query) || speakers.includes(query) || desc.includes(query) || cardCategoryFull.includes(query);
            }

            if (categoryMatch && queryMatch) {
                card.style.display = 'flex';
                visibleTalkCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // Update Counter
        if (visibleCountSpan) {
            visibleCountSpan.textContent = visibleTalkCount;
        }

        // Handle Empty State
        if (visibleTalkCount === 0 && (query || currentCategory !== 'all')) {
            noResultsState.style.display = 'block';
            timetableContainer.style.display = 'none';
        } else {
            noResultsState.style.display = 'none';
            timetableContainer.style.display = timetableContainer.classList.contains('cards-view') ? 'grid' : 'flex';
        }
    }

    // Input Event Listener for Search
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentQuery = e.target.value;
            clearSearchBtn.style.display = currentQuery ? 'block' : 'none';
            applyFilters();
        });
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            currentQuery = '';
            clearSearchBtn.style.display = 'none';
            applyFilters();
            searchInput.focus();
        });
    }

    // Category Pill Event Listeners
    categoryPills.forEach(pill => {
        pill.addEventListener('click', () => {
            categoryPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentCategory = pill.getAttribute('data-category');
            applyFilters();
        });
    });

    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            currentQuery = '';
            currentCategory = 'all';
            if (searchInput) searchInput.value = '';
            if (clearSearchBtn) clearSearchBtn.style.display = 'none';
            categoryPills.forEach(p => p.classList.remove('active'));
            document.querySelector('.category-pill[data-category="all"]')?.classList.add('active');
            applyFilters();
        });
    }

    // --- 2. VIEW TOGGLE (Timeline vs Cards) ---
    if (viewTimelineBtn && viewCardsBtn) {
        viewTimelineBtn.addEventListener('click', () => {
            viewTimelineBtn.classList.add('active');
            viewCardsBtn.classList.remove('active');
            timetableContainer.classList.remove('cards-view');
            timetableContainer.classList.add('timeline-view');
            applyFilters();
        });

        viewCardsBtn.addEventListener('click', () => {
            viewCardsBtn.classList.add('active');
            viewTimelineBtn.classList.remove('active');
            timetableContainer.classList.remove('timeline-view');
            timetableContainer.classList.add('cards-view');
            applyFilters();
        });
    }

    // --- 3. TALK DETAIL MODAL ---
    function openTalkModal(talkId) {
        const talk = window.CONF_DATA.schedule.find(t => t.id === talkId);
        if (!talk || talk.type === 'break') return;

        activeModalTalkId = talkId;
        modalCategory.textContent = talk.category;
        modalCategory.className = `category-tag tag-${talk.category_id}`;
        modalTime.textContent = `${talk.time} (${talk.duration})`;
        modalTitle.textContent = talk.title;
        modalDescription.textContent = talk.description;

        // Render Speakers
        modalSpeakersList.innerHTML = talk.speakers.map(spk => `
            <div class="speaker-pill" style="width: 100%; padding: 0.75rem;">
                <div class="speaker-avatar" style="background-color: ${spk.avatar_color}; width: 42px; height: 42px; font-size: 1rem;">
                    ${spk.avatar_initials}
                </div>
                <div class="speaker-info" style="flex: 1;">
                    <span class="speaker-name" style="font-size: 1rem;">${spk.full_name}</span>
                    <span class="speaker-role" style="font-size: 0.85rem;">${spk.role}, ${spk.company}</span>
                    <p style="font-size: 0.8rem; color: #94a3b8; margin-top: 0.25rem;">${spk.bio}</p>
                </div>
                <a href="${spk.linkedin_url}" target="_blank" rel="noopener noreferrer" class="btn btn-linkedin btn-sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                    </svg>
                    LinkedIn Profile
                </a>
            </div>
        `).join('');

        // Update Bookmark Button state in Modal
        updateModalBookmarkState();

        talkModalOverlay.classList.add('active');
        talkModalOverlay.setAttribute('aria-hidden', 'false');
    }

    function closeTalkModal() {
        talkModalOverlay.classList.remove('active');
        talkModalOverlay.setAttribute('aria-hidden', 'true');
        activeModalTalkId = null;
    }

    document.querySelectorAll('.view-talk-detail-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const talkId = e.currentTarget.getAttribute('data-id');
            openTalkModal(talkId);
        });
    });

    if (closeTalkModalBtn) closeTalkModalBtn.addEventListener('click', closeTalkModal);
    if (talkModalOverlay) {
        talkModalOverlay.addEventListener('click', (e) => {
            if (e.target === talkModalOverlay) closeTalkModal();
        });
    }

    // --- 4. BOOKMARKING SYSTEM ---
    function updateBookmarkBadges() {
        const count = bookmarkedTalks.length;
        if (bookmarkCountBadge) bookmarkCountBadge.textContent = count;

        // Update all bookmark icon states
        document.querySelectorAll('.bookmark-btn').forEach(btn => {
            const id = btn.getAttribute('data-id');
            if (bookmarkedTalks.includes(id)) {
                btn.classList.add('bookmarked');
            } else {
                btn.classList.remove('bookmarked');
            }
        });

        // Save to localStorage
        localStorage.setItem('gcp_summit_bookmarks', JSON.stringify(bookmarkedTalks));
        renderBookmarkedDrawerItems();
    }

    function toggleBookmark(talkId) {
        const index = bookmarkedTalks.indexOf(talkId);
        if (index > -1) {
            bookmarkedTalks.splice(index, 1);
        } else {
            bookmarkedTalks.push(talkId);
        }
        updateBookmarkBadges();
        updateModalBookmarkState();
    }

    function updateModalBookmarkState() {
        if (!activeModalTalkId || !modalBookmarkBtn) return;
        if (bookmarkedTalks.includes(activeModalTalkId)) {
            modalBookmarkBtn.textContent = 'Remove Bookmark';
            modalBookmarkBtn.className = 'btn btn-secondary';
        } else {
            modalBookmarkBtn.textContent = 'Bookmark Session';
            modalBookmarkBtn.className = 'btn btn-primary';
        }
    }

    document.querySelectorAll('.bookmark-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            toggleBookmark(id);
        });
    });

    if (modalBookmarkBtn) {
        modalBookmarkBtn.addEventListener('click', () => {
            if (activeModalTalkId) {
                toggleBookmark(activeModalTalkId);
            }
        });
    }

    // --- 5. BOOKMARKS DRAWER ---
    function renderBookmarkedDrawerItems() {
        if (!bookmarkedSessionsList) return;

        if (bookmarkedTalks.length === 0) {
            bookmarkedSessionsList.innerHTML = `
                <div style="text-align: center; padding: 2rem 0; color: #94a3b8;">
                    <p>No sessions bookmarked yet.</p>
                    <p style="font-size: 0.8rem; margin-top: 0.5rem;">Click the bookmark icon on any talk to add it to your custom schedule.</p>
                </div>
            `;
            return;
        }

        const bookmarkedItems = window.CONF_DATA.schedule.filter(t => bookmarkedTalks.includes(t.id));
        
        bookmarkedSessionsList.innerHTML = bookmarkedItems.map(item => `
            <div class="drawer-session-item">
                <span class="drawer-session-time">${item.time}</span>
                <h4 class="drawer-session-title">${item.title}</h4>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
                    <span class="category-tag tag-${item.category_id}">${item.category}</span>
                    <button class="btn btn-outline btn-sm remove-bookmark-drawer-btn" data-id="${item.id}" style="color: #ea4335; border-color: rgba(234,67,53,0.3);">Remove</button>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.remove-bookmark-drawer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                toggleBookmark(id);
            });
        });
    }

    if (openBookmarksBtn) {
        openBookmarksBtn.addEventListener('click', () => {
            renderBookmarkedDrawerItems();
            bookmarksDrawerOverlay.classList.add('active');
            bookmarksDrawerOverlay.setAttribute('aria-hidden', 'false');
        });
    }

    if (closeDrawerBtn) {
        closeDrawerBtn.addEventListener('click', () => {
            bookmarksDrawerOverlay.classList.remove('active');
            bookmarksDrawerOverlay.setAttribute('aria-hidden', 'true');
        });
    }

    if (clearAllBookmarksBtn) {
        clearAllBookmarksBtn.addEventListener('click', () => {
            bookmarkedTalks = [];
            updateBookmarkBadges();
        });
    }

    // --- 6. SPEAKER SEARCH ENGINE ---
    if (speakerSearchInput) {
        speakerSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim().toLowerCase();
            speakerCards.forEach(card => {
                const name = card.getAttribute('data-speaker-name') || '';
                const text = card.textContent.toLowerCase();
                if (!query || name.includes(query) || text.includes(query)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // --- 7. COUNTDOWN TIMER ---
    function initCountdownTimer() {
        const confIsoDate = window.CONF_DATA.conference.iso_date || "2026-10-22";
        const targetDate = new Date(`${confIsoDate}T09:00:00`).getTime();

        const daysSpan = document.getElementById('cd-days');
        const hoursSpan = document.getElementById('cd-hours');
        const minsSpan = document.getElementById('cd-mins');
        const secsSpan = document.getElementById('cd-secs');

        function updateTimer() {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                if (daysSpan) daysSpan.textContent = "00";
                if (hoursSpan) hoursSpan.textContent = "00";
                if (minsSpan) minsSpan.textContent = "00";
                if (secsSpan) secsSpan.textContent = "00";
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            if (daysSpan) daysSpan.textContent = days < 10 ? `0${days}` : days;
            if (hoursSpan) hoursSpan.textContent = hours < 10 ? `0${hours}` : hours;
            if (minsSpan) minsSpan.textContent = minutes < 10 ? `0${minutes}` : minutes;
            if (secsSpan) secsSpan.textContent = seconds < 10 ? `0${seconds}` : seconds;
        }

        updateTimer();
        setInterval(updateTimer, 1000);
    }

    initCountdownTimer();

    // --- 8. CALENDAR .ICS EXPORT GENERATOR ---
    function downloadIcsFile(filename, content) {
        const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function generateFullConferenceIcs() {
        const conf = window.CONF_DATA.conference;
        const icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Google Cloud Tech Summit//NONSGML v1.0//EN',
            'BEGIN:VEVENT',
            'SUMMARY:' + conf.title,
            'DESCRIPTION:' + conf.description,
            'LOCATION:' + conf.location,
            'DTSTART:20261022T090000Z',
            'DTEND:20261022T170000Z',
            'STATUS:CONFIRMED',
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\r\n');

        downloadIcsFile('GCP_Tech_Summit_2026.ics', icsContent);
    }

    if (exportFullIcsBtn) {
        exportFullIcsBtn.addEventListener('click', generateFullConferenceIcs);
    }

    if (modalIcsBtn) {
        modalIcsBtn.addEventListener('click', () => {
            if (!activeModalTalkId) return;
            const talk = window.CONF_DATA.schedule.find(t => t.id === activeModalTalkId);
            if (!talk) return;

            const icsContent = [
                'BEGIN:VCALENDAR',
                'VERSION:2.0',
                'PRODID:-//Google Cloud Tech Summit//NONSGML v1.0//EN',
                'BEGIN:VEVENT',
                'SUMMARY:' + talk.title,
                'DESCRIPTION:' + talk.description + '\\nSpeakers: ' + talk.speakers.map(s => s.full_name).join(', '),
                'LOCATION:Google Developer Center, San Francisco, CA',
                'DTSTART:20261022T090000Z',
                'DTEND:20261022T100000Z',
                'END:VEVENT',
                'END:VCALENDAR'
            ].join('\r\n');

            downloadIcsFile(`${talk.id}_schedule.ics`, icsContent);
        });
    }

    // Initial state load
    updateBookmarkBadges();
});
