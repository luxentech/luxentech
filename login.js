/* --- الثيم والوضع المظلم/المضيء --- */
const themeToggleBtn = document.getElementById('themeToggle');
const rootElement = document.documentElement;
const savedTheme = localStorage.getItem('theme');
const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

if (savedTheme === 'light' || (!savedTheme && prefersLight)) {
    rootElement.setAttribute('data-theme', 'light');
}

themeToggleBtn.addEventListener('click', () => {
    if (rootElement.getAttribute('data-theme') === 'light') {
        rootElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'dark');
    } else {
        rootElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
});

/* --- توهج الماوس (Mouse Tracking - Optimized) --- */
const mouseGlow = document.getElementById('mouseGlow');
let isGlowVisible = false;
let ticking = false;

document.addEventListener('mousemove', (e) => {
    if (!isGlowVisible) {
        mouseGlow.style.opacity = '1';
        isGlowVisible = true;
    }
    if (!ticking) {
        requestAnimationFrame(() => {
            mouseGlow.style.transform = `translate(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%))`;
            ticking = false;
        });
        ticking = true;
    }
});

document.addEventListener('mouseleave', () => {
    mouseGlow.style.opacity = '0';
    isGlowVisible = false;
});

/* --- أدوات الواجهة (إظهار الباسورد والتبديل) --- */
window.togglePasswordVisibility = function(inputId, btnElement) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        btnElement.classList.add('active');
    } else {
        input.type = 'password';
        btnElement.classList.remove('active');
    }
};

const elements = {
    registerWrapper: document.getElementById('registerWrapper'),
    loginWrapper: document.getElementById('loginWrapper'),
    mainTitle: document.getElementById('mainTitle'),
    mainSubtitle: document.getElementById('mainSubtitle'),
    messageDiv: document.getElementById('message')
};

const switchForm = (hideEl, showEl, title, subtitle) => {
    hideEl.style.animation = 'slideUpFade 0.3s reverse forwards';
    setTimeout(() => {
        hideEl.classList.remove('active');
        hideEl.style.animation = '';
        showEl.classList.add('active');
        elements.mainTitle.textContent = title;
        elements.mainSubtitle.textContent = subtitle;
        elements.messageDiv.innerHTML = '';
    }, 300);
};

document.getElementById('switchToLogin').addEventListener('click', () => {
    switchForm(elements.registerWrapper, elements.loginWrapper, 'مرحباً بعودتك', 'سجل دخولك إلى حسابك في LUXEN TECH');
});

document.getElementById('switchToRegister').addEventListener('click', () => {
    switchForm(elements.loginWrapper, elements.registerWrapper, 'إنشاء حساب جديد', 'انضم إلى مجتمع LUXEN TECH');
});

const showMessage = (type, text) => {
    const icon = type === 'success' 
        ? '<svg width="22" height="22" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>'
        : '<svg width="22" height="22" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>';
    elements.messageDiv.innerHTML = `<div class="message ${type}">${icon} <span>${text}</span></div>`;
};

/* --- نظام حفظ البيانات وربطها بالصفحة الرئيسية ولوحة التحكم --- */
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const pass = document.getElementById('password').value;
    const confirm = document.getElementById('confirm').value;
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const username = document.getElementById('username').value;
    
    if (pass !== confirm) {
        showMessage('error', 'كلمتا المرور غير متطابقتين، يرجى التأكد.');
        return;
    }

    let allUsers = JSON.parse(localStorage.getItem('luxen_all_users')) || [];
    
    // منع تكرار اسم المستخدم
    if (allUsers.find(u => u.username === username)) {
        showMessage('error', 'اسم المستخدم هذا مسجل بالفعل، يرجى اختيار اسم آخر.');
        return;
    }

    const btn = document.getElementById('registerBtn');
    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> <span>جاري التوثيق...</span>';
    
    setTimeout(() => {
        showMessage('success', 'تم إنشاء حسابك بنجاح! جاري تحويلك...');
        btn.disabled = false;
        btn.innerHTML = originalHTML;
        
        localStorage.setItem('luxen_user', username); // حفظ اليوزر نيم
        
        allUsers.push({
            name: name,
            username: username,
            phone: phone,
            password: pass, // حفظ كلمة المرور للاستخدام في الملف الشخصي
            userCode: 'LUX-' + Math.floor(10000 + Math.random() * 90000), // توليد كود تلقائي
            avatar: '', // تجهيز حقل الصورة
            date: new Date().toLocaleDateString('ar-EG'),
            status: 'نشط'
        });
        localStorage.setItem('luxen_all_users', JSON.stringify(allUsers));
        
        setTimeout(() => window.location.href = 'index.html', 1000);
    }, 1500);
});

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = document.getElementById('loginBtn');
    const loginUsername = document.getElementById('loginUsername').value.trim();
    const loginPassword = document.getElementById('loginPassword').value;
    
    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> <span>جاري التحقق...</span>';
    
    let allUsers = JSON.parse(localStorage.getItem('luxen_all_users')) || [];

    // فحص حساب المؤسس (التحكم الخاص)
    if (loginUsername === 'adminluxentech@gmail.com') {
        if (loginPassword !== 'founderofluxentechomar') {
            setTimeout(() => {
                showMessage('error', 'كلمة المرور غير صحيحة لحساب المؤسس.');
                btn.disabled = false;
                btn.innerHTML = originalHTML;
            }, 800);
            return;
        }
        
        let founderAcc = allUsers.find(u => u.username === 'adminluxentech@gmail.com');
        
        if (!founderAcc || founderAcc.status !== 'نشط') {
            setTimeout(() => {
                showMessage('error', 'هذا الحساب غير مفعل حالياً من قبل الإدارة.');
                btn.disabled = false;
                btn.innerHTML = originalHTML;
            }, 800);
            return;
        }

        setTimeout(() => {
            showMessage('success', 'تم التحقق بنجاح! مرحباً بك في حساب المؤسس الخاص بك.');
            localStorage.setItem('luxen_user', 'adminluxentech@gmail.com');
            setTimeout(() => window.location.href = 'index.html', 1000);
        }, 1200);
        return;
    }

    // تسجيل الدخول الفعلي للمستخدمين والتحقق من كلمة المرور
    let foundUser = allUsers.find(u => u.username === loginUsername && u.password === loginPassword);

    setTimeout(() => {
        if (!foundUser) {
            showMessage('error', 'اسم المستخدم أو كلمة المرور غير صحيحة.');
            btn.disabled = false;
            btn.innerHTML = originalHTML;
            return;
        }

        if (foundUser.status === 'محظور') {
            showMessage('error', 'عفواً، هذا الحساب محظور من قبل الإدارة.');
            btn.disabled = false;
            btn.innerHTML = originalHTML;
            return;
        }

        showMessage('success', 'تم تسجيل الدخول بنجاح! مرحباً بك.');
        btn.disabled = false;
        btn.innerHTML = originalHTML;
        
        localStorage.setItem('luxen_user', loginUsername);
        
        setTimeout(() => window.location.href = 'index.html', 1000);
    }, 1500);
});

