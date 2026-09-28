// --- Auth System & Premium Toggle Logic ---
function checkAuth() {
    const currentUser = localStorage.getItem('luxen_user');
    
    if (currentUser) {
        const isFounder = (currentUser === 'adminluxentech@gmail.com');
        const displayName = isFounder ? 'Founder Luxen Tech' : currentUser;

        if (isFounder) {
            document.body.classList.add('admin-mode');
        }

        const desktopDashboardBtn = isFounder ? `
            <a href="dashboard.html" class="dropdown-item" style="color: #10b981; text-decoration: none;">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                لوحة التحكم المباشرة
            </a>
            <button onclick="togglePremiumMode()" class="dropdown-item" style="color: #a855f7; border: none; background: transparent; font-family: inherit; font-size: 0.95rem; font-weight: 700; cursor: pointer; text-align: right; width: 100%;">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                تبديل وضع الموقع
            </button>
        ` : '';

        const mobileDashboardBtn = isFounder ? `
            <a href="dashboard.html" class="btn btn-sm" style="background: rgba(16, 185, 129, 0.1); color: #10b981; width: 100%; padding: 0.85rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; text-decoration: none; border: 1px solid rgba(16, 185, 129, 0.3);">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                لوحة التحكم المباشرة
            </a>
            <button onclick="togglePremiumMode()" class="btn btn-sm" style="background: rgba(168, 85, 247, 0.1); color: #a855f7; width: 100%; padding: 0.85rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; border: 1px solid rgba(168, 85, 247, 0.3); font-family: inherit; font-size: 0.95rem; font-weight: 700; cursor: pointer;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                تبديل وضع الموقع
            </button>
        ` : '';

        const desktopBtn = document.getElementById('authBtnDesktop');
        if (desktopBtn) {
            const desktopContainer = document.getElementById('desktopAuthContainer');
            desktopBtn.remove();
            
            const userPanel = document.createElement('div');
            userPanel.className = 'user-dropdown-container';
            userPanel.innerHTML = `
                <button class="btn btn-sm user-profile-btn ${isFounder ? 'founder-glow' : ''}" id="desktopUserBtn" ${isFounder ? 'style="border-color: #00f3ff !important; color: #00f3ff !important;"' : ''}>
                    مرحباً، ${displayName}
                    <svg class="chevron" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </button>
                <div class="dropdown-menu" id="desktopDropdown">
                    ${desktopDashboardBtn}
                    <a href="profile.html" class="dropdown-item" style="color: var(--color-foreground); text-decoration: none;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        الملف الشخصي
                    </a>
                    <button onclick="logoutUser()" class="dropdown-item" style="color: #ef4444;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        تسجيل الخروج
                    </button>
                </div>
            `;
            desktopContainer.appendChild(userPanel);

            document.getElementById('desktopUserBtn').addEventListener('click', (e) => {
                e.stopPropagation();
                const dropdown = document.getElementById('desktopDropdown');
                const btn = document.getElementById('desktopUserBtn');
                dropdown.classList.toggle('active');
                btn.classList.toggle('active');
            });
        }

        const mobileBtn = document.getElementById('authBtnMobile');
        if (mobileBtn) {
            const mobileContainer = document.getElementById('mobileAuthContainer');
            mobileBtn.remove();
            
            const mobilePanel = document.createElement('div');
            mobilePanel.style.width = '100%';
            mobilePanel.innerHTML = `
                <button class="btn btn-sm user-profile-btn" id="mobileUserBtn" style="width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 0.85rem; ${isFounder ? 'border-color: #00f3ff !important; color: #00f3ff !important;' : ''}">
                    <span>مرحباً، ${displayName}</span>
                    <svg class="chevron" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </button>
                <div id="mobileDropdown" style="display: none; margin-top: 0.5rem; flex-direction: column; gap: 0.5rem;">
                    ${mobileDashboardBtn}
                    <a href="profile.html" class="btn btn-sm" style="background: rgba(124, 88, 220, 0.1); color: var(--color-primary); width: 100%; padding: 0.85rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; text-decoration: none; border: 1px solid rgba(124, 88, 220, 0.3);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        الملف الشخصي
                    </a>
                    <button onclick="logoutUser()" class="btn btn-sm logout-btn" style="width: 100%; padding: 0.85rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        تسجيل الخروج
                    </button>
                </div>
            `;
            mobileContainer.appendChild(mobilePanel);

            document.getElementById('mobileUserBtn').addEventListener('click', (e) => {
                const dropdown = document.getElementById('mobileDropdown');
                const btn = document.getElementById('mobileUserBtn');
                if(dropdown.style.display === 'none') {
                    dropdown.style.display = 'flex';
                    btn.classList.add('active');
                } else {
                    dropdown.style.display = 'none';
                    btn.classList.remove('active');
                }
            });
        }

        const heroBtn = document.getElementById('heroAuthBtn');
        if (heroBtn) {
            heroBtn.innerHTML = `
                الذهاب للملف الشخصي
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            `;
            heroBtn.href = "profile.html";
        }
    }
}

// --- وظيفة تشغيل وضع الـ Premium (خلفية الجزيئات) للمدير ---
window.togglePremiumMode = function() {
    document.body.classList.toggle('premium-active');
    const isActive = document.body.classList.contains('premium-active');
    localStorage.setItem('luxen_premium_mode', isActive ? 'true' : 'false');
    
    if (isActive) {
        initPremiumUniverse();
    }
};

let universeInitialized = false;
function initPremiumUniverse() {
    if (universeInitialized) return;
    const canvas = document.getElementById('premiumUniverseCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();
    
    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = Math.random() * 0.8 - 0.4;
            this.speedY = Math.random() * 0.8 - 0.4;
            this.color = Math.random() > 0.5 ? '#00f3ff' : '#ff00ea'; // ألوان السماوي والوردي
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < 0 || this.x > width) this.speedX *= -1;
            if (this.y < 0 || this.y > height) this.speedY *= -1;
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // عدد الجزيئات متناسب مع حجم الشاشة
    const particleCount = Math.min(Math.floor(window.innerWidth / 15), 100);
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    function animate() {
        requestAnimationFrame(animate);
        
        // إيقاف الرسم إذا كان الوضع معطلاً لتوفير الأداء
        if (!document.body.classList.contains('premium-active')) {
            ctx.clearRect(0, 0, width, height);
            return;
        }
        
        ctx.clearRect(0, 0, width, height);
        
        // خلفية مظلمة متدرجة
        const grad = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height));
        grad.addColorStop(0, '#0f0f1a');
        grad.addColorStop(1, '#05050a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        
        // رسم خطوط بين الجزيئات المتقاربة
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(124, 88, 220, ${1 - dist/120})`;
                    ctx.lineWidth = 0.8;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }
    universeInitialized = true;
    animate();
}

function logoutUser() {
    localStorage.removeItem('luxen_user');
    window.location.reload();
}

document.addEventListener('click', (e) => {
    const desktopDropdown = document.getElementById('desktopDropdown');
    const desktopUserBtn = document.getElementById('desktopUserBtn');
    if (desktopDropdown && desktopDropdown.classList.contains('active')) {
        if (!desktopDropdown.contains(e.target) && e.target !== desktopUserBtn) {
            desktopDropdown.classList.remove('active');
            desktopUserBtn.classList.remove('active');
        }
    }
});

// --- Premium Mobile Sidebar Logic ---
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileSidebar = document.getElementById('mobileSidebar');
const mobileOverlay = document.getElementById('mobileOverlay');

function toggleMobileMenu() {
    if(!mobileSidebar || !mobileOverlay || !mobileMenuBtn) return;
    const isOpen = mobileSidebar.classList.toggle('active');
    mobileOverlay.classList.toggle('active');
    mobileMenuBtn.classList.toggle('open');
    document.body.style.overflow = isOpen ? 'hidden' : '';
}

if(mobileMenuBtn && mobileOverlay) {
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    mobileOverlay.addEventListener('click', toggleMobileMenu);
}

// --- Search Modal & Functionality Logic ---
const searchBtn = document.querySelector('.search-toggle-btn');
const searchOverlay = document.getElementById('searchOverlay');
const closeSearch = document.getElementById('closeSearch');
const searchInput = document.getElementById('searchInput');
const executeSearchBtn = document.getElementById('executeSearchBtn');

function performSearch() {
    const query = searchInput.value.trim();
    if (query) {
        alert('جاري البحث عن: ' + query);
        searchOverlay.classList.remove('active');
        searchInput.value = '';
    } else {
        searchInput.focus();
    }
}

if(searchBtn && searchOverlay) {
    searchBtn.addEventListener('click', () => {
        searchOverlay.classList.add('active');
        setTimeout(() => { searchInput.focus(); }, 100);
    });

    closeSearch.addEventListener('click', () => {
        searchOverlay.classList.remove('active');
        searchInput.value = ''; 
    });

    searchOverlay.addEventListener('click', (e) => {
        if (e.target === searchOverlay) {
            searchOverlay.classList.remove('active');
            searchInput.value = '';
        }
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        } else if (e.key === 'Escape') {
            searchOverlay.classList.remove('active');
            searchInput.value = '';
        }
    });

    if (executeSearchBtn) {
        executeSearchBtn.addEventListener('click', performSearch);
    }
}

// --- Theme Toggle Logic ---
const html = document.documentElement;
const sunIcons = document.querySelectorAll('.sunIcon');
const moonIcons = document.querySelectorAll('.moonIcon');

function updateThemeUI(isDark) {
    sunIcons.forEach(icon => icon.style.display = isDark ? "block" : "none");
    moonIcons.forEach(icon => icon.style.display = isDark ? "none" : "block");
}

function toggleTheme() {
    html.classList.toggle("dark");
    const isDark = html.classList.contains("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    updateThemeUI(isDark);
}

const themeToggleBtn = document.getElementById("themeToggleDesktop");
const mobileThemeBtn = document.querySelector(".mobile-theme-btn");

if(themeToggleBtn) themeToggleBtn.addEventListener("click", toggleTheme);
if(mobileThemeBtn) mobileThemeBtn.addEventListener("click", toggleTheme);

// --- Video Modal Logic ---
window.openVideo = function() {
    const modal = document.getElementById('video-modal');
    if(!modal) return;
    modal.classList.add('show');
    const video = document.getElementById('promo-video');
    if (video) {
        video.play();
    }
}

window.closeVideo = function() {
    const modal = document.getElementById('video-modal');
    if(!modal) return;
    modal.classList.remove('show');
    
    const video = document.getElementById('promo-video');
    if (video) {
        video.pause();
        video.currentTime = 0; 
    }
}

// --- Projects Modal Logic ---
window.openProjectsModal = function() {
    const modal = document.getElementById('projects-modal');
    if(!modal) return;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

window.closeProjectsModal = function() {
    const modal = document.getElementById('projects-modal');
    if(!modal) return;
    modal.classList.remove('show');
    document.body.style.overflow = '';
}

// --- Partners Modal Logic ---
window.openPartnersModal = function() {
    const modal = document.getElementById('partners-modal');
    if(!modal) return;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

window.closePartnersModal = function() {
    const modal = document.getElementById('partners-modal');
    if(!modal) return;
    modal.classList.remove('show');
    document.body.style.overflow = '';
}

// Handle clicking outside modals
window.addEventListener('click', function(event) {
    const videoModal = document.getElementById('video-modal');
    if (event.target === videoModal) {
        window.closeVideo();
    }
    
    const projectsModal = document.getElementById('projects-modal');
    if (event.target === projectsModal) {
        window.closeProjectsModal();
    }
    
    const partnersModal = document.getElementById('partners-modal');
    if (event.target === partnersModal) {
        window.closePartnersModal();
    }
});

// --- Support Modal & Form Logic (New) ---
const openSupportBtn = document.getElementById('openSupportModalBtn');
const supportModal = document.getElementById('supportModal');
const closeSupportBtn = document.getElementById('closeSupportModal');
const supportForm = document.getElementById('supportForm');
const supportSuccess = document.getElementById('supportSuccess');

if(openSupportBtn && supportModal) {
    openSupportBtn.addEventListener('click', () => {
        supportModal.classList.add('show');
        if (supportForm.style.display === 'none') {
            supportForm.style.display = 'block';
            supportSuccess.style.display = 'none';
            supportForm.reset();
            const btn = supportForm.querySelector('.collab-submit-btn');
            if(btn) {
                btn.disabled = false;
                btn.querySelector('.btn-text').textContent = 'إرسال التذكرة';
                btn.querySelector('.btn-icon').outerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
            }
        }
    });

    closeSupportBtn.addEventListener('click', () => {
        supportModal.classList.remove('show');
    });

    supportModal.addEventListener('click', (e) => {
        if (e.target === supportModal) {
            supportModal.classList.remove('show');
        }
    });
    
    if(supportForm) {
        supportForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = supportForm.querySelector('.collab-submit-btn');
            const btnIcon = btn.querySelector('.btn-icon');
            const btnText = btn.querySelector('.btn-text');
            
            btn.disabled = true;
            btnText.textContent = 'جاري إرسال التذكرة...';
            btnIcon.outerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>';
            
            setTimeout(() => {
                supportForm.style.display = 'none';
                supportSuccess.style.display = 'block';
            }, 1500);
        });
    }
}

// --- Collaboration Form & Tabs Logic ---
const tabButtons = document.querySelectorAll('.tab-btn');
const formPanels = document.querySelectorAll('.form-panel');
const tabsContainer = document.querySelector('.form-tabs');

if(tabButtons && formPanels) {
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            formPanels.forEach(panel => panel.classList.remove('active'));
            
            button.classList.add('active');
            const targetPanelId = button.getAttribute('data-target');
            const targetPanel = document.getElementById(targetPanelId);
            if(targetPanel) targetPanel.classList.add('active');
        });
    });
}

function handleFormSubmit(formId, successId) {
    const form = document.getElementById(formId);
    
    if(form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const btn = form.querySelector('.collab-submit-btn');
            const btnIcon = btn.querySelector('.btn-icon');
            const btnText = btn.querySelector('.btn-text');
            const successBox = document.getElementById(successId);
            
            btn.disabled = true;
            btnText.textContent = 'جاري معالجة طلبك...';
            btnIcon.outerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>';
            
            setTimeout(() => {
                if(tabsContainer) tabsContainer.style.display = 'none';
                form.parentElement.style.display = 'none';
                if(successBox) successBox.style.display = 'block';
            }, 1500);
        });
    }
}

handleFormSubmit('collab-form', 'collab-success');
handleFormSubmit('consult-form', 'consult-success');

// --- Pricing Logic ---
function initPricing() {
    const plans = [
        {
          name: "Basic Plan",
          badge: "مجاني لفترة محدودة",
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`,
          price: "مجاني",
          description: "ابدأ رحلتك مع LUXEN TECH",
          features: [
            "Requests: 30",
            "Period: 3 يوم",
            "API Keys: 1",
            "GPT, Gemini, DeepSeek",
            "LUXEN Builder: مجاني",
            "Telegram Analytics Bot",
          ],
          note: "أصبح الآن: 30 Request / ثلاث أيام",
          ctaText: "جرّب الآن مجانًا",
          ctaLink: "https://corex-xi.vercel.app/",
          isPopular: false,
        },
        {
          name: "Standard Plan",
          badge: "للمبتدئين",
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`,
          price: "150 ج.م",
          description: "للاستخدام الشخصي",
          features: [
            "Requests: 800",
            "Period: +30 يوم",
            "API Keys: 1",
            "GPT, Gemini, DeepSeek",
            "ميزة Prompting System للتحكم الكامل",
            "AI AGENT (أداة تبرمج المشروع بالكامل)",
            "Telegram Analytics + Assistant",
            "Hosting (1 project)",
          ],
          ctaText: "اشترك الآن",
          ctaLink: `https://wa.me/+201099273142?text=${encodeURIComponent("مرحبًا، أرغب في الاشتراك في خطة Standard Plan على منصة LUXEN TECH")}`,
          isPopular: false,
        },
        {
          name: "Pro Plan",
          badge: "الأكثر شعبية",
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
          price: "400 ج.م",
          description: "للمطورين المحترفين",
          features: [
            "Requests: 1,500",
            "Period: +80 يوم",
            "API Keys: 3",
            "جميع الموديلات",
            "ميزة Prompting System للتحكم الكامل",
            "LUXEN Builder (AI Agent)",
            "Telegram Analytics + Assistant",
            "act (Advanced Customization)",
            "مناسب لمشاريع الفريلانس",
            "Hosting (3 projects)",
          ],
          ctaText: "اشترك الآن",
          ctaLink: `https://wa.me/+201099273142?text=${encodeURIComponent("مرحبًا، أرغب في الاشتراك في خطة Pro Plan على منصة LUXEN TECH")}`,
          isPopular: true,
        },
        {
          name: "Go Plan",
          badge: "للمشاريع الكبيرة",
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>`,
          price: "700 ج.م",
          description: "مناسب للمشاريع الحقيقية",
          features: [
            "Requests: 2,000",
            "Period: +120 يوم",
            "API Keys: 6",
            "جميع الموديلات",
            "ميزة Prompting System للتحكم الكامل",
            "LUXEN Builder: مجاني",
            "Telegram Analytics + Assistant",
            "act (Advanced Customization)",
            "مناسب لمشاريع الفريلانس",
            "Hosting (10 projects)",
          ],
          ctaText: "ابدأ الآن",
          ctaLink: `https://wa.me/+201099273142?text=${encodeURIComponent("مرحبا، أرغب في الاشتراك في خطة Go Plan على منصة LUXEN TECH")}`,
          isPopular: false,
        },
        {
          name: "Enterprise Plan",
          badge: "حسب الطلب",
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,
          price: "حسب الاتفاق",
          description: "للشركات والمشاريع الكبيرة",
          features: [
            "Requests حسب الاتفاق",
            "API Keys حسب الطلب",
            "جميع الموديلات",
            "TTS, STT, OCR",
            "دعم مباشر",
            "إعداد مخصص",
            "Hosting غير محدود",
          ],
          ctaText: "تواصل معنا",
          ctaLink: `https://wa.me/+201099273142?text=${encodeURIComponent("مرحبًا، أرغب في الاستفسار عن خطة Enterprise Plan على منصة LUXEN TECH")}`,
          isPopular: false,
        },
    ];

    const pricingGrid = document.getElementById("pricingGrid");
    if(!pricingGrid) return;

    pricingGrid.innerHTML = plans.map((plan) => `
        <div class="pricing-card ${plan.isPopular ? "popular" : ""}">
            ${plan.isPopular ? `<div class="popular-badge">${plan.badge}</div>` : ""}
            <div class="pricing-header">
                <div class="plan-icon-wrapper">
                    <div class="plan-icon">${plan.icon}</div>
                    ${!plan.isPopular ? `<div class="plan-badge">${plan.badge}</div>` : ""}
                </div>
                <h3 class="plan-name">${plan.name}</h3>
                <p class="plan-description">${plan.description}</p>
                <div class="plan-price">
                    <div>${plan.price}</div>
                </div>
            </div>
            <ul class="plan-features">
                ${plan.features.map((feature) => `
                    <li>
                        <svg class="check-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        <span>${feature}</span>
                    </li>
                `).join("")}
            </ul>
            ${plan.note ? `<p class="plan-note">📌 ${plan.note}</p>` : ""}
            <a href="${plan.ctaLink}" target="_blank" class="btn btn-sm" style="width: 100%; margin-top: auto; ${plan.isPopular ? 'background: linear-gradient(135deg, #00f3ff, #ff00ea);' : 'border: 1px solid rgba(124, 88, 220, 0.5); color: var(--color-foreground) !important;'}">
                ${plan.ctaText}
            </a>
        </div>
    `).join("");
}