/* --- نظام اختيار الدولة المتقدم --- */
const countries = [
    { name: 'مصر', code: '20', flag: '🇪🇬' },
    { name: 'السعودية', code: '966', flag: '🇸🇦' },
    { name: 'الإمارات', code: '971', flag: '🇦🇪' },
    { name: 'الكويت', code: '965', flag: '🇰🇼' },
    { name: 'قطر', code: '974', flag: '🇶🇦' },
    { name: 'البحرين', code: '973', flag: '🇧🇭' },
    { name: 'عُمان', code: '968', flag: '🇴🇲' },
    { name: 'الأردن', code: '962', flag: '🇯🇴' },
    { name: 'لبنان', code: '961', flag: '🇱🇧' },
    { name: 'سوريا', code: '963', flag: '🇸🇾' },
    { name: 'العراق', code: '964', flag: '🇮🇶' },
    { name: 'فلسطين', code: '970', flag: '🇵🇸' },
    { name: 'المغرب', code: '212', flag: '🇲🇦' },
    { name: 'الجزائر', code: '213', flag: '🇩🇿' },
    { name: 'تونس', code: '216', flag: '🇹🇳' }
];

let selectedCountry = countries[0];
const countrySelector = document.getElementById('countrySelector');
const countrySelectorBtn = document.getElementById('countrySelectorBtn');
const countryList = document.getElementById('countryList');
const countrySearch = document.getElementById('countrySearch');

function updateSelectorButton() {
    countrySelectorBtn.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size: 18px;">${selectedCountry.flag}</span>
            <span style="direction:ltr; font-weight:800;">+${selectedCountry.code}</span>
        </div>
        <span class="arrow">▼</span>
    `;
}

function renderCountryList(filter = '') {
    const term = filter.toLowerCase().trim();
    const filtered = countries.filter(c => c.name.includes(term) || c.code.includes(term));
    
    if(filtered.length === 0) {
        countryList.innerHTML = '<div style="padding:15px; text-align:center; opacity:0.6; font-size:14px; font-weight:600;">لا توجد نتائج</div>';
        return;
    }

    countryList.innerHTML = filtered.map(country => `
        <div class="country-option ${country.code === selectedCountry.code ? 'selected' : ''}" 
             data-code="${country.code}" data-name="${country.name}" data-flag="${country.flag}">
            <span style="font-size:18px;">${country.flag}</span> 
            <span class="name">${country.name}</span>
            <span class="dial-code">+${country.code}</span>
        </div>
    `).join('');
    
    document.querySelectorAll('.country-option').forEach(option => {
        option.addEventListener('click', function(e) {
            e.stopPropagation(); 
            selectedCountry = { code: this.dataset.code, name: this.dataset.name, flag: this.dataset.flag };
            updateSelectorButton();
            countrySelector.classList.remove('open');
            countrySearch.value = '';
            renderCountryList();
        });
    });
}

countrySelectorBtn.addEventListener('click', (e) => {
    e.preventDefault(); e.stopPropagation();
    countrySelector.classList.toggle('open');
    if (countrySelector.classList.contains('open')) {
        setTimeout(() => countrySearch.focus(), 150);
    }
});

countrySearch.addEventListener('input', (e) => renderCountryList(e.target.value));

document.addEventListener('click', (e) => { 
    if (!countrySelector.contains(e.target)) countrySelector.classList.remove('open'); 
});

updateSelectorButton();
renderCountryList();