function initFaqs() {
    let faqs = JSON.parse(localStorage.getItem('luxen_faqs'));
    if (!faqs || faqs.length === 0) {
        faqs = [
            { id: 1, question: "إيه هو الـ API Key وإيه اللي بيعمله؟", answer: "الـ API Key هو مفتاح سري بيخليك توصل لنماذج الذكاء الاصطناعي وتستخدمها في مشاريعك. زي ما عندك كلمة مرور بتفتح بيها باب، الـ API Key بيفتح لك باب نماذج AI زي GPT وClaude وGemini وغيرهم.", date: new Date().toLocaleDateString('ar-EG'), status: "نشط" },
            { id: 2, question: "هل فيه تجربة مجانية؟", answer: "أيوه! فيه خطة مجانية بتسمحلك تجرب المنصة وتشوف بنفسك. تواصل معانا على واتساب وهنساعدك تبدأ على طول.", date: new Date().toLocaleDateString('ar-EG'), status: "نشط" },
            { id: 3, question: "إزاي أدمج الـ API في مشروعي؟", answer: "بسيطة جداً! بعد ما تاخد الـ API Key، تقدر تستخدمه في Python أو JavaScript أو أي لغة تانية. عندنا توثيق كامل بالعربي على <a href='https://coredx.vercel.app/' target='_blank'>موقعنا</a> بيشرحلك كل خطوة.", date: new Date().toLocaleDateString('ar-EG'), status: "نشط" },
            { id: 4, question: "إيه الفرق بين LUXEN TECH وأشتري API من OpenAI مباشرة؟", answer: "مع LUXEN TECH، مفتاح واحد بيديك وصول لأكتر من 10 موديلات مختلفة (GPT، Claude، Gemini، DeepSeek وغيرهم). لو اشتريت من كل شركة على حدة، هتدفع أضعاف التكلفة وتحتاج بطاقة دولية ومشاكل كتير. منصتنا بتبسّط كل ده.", date: new Date().toLocaleDateString('ar-EG'), status: "نشط" },
            { id: 5, question: "إيه هو Bemo وإيه اللي بيعمله؟", answer: "Bemo هو مساعدك الذكي الشخصي المبني على LUXEN TECH. بشخصية ودودة ومصرية، بيساعدك تتعلم، تكتب، ترسم صور، وتشتغل على مشاريعك. تقدر تخليه على مزاجك وتحدد اسمه وشخصيته!", date: new Date().toLocaleDateString('ar-EG'), status: "نشط" },
            { id: 6, question: "هل الخطة بتتجدد تلقائياً؟", answer: "لأ! ما فيش تجديد تلقائي أو خصم من بطاقتك. لما خطتك تخلص، بتتواصل معانا وبتجدد براحتك. مفيش مفاجآت.", date: new Date().toLocaleDateString('ar-EG'), status: "نشط" }
        ];
        localStorage.setItem('luxen_faqs', JSON.stringify(faqs));
    }
    renderMainFaqs();
}

function renderMainFaqs() {
    const faqDynamic = document.getElementById('faq-dynamic');
    if (!faqDynamic) return;

    const faqs = JSON.parse(localStorage.getItem('luxen_faqs')) || [];
    const activeFaqs = faqs.filter(f => f.status === 'نشط');

    faqDynamic.innerHTML = activeFaqs.map(faq => `
        <div class="faq-item">
            <button class="faq-question">
                <span>${faq.question}</span>
                <svg class="faq-chevron" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div class="faq-answer"><p>${faq.answer}</p></div>
        </div>
    `).join('');

    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const currentItem = question.closest('.faq-item');
            document.querySelectorAll('.faq-item').forEach(item => {
                if (item !== currentItem) item.classList.remove('active');
            });
            currentItem.classList.toggle('active');
        });
    });
}

function initStatsCounter() {
    const counters = document.querySelectorAll('.stat-number');
    if (!counters.length) return;

    let animated = false;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated) {
                animated = true;
                counters.forEach(counter => {
                    const target = +counter.getAttribute('data-target');
                    const duration = 2000; 
                    const frameRate = 1000 / 60;
                    const totalFrames = Math.round(duration / frameRate);
                    let frame = 0;

                    const counterAnim = setInterval(() => {
                        frame++;
                        const progress = frame / totalFrames;
                        const easeOut = progress * (2 - progress);
                        const currentCount = Math.round(target * easeOut);
                        
                        if (target >= 10000 && frame === totalFrames) {
                            counter.innerText = '+' + (target / 1000) + 'K';
                        } else {
                            counter.innerText = '+' + currentCount.toLocaleString('en-US');
                        }

                        if (frame === totalFrames) {
                            clearInterval(counterAnim);
                        }
                    }, frameRate);
                });
            }
        });
    }, { threshold: 0.1 });

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) observer.observe(statsSection);
}

const revObs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target;
        const delay = parseInt(el.dataset.delay || '0', 10);
        setTimeout(() => el.classList.add('in-view'), delay);
        revObs.unobserve(el);
    });
}, { threshold: 0.09, rootMargin: '0px 0px -36px 0px' });

// --- Admin Element Control System ---
function applyElementStates() {
    const savedStates = JSON.parse(localStorage.getItem('luxen_elements_state')) || {};
    const elements = document.querySelectorAll('.pcard, .stat-card, .pricing-card, .bento-partner-card, .faq-item, .discount-box, .custom-plan, .coming-card, .collab-card, .support-card, section');

    elements.forEach((el, index) => {
        const elId = el.id || 'track-el-' + index;
        el.setAttribute('data-track-id', elId);

        if (savedStates[elId] === 'hidden') {
            el.classList.add('is-hidden-by-admin');
        } else if (savedStates[elId] === 'soon') {
            el.classList.add('is-coming-soon-by-admin');
        }
    });
}

function buildAdminControls() {
    const currentUser = localStorage.getItem('luxen_user');
    if (currentUser !== 'adminluxentech@gmail.com') return;

    const elements = document.querySelectorAll('.pcard, .stat-card, .pricing-card, .bento-partner-card, .faq-item, .discount-box, .custom-plan, .coming-card, .collab-card, .support-card, section');

    elements.forEach(el => {
        if (el.querySelector(':scope > .admin-controls-panel')) return;

        if (window.getComputedStyle(el).position === 'static') {
            el.style.position = 'relative';
        }

        const elId = el.getAttribute('data-track-id');

        const controls = document.createElement('div');
        controls.className = 'admin-controls-panel';
        controls.style.cssText = 'position: absolute; top: 5px; right: 5px; z-index: 100000;';
        
        controls.innerHTML = `
            <button class="btn-hide-el">إخفاء</button>
            <button class="btn-soon-el">قريباً</button>
            <button class="btn-show-el">طبيعي</button>
        `;

        controls.querySelector('.btn-hide-el').addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            updateElementState(el, elId, 'hidden');
        });

        controls.querySelector('.btn-soon-el').addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            updateElementState(el, elId, 'soon');
        });

        controls.querySelector('.btn-show-el').addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            updateElementState(el, elId, 'normal');
        });

        el.appendChild(controls);
    });
}

function updateElementState(el, id, state) {
    let savedStates = JSON.parse(localStorage.getItem('luxen_elements_state')) || {};
    el.classList.remove('is-hidden-by-admin', 'is-coming-soon-by-admin');

    if (state === 'hidden') {
        el.classList.add('is-hidden-by-admin');
        savedStates[id] = 'hidden';
    } else if (state === 'soon') {
        el.classList.add('is-coming-soon-by-admin');
        savedStates[id] = 'soon';
    } else {
        delete savedStates[id];
    }
    localStorage.setItem('luxen_elements_state', JSON.stringify(savedStates));
}

document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    if (savedTheme === "dark") {
        html.classList.add("dark");
        updateThemeUI(true);
    } else {
        html.classList.remove("dark");
        updateThemeUI(false);
    }
    
    checkAuth();
    
    const savedPremium = localStorage.getItem('luxen_premium_mode');
    if (savedPremium === 'true') {
        document.body.classList.add('premium-active');
        initPremiumUniverse();
    }
    
    initPricing();
    initFaqs();
    initStatsCounter();
    
    applyElementStates();
    buildAdminControls();

    document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

    const faqSubmitForm = document.getElementById('faq-submit-form');
    if (faqSubmitForm) {
        faqSubmitForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('newQuestionInput');
            const questionText = input.value.trim();
            
            if (questionText) {
                const faqs = JSON.parse(localStorage.getItem('luxen_faqs')) || [];
                faqs.push({
                    id: Date.now(),
                    question: questionText,
                    answer: "سيتم الرد على هذا السؤال قريباً من قبل الإدارة.",
                    date: new Date().toLocaleDateString('ar-EG'),
                    status: "قيد المراجعة"
                });
                
                localStorage.setItem('luxen_faqs', JSON.stringify(faqs));
                input.value = '';
                alert('تم إرسال سؤالك بنجاح! سيتم مراجعته وإضافته قريباً.');
            }
        });
    }
});