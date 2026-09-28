// ==========================================
// 1. توليد كود مستخدم فريد وتأمين حساب الإدارة
// ==========================================
function generateUserCode() {
    return 'LUX-' + Math.floor(10000 + Math.random() * 90000); 
}

function ensureFounderAccount() {
    let users = JSON.parse(localStorage.getItem('luxen_all_users')) || [];
    let updated = false;

    // التأكد من أن كل مستخدم قديم لديه كود مميز
    users.forEach(u => {
        if (!u.userCode) {
            u.userCode = generateUserCode();
            updated = true;
        }
    });

    if (!users.find(u => u.username === 'adminluxentech@gmail.com')) {
        users.unshift({
            name: 'Founder Luxen Tech',
            username: 'adminluxentech@gmail.com',
            userCode: 'LUX-00000',
            phone: 'حساب الإدارة والتحكم',
            date: new Date().toLocaleDateString('ar-EG'),
            status: 'نشط'
        });
        updated = true;
    }

    if(updated) {
        localStorage.setItem('luxen_all_users', JSON.stringify(users));
    }
}

window.toggleFounderStatus = function() {
    let users = JSON.parse(localStorage.getItem('luxen_all_users')) || [];
    let founderAcc = users.find(u => u.username === 'adminluxentech@gmail.com');
    if (founderAcc) {
        founderAcc.status = founderAcc.status === 'نشط' ? 'غير نشط' : 'نشط';
        localStorage.setItem('luxen_all_users', JSON.stringify(users));
        renderUsers();
        addAuditLog('حساب المؤسس', `تم ${founderAcc.status === 'نشط' ? 'تفعيل' : 'إلغاء تفعيل'} حساب المؤسس.`);
    }
};

window.blockUser = function(username) {
    if(confirm('هل أنت متأكد من تغيير حالة حظر هذا المستخدم؟')) {
        let users = JSON.parse(localStorage.getItem('luxen_all_users')) || [];
        let userIndex = users.findIndex(u => u.username === username);
        if(userIndex !== -1) {
            users[userIndex].status = users[userIndex].status === 'محظور' ? 'نشط' : 'محظور';
            localStorage.setItem('luxen_all_users', JSON.stringify(users));
            addAuditLog('تحديث حالة مستخدم', `تم تغيير حالة المستخدم (${username}) إلى ${users[userIndex].status}`);
            renderUsers();
        }
    }
};

window.deleteUser = function(username) {
    if(confirm('هل أنت متأكد من مسح هذا المستخدم بشكل نهائي؟ هذا الإجراء لا يمكن التراجع عنه.')) {
        let users = JSON.parse(localStorage.getItem('luxen_all_users')) || [];
        users = users.filter(u => u.username !== username);
        localStorage.setItem('luxen_all_users', JSON.stringify(users));
        addAuditLog('مسح مستخدم', `تم مسح المستخدم (${username}) من النظام`);
        renderUsers();
    }
};

window.openProfile = function(username) {
    alert('جارٍ فتح الملف الشخصي للمستخدم: ' + username + '\n(يمكنك ربط هذه الدالة بنافذة أو صفحة الملف الشخصي لاحقاً)');
};

// دالة تعديل كود المستخدم الجديد
window.editUserCode = function(username, currentCode) {
    let newCode = prompt('أدخل كود المستخدم الجديد:', currentCode);
    if (newCode !== null && newCode.trim() !== '') {
        let users = JSON.parse(localStorage.getItem('luxen_all_users')) || [];
        let userIndex = users.findIndex(u => u.username === username);
        
        if (userIndex !== -1) {
            // التحقق من عدم تكرار الكود مع مستخدم آخر
            let isTaken = users.some(u => u.userCode === newCode.trim() && u.username !== username);
            if (isTaken) {
                alert('عذراً، هذا الكود مستخدم بالفعل لحساب آخر!');
                return;
            }
            
            users[userIndex].userCode = newCode.trim();
            localStorage.setItem('luxen_all_users', JSON.stringify(users));
            addAuditLog('تعديل كود مستخدم', `تم تغيير كود المستخدم (${username}) إلى ${newCode.trim()}`);
            renderUsers();
        }
    }
};

// ==========================================
// 2. المتغيرات العامة وإعدادات النظام (Global Variables & State)
// ==========================================
let isAuthenticated = false;
let activeTab = 'mainWorkspace';
let loggedInUser = null; 

let currentEditFaqId = null;
let currentEditPartnerId = null;
let currentEditPlanId = null;
let currentEditAdminId = null;
let currentEditNoteId = null;

let currentSubEditUsername = null; 
let currentCustomFeatures = []; 

let systemConfig = JSON.parse(localStorage.getItem('luxen_system_config')) || {
    extUser: 'admin',
    extPass: '123456',
    intPass: 'omaraymanali',
    siteName: 'LUXEN TECH',
    statusText: 'متصل بنجاح'
};

// ==========================================
// 3. التحقق التلقائي من انتهاء الاشتراكات
// ==========================================
function checkSubscriptionsValidity() {
    let users = JSON.parse(localStorage.getItem('luxen_all_users')) || [];
    let updated = false;
    const today = new Date().toISOString().split('T')[0];

    users.forEach(user => {
        if (user.subscription && user.subscription.expiryDate && user.subscription.planId !== 'lifetime') {
            if (user.subscription.expiryDate < today && user.subscription.status === 'نشط') {
                user.subscription.status = 'منتهي';
                updated = true;
            } else if (user.subscription.expiryDate >= today && user.subscription.status === 'منتهي') {
                user.subscription.status = 'نشط';
                updated = true;
            }
        }
    });

    if (updated) {
        localStorage.setItem('luxen_all_users', JSON.stringify(users));
    }
}

// ==========================================
// 4. إدارة النوافذ المنبثقة وواجهة المستخدم (UI, Modals)
// ==========================================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if(!modal) return;
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if(!modal) return;
    modal.classList.remove('show');
    setTimeout(() => modal.style.display = 'none', 300);
    
    if(modalId === 'addFaqModal') currentEditFaqId = null;
    if(modalId === 'addPartnerModal') currentEditPartnerId = null;
    if(modalId === 'addPlanModal') currentEditPlanId = null;
    if(modalId === 'addAdminModal') currentEditAdminId = null;
    if(modalId === 'addNoteModal') currentEditNoteId = null;
    if(modalId === 'userSubscriptionModal') {
        currentSubEditUsername = null;
        currentCustomFeatures = [];
        document.getElementById('customFeatureInput').value = '';
    }
}

function toggleRowDetails(targetId) {
    const detailsRow = document.getElementById('details-' + targetId);
    if (detailsRow) {
        if (detailsRow.style.display === 'none') {
            detailsRow.style.display = 'table-row';
        } else {
            detailsRow.style.display = 'none';
        }
    }
}

function togglePassword() {
    const passInput = document.getElementById('adminPassword');
    const eyeIcon = document.getElementById('eye-icon');
    if (passInput.type === 'password') {
        passInput.type = 'text';
        eyeIcon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
    } else {
        passInput.type = 'password';
        eyeIcon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
    }
}

// ==========================================
// 5. التنقل بين مساحات العمل (Workspaces Navigation)
// ==========================================
function updateWorkspacesVisibility() {
    const workspaces = [
        'mainWorkspace', 'faqWorkspace', 'collabWorkspace', 'partnersWorkspace', 
        'videoWorkspace', 'settingsWorkspace', 'fullControlWorkspace', 'pricingWorkspace',
        'notificationsWorkspace', 'eventsWorkspace', 'permissionsWorkspace', 'devicesWorkspace', 'notesWorkspace',
        'backupWorkspace', 'pageUnlockWorkspace', 'countriesWorkspace'
    ];
    
    workspaces.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.style.display = 'none';
    });

    const mainArea = document.getElementById('mainContentArea');
    if (mainArea.style.opacity === '1') {
        if (pageLocks[activeTab] && !unlockedSessionPages[activeTab]) {
            document.getElementById('pageUnlockWorkspace').style.display = 'flex';
            document.getElementById('unlockPageInput').value = '';
            document.getElementById('unlockPageError').style.display = 'none';
        } else {
            const activeEl = document.getElementById(activeTab);
            if(activeEl) activeEl.style.display = 'flex';
            
            if(activeTab === 'mainWorkspace') renderUsers();
            if(activeTab === 'faqWorkspace') renderDashboardFaqs();
            if(activeTab === 'collabWorkspace') renderCollabsAndConsults();
            if(activeTab === 'partnersWorkspace') renderPartners();
            if(activeTab === 'fullControlWorkspace') renderAuditLogs();
            if(activeTab === 'pricingWorkspace') { renderPlans(); renderPromoCodes(); }
            if(activeTab === 'permissionsWorkspace') renderAdmins();
            if(activeTab === 'devicesWorkspace') renderDevices();
            if(activeTab === 'notesWorkspace') renderNotes();
            if(activeTab === 'countriesWorkspace') renderCountries();
        }
        updateLockBtnUI();
    }
}

const menuBtns = document.querySelectorAll('.menu-btn');
menuBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        menuBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeTab = btn.getAttribute('data-target');
        
        const title = document.getElementById('pageMainTitle');
        const desc = document.getElementById('pageMainDesc');
        
        if(activeTab === 'mainWorkspace') { title.textContent = 'جميع المستخدمين'; desc.textContent = 'قائمة المستخدمين وإدارة الصلاحيات'; }
        else if(activeTab === 'faqWorkspace') { title.textContent = 'الأسئلة الشائعة'; desc.textContent = 'إدارة وتعديل الأسئلة وإضافة أسئلة جديدة'; }
        else if(activeTab === 'collabWorkspace') { title.textContent = 'طلبات التعاونات'; desc.textContent = 'إدارة ومتابعة طلبات التعاون المقدمة'; }
        else if(activeTab === 'partnersWorkspace') { title.textContent = 'الشركاء وبطاقات النجاح'; desc.textContent = 'إضافة وإدارة قائمة الشركاء المعتمدين بالنظام'; }
        else if(activeTab === 'videoWorkspace') { title.textContent = 'الفيديو التعريفي'; desc.textContent = 'إدارة ورفع الفيديو الرئيسي لتقديمه في واجهة الموقع'; }
        else if(activeTab === 'pricingWorkspace') { title.textContent = 'الأسعار والاشتراكات'; desc.textContent = 'إدارة باقات الأسعار وكوبونات الخصم'; }
        else if(activeTab === 'settingsWorkspace') { title.textContent = 'إعدادات النظام اللامعة'; desc.textContent = 'إدارة الحسابات الحساسة والمظهر العام للمنصة ومفاتيح المرور والتحكم'; }
        else if(activeTab === 'fullControlWorkspace') { title.textContent = 'التحكم الكامل'; desc.textContent = 'أدوات الوصول العميق وسجل نشاطات النظام'; }
        else if(activeTab === 'notificationsWorkspace') { title.textContent = 'الإشعارات'; desc.textContent = 'إرسال وإدارة الإشعارات لجميع المستخدمين'; }
        else if(activeTab === 'eventsWorkspace') { title.textContent = 'الايفينتات'; desc.textContent = 'إدارة الفعاليات والأحداث القادمة وتنظيمها'; }
        else if(activeTab === 'permissionsWorkspace') { title.textContent = 'إدارة المشرفين والصلاحيات'; desc.textContent = 'إنشاء وتوزيع الصلاحيات على مساعديك وأعضاء الإدارة'; }
        else if(activeTab === 'devicesWorkspace') { title.textContent = 'الأجهزة المتصلة'; desc.textContent = 'إدارة ومراقبة جلسات الدخول الفعالة'; }
        else if(activeTab === 'notesWorkspace') { title.textContent = 'ملاحظاتي'; desc.textContent = 'مساحة العمل الخاصة بك وتدوين الأفكار السريعة'; }
        else if(activeTab === 'backupWorkspace') { title.textContent = 'النسخ الاحتياطي'; desc.textContent = 'حماية وتصدير بيانات النظام والمستخدمين بالكامل'; }
        else if(activeTab === 'countriesWorkspace') { title.textContent = 'مستخدمين الدول'; desc.textContent = 'إحصائيات توزع المستخدمين في الدول العربية'; }
        
        updateWorkspacesVisibility();
    });
});

// ==========================================
// 6. إعدادات النظام والنسخ الاحتياطي
// ==========================================
function applyDynamicSettings() {
    document.querySelectorAll('.logo-text').forEach(el => el.textContent = systemConfig.siteName);
    const statusBadge = document.querySelector('.status-badge');
    if(statusBadge) statusBadge.textContent = systemConfig.statusText;
    
    document.getElementById('settingExtUser').value = systemConfig.extUser;
    document.getElementById('settingExtPass').value = systemConfig.extPass;
    document.getElementById('settingIntPass').value = systemConfig.intPass;
    document.getElementById('settingSiteName').value = systemConfig.siteName;
    document.getElementById('settingStatusText').value = systemConfig.statusText;
}

function saveSystemSettings() {
    systemConfig.extUser = document.getElementById('settingExtUser').value.trim() || 'admin';
    systemConfig.extPass = document.getElementById('settingExtPass').value.trim() || '123456';
    systemConfig.intPass = document.getElementById('settingIntPass').value.trim() || 'omaraymanali';
    systemConfig.siteName = document.getElementById('settingSiteName').value.trim() || 'LUXEN TECH';
    systemConfig.statusText = document.getElementById('settingStatusText').value.trim() || 'متصل بنجاح';

    localStorage.setItem('luxen_system_config', JSON.stringify(systemConfig));
    applyDynamicSettings();
    addAuditLog('تعديل إعدادات', 'تم تغيير الإعدادات الأساسية أو كلمات المرور للنظام');
    alert('تم حفظ إعدادات لوحة التحكم وتحديث كلمات المرور بنجاح المطلق!');
}

function exportDatabase() {
    const backupData = {};
    for(let i=0; i<localStorage.length; i++) {
        const key = localStorage.key(i);
        if(key && key.startsWith('luxen_')) {
            backupData[key] = localStorage.getItem(key);
        }
    }
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "luxen_database_backup_" + Date.now() + ".json");
    document.body.appendChild(downloadAnchorNode); 
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    addAuditLog('نسخ احتياطي', 'تم تصدير وتحميل نسخة احتياطية من قاعدة بيانات المنصة بالكامل.');
    alert('تم تحميل النسخة الاحتياطية بنجاح! احتفظ بالملف في مكان آمن.');
}

// ==========================================
// 7. نظام تسجيل الدخول والصلاحيات
// ==========================================
document.getElementById('mainLoginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const user = document.getElementById('mainUsername').value.trim();
    const pass = document.getElementById('mainPassword').value.trim();
    
    if(user === systemConfig.extUser && pass === systemConfig.extPass) {
        loggedInUser = { role: 'superadmin', username: user, permissions: 'all' };
    } else {
        let admins = JSON.parse(localStorage.getItem('luxen_admin_accounts')) || [];
        const foundAdmin = admins.find(a => a.username === user && a.password === pass);
        if(foundAdmin) {
            loggedInUser = { role: 'admin', username: user, permissions: foundAdmin.permissions };
        }
    }
    
    if(loggedInUser) {
        isAuthenticated = true;
        sessionStorage.setItem('luxen_current_user', JSON.stringify(loggedInUser));
        
        document.getElementById('currentUserRoleText').textContent = loggedInUser.role === 'superadmin' ? 'المدير العام للمنصة' : `حساب مشرف: ${loggedInUser.username}`;
        
        const loginOverlay = document.getElementById('fullScreenLogin');
        loginOverlay.style.opacity = '0';
        setTimeout(() => { loginOverlay.style.display = 'none'; }, 500);
        
        addAuditLog('تسجيل دخول', 'تم تسجيل الدخول الخارجي للوحة التحكم.');
    } else {
        document.getElementById('mainLoginError').textContent = 'اسم المستخدم أو كلمة المرور غير صحيحة!';
    }
});

function applyPermissionsInSidebar() {
    const menuBtns = document.querySelectorAll('.menu-btn');
    let firstVisibleTarget = null;

    menuBtns.forEach(btn => {
        const target = btn.getAttribute('data-target');
        const line = document.querySelector(`.menu-item-glow-line[data-linked="${target}"]`);
        
        if(loggedInUser && (loggedInUser.permissions === 'all' || loggedInUser.permissions.includes(target))) {
            btn.style.display = 'flex';
            if(line) line.style.display = 'block';
            if(!firstVisibleTarget) firstVisibleTarget = target; 
        } else {
            btn.style.display = 'none';
            if(line) line.style.display = 'none';
        }
    });

    if(firstVisibleTarget) {
        const targetBtn = document.querySelector(`.menu-btn[data-target="${firstVisibleTarget}"]`);
        if(targetBtn) targetBtn.click();
    }
}

function adminLogout() {
    addAuditLog('تسجيل خروج', 'تم تسجيل الخروج من النظام');
    
    loggedInUser = null;
    sessionStorage.removeItem('luxen_current_user');
    unlockedSessionPages = {};
    
    const loginOverlay = document.getElementById('fullScreenLogin');
    loginOverlay.style.display = 'flex';
    setTimeout(() => { loginOverlay.style.opacity = '1'; }, 10);
    
    document.getElementById('mainUsername').value = '';
    document.getElementById('mainPassword').value = '';
    document.getElementById('mainLoginError').textContent = '';
    document.getElementById('adminPassword').value = '';
    
    document.getElementById('sidebarMenuContainer').style.display = 'none';
    document.getElementById('mainContentArea').style.opacity = '0';
    document.getElementById('mainContentArea').style.pointerEvents = 'none';

    isAuthenticated = false;
    updateWorkspacesVisibility();
}

// ==========================================
// 8. نظام حماية الصفحات (Page Lock System)
// ==========================================
let pageLocks = JSON.parse(localStorage.getItem('luxen_page_locks')) || {};
let unlockedSessionPages = {}; 

function updateLockBtnUI() {
    const lockBtn = document.getElementById('lockSettingsBtn');
    const lockText = document.getElementById('lockSettingsBtnText');
    if (!lockBtn) return;
    
    if (activeTab === 'pageUnlockWorkspace') {
        lockBtn.style.display = 'none';
        return;
    }
    lockBtn.style.display = 'flex';

    if (pageLocks[activeTab]) {
        lockBtn.classList.add('locked');
        lockText.textContent = 'تعديل الحماية';
    } else {
        lockBtn.classList.remove('locked');
        lockText.textContent = 'حماية الصفحة';
    }
}

function openLockModal() {
    document.getElementById('pagePasswordInput').value = pageLocks[activeTab] || '';
    const statusSpan = document.getElementById('currentLockStatus');
    if (pageLocks[activeTab]) {
        statusSpan.textContent = '(الصفحة محمية حالياً)';
        statusSpan.style.color = '#ef4444';
    } else {
        statusSpan.textContent = '(الصفحة غير محمية)';
        statusSpan.style.color = '#10b981';
    }
    openModal('pageLockModal');
}

function savePageLock() {
    const newPass = document.getElementById('pagePasswordInput').value.trim();
    if (newPass === '') {
        delete pageLocks[activeTab];
        alert('تم إزالة الحماية عن هذه الصفحة بنجاح.');
        addAuditLog('إزالة حماية', `تم إزالة كلمة المرور الخاصة بصفحة: ${activeTab}`);
    } else {
        pageLocks[activeTab] = newPass;
        unlockedSessionPages[activeTab] = true; 
        alert('تم تعيين كلمة المرور للصفحة بنجاح.');
        addAuditLog('تفعيل حماية', `تم حماية الصفحة بكلمة مرور: ${activeTab}`);
    }
    localStorage.setItem('luxen_page_locks', JSON.stringify(pageLocks));
    updateLockBtnUI();
    closeModal('pageLockModal');
}

function submitUnlockPage(e) {
    e.preventDefault();
    const inputPass = document.getElementById('unlockPageInput').value.trim();
    const errObj = document.getElementById('unlockPageError');
    
    if (inputPass === pageLocks[activeTab] || inputPass === systemConfig.extPass || inputPass === systemConfig.intPass) {
        unlockedSessionPages[activeTab] = true;
        updateWorkspacesVisibility();
        addAuditLog('فك حماية', `تم فك حماية صفحة والدخول إليها: ${activeTab}`);
    } else {
        errObj.textContent = 'كلمة المرور غير صحيحة!';
        errObj.style.display = 'block';
    }
}

// ==========================================
// 9. سجل النشاطات (Audit Logs)
// ==========================================
function addAuditLog(actionType, actionDetails) {
    let logs = JSON.parse(localStorage.getItem('luxen_audit_logs')) || [];
    const newLog = {
        id: Date.now(),
        adminName: loggedInUser ? loggedInUser.username : (systemConfig.extUser || 'مدير النظام'),
        action: actionType,
        details: actionDetails,
        time: new Date().toLocaleString('ar-EG', { hour12: true })
    };
    logs.unshift(newLog);
    if (logs.length > 200) logs.pop(); 
    localStorage.setItem('luxen_audit_logs', JSON.stringify(logs));
    if (activeTab === 'fullControlWorkspace' && document.getElementById('fullControlWorkspace').style.display === 'flex') {
        renderAuditLogs();
    }
}

function renderAuditLogs() {
    const logs = JSON.parse(localStorage.getItem('luxen_audit_logs')) || [];
    const tbody = document.getElementById('auditLogsTableBody');
    if (logs.length > 0 && tbody) {
        tbody.innerHTML = '';
        logs.forEach(log => {
            let actionColor = '#38bdf8'; 
            if(log.action.includes('حذف') || log.action.includes('مسح') || log.action.includes('خروج') || log.action.includes('إلغاء')) actionColor = '#ef4444';
            else if(log.action.includes('إضافة') || log.action.includes('دخول') || log.action.includes('كوبون') || log.action.includes('باقة') || log.action.includes('تفعيل')) actionColor = '#10b981';
            else if(log.action.includes('تعديل') || log.action.includes('حماية') || log.action.includes('حظر')) actionColor = '#f59e0b';

            tbody.innerHTML += `
                <tr class="main-row">
                    <td dir="ltr" style="text-align: right; color: #94a3b8; font-size: 0.85rem;">${log.time}</td>
                    <td><span style="font-weight: 700; color: #fff;">${log.adminName}</span></td>
                    <td><span class="badge" style="background: ${actionColor}15; color: ${actionColor}; border: 1px solid ${actionColor}40;">${log.action}</span></td>
                    <td style="color: #e2e8f0; font-size: 0.9rem;">${log.details}</td>
                </tr>
            `;
        });
    } else if(tbody) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 2rem; color: #94a3b8;">لا توجد نشاطات مسجلة حتى الآن.</td></tr>`;
    }
}

function clearAuditLogs() {
    if(confirm('هل أنت متأكد من مسح جميع سجلات النظام بشكل نهائي؟ هذا الإجراء لا يمكن التراجع عنه.')) {
        localStorage.removeItem('luxen_audit_logs');
        addAuditLog('تفريغ السجل', 'تم مسح جميع سجلات النظام بشكل يدوي.');
        renderAuditLogs();
    }
}

// ==========================================
// 10. إدارة اشتراكات المستخدمين وإضافة المميزات اليدوية
// ==========================================
window.openSubscriptionModal = function(username) {
    currentSubEditUsername = username;
    let users = JSON.parse(localStorage.getItem('luxen_all_users')) || [];
    let user = users.find(u => u.username === username);

    if (!user) return;

    document.getElementById('subModalUserName').textContent = `تعديل باقة: ${user.name} (${user.userCode})`;
    
    let select = document.getElementById('userSubPlanSelect');
    let expiryInput = document.getElementById('userSubExpiryInput');
    
    currentCustomFeatures = []; 
    
    if (user.subscription && user.subscription.planId) {
        select.value = user.subscription.planId;
        expiryInput.value = user.subscription.expiryDate || '';
        if (user.subscription.features) {
            currentCustomFeatures = [...user.subscription.features];
        }
    } else {
        select.value = "";
        expiryInput.value = "";
    }

    renderCustomFeaturesGrid();
    openModal('userSubscriptionModal');
};

window.handleSubPlanChange = function() {
    let select = document.getElementById('userSubPlanSelect');
    let expiryInput = document.getElementById('userSubExpiryInput');
    
    if (select.value !== "") {
        let today = new Date();
        today.setMonth(today.getMonth() + 1);
        expiryInput.value = today.toISOString().split('T')[0];
    } else {
        expiryInput.value = "";
    }
};

window.addCustomFeature = function() {
    let input = document.getElementById('customFeatureInput');
    let val = input.value.trim();
    if(val === "") return alert("يرجى كتابة الميزة أولاً.");
    
    if(currentCustomFeatures.includes(val)) return alert("هذه الميزة مضافة بالفعل!");
    
    currentCustomFeatures.push(val);
    input.value = ""; 
    renderCustomFeaturesGrid();
};

window.removeCustomFeature = function(index) {
    currentCustomFeatures.splice(index, 1);
    renderCustomFeaturesGrid();
};

function renderCustomFeaturesGrid() {
    let grid = document.getElementById('userSubFeaturesGrid');
    grid.innerHTML = '';
    
    if(currentCustomFeatures.length === 0) {
        grid.innerHTML = '<p style="color:#64748b; font-size:0.85rem; padding: 10px;">لم يتم إضافة أي مميزات مخصصة حتى الآن.</p>';
        return;
    }

    currentCustomFeatures.forEach((feat, index) => {
        grid.innerHTML += `
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.05); padding: 0.6rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 0.5rem;">
                <span style="color: #fff; font-size: 0.95rem;">- ${feat}</span>
                <button type="button" onclick="removeCustomFeature(${index})" style="background: transparent; border: none; color: #ef4444; cursor: pointer;" title="مسح الميزة">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
        `;
    });
}

window.saveUserSubscription = function() {
    let users = JSON.parse(localStorage.getItem('luxen_all_users')) || [];
    let select = document.getElementById('userSubPlanSelect');
    let expiry = document.getElementById('userSubExpiryInput').value;
    
    let userIndex = users.findIndex(u => u.username === currentSubEditUsername);
    if (userIndex === -1) return;

    if (select.value === "") {
        users[userIndex].subscription = null;
        addAuditLog('إدارة الاشتراكات', `تم إلغاء اشتراك المستخدم (${currentSubEditUsername}) وتحويله مجاني.`);
    } else {
        if (!expiry) return alert('يرجى تحديد تاريخ انتهاء الصلاحية.');

        users[userIndex].subscription = {
            planId: select.value,
            planName: select.value,
            expiryDate: expiry,
            features: currentCustomFeatures, 
            status: 'نشط'
        };
        addAuditLog('إدارة الاشتراكات', `تم ربط المستخدم (${currentSubEditUsername}) بباقة (${select.value}).`);
    }

    localStorage.setItem('luxen_all_users', JSON.stringify(users));
    closeModal('userSubscriptionModal');
    renderUsers();
};

// ==========================================
// 11. عرض المستخدمين ونظام البحث الفوري
// ==========================================
window.filterUsers = function() {
    const query = document.getElementById('userSearchInput').value.toLowerCase();
    renderUsers(query);
};

function renderUsers(searchQuery = '') {
    checkSubscriptionsValidity(); 
    const users = JSON.parse(localStorage.getItem('luxen_all_users')) || [];
    const tbody = document.getElementById('usersTableBody');
    
    document.querySelector('.total-users .stat-card-value').textContent = users.length;
    document.querySelector('.active-users .stat-card-value').textContent = users.filter(u => u.status === 'نشط').length;
    document.querySelector('.totally-inactive-users .stat-card-value').textContent = users.filter(u => u.status === 'غير نشط').length;
    document.querySelector('.inactive-users .stat-card-value').textContent = users.filter(u => u.status === 'محظور').length;

    let filteredUsers = users;
    if (searchQuery !== '') {
        filteredUsers = users.filter(u => 
            (u.name && u.name.toLowerCase().includes(searchQuery)) ||
            (u.username && u.username.toLowerCase().includes(searchQuery)) ||
            (u.userCode && u.userCode.toLowerCase().includes(searchQuery))
        );
    }

    if(filteredUsers.length > 0 && tbody) {
        tbody.innerHTML = '';
        filteredUsers.forEach(user => {
            const firstLetter = user.name ? user.name.charAt(0).toUpperCase() : 'U';
            const displayCode = user.userCode || '---';
            
            let actionButtons = '';
            if (user.username === 'adminluxentech@gmail.com') {
                const isAct = user.status === 'نشط';
                const btnText = isAct ? 'إلغاء التفعيل' : 'تفعيل';
                actionButtons = `
                    <button class="action-btn" style="color: #f59e0b; background: rgba(245, 158, 11, 0.1);" onclick="toggleFounderStatus()">
                        <span>${btnText}</span>
                    </button>
                `;
            } else {
                actionButtons = `
                    <button class="action-btn profile-btn" onclick="openProfile('${user.username}')">الملف الشخصي</button>
                    <button class="action-btn details-btn" onclick="openSubscriptionModal('${user.username}')">الاشتراك</button>
                    <button class="action-btn block-btn" onclick="blockUser('${user.username}')">${user.status === 'محظور' ? 'فك حظر' : 'حظر'}</button>
                    <button class="action-btn delete-btn" onclick="deleteUser('${user.username}')">مسح</button>
                `;
            }

            const nameColor = user.username === 'adminluxentech@gmail.com' ? '#00f3ff; text-shadow: 0 0 8px #00f3ff;' : '#fff';
            const statusColor = user.status === 'نشط' ? '#10b981' : (user.status === 'غير نشط' ? '#94a3b8' : '#ef4444');
            const statusBg = user.status === 'نشط' ? 'rgba(16, 185, 129, 0.1)' : (user.status === 'غير نشط' ? 'rgba(148, 163, 184, 0.1)' : 'rgba(239, 68, 68, 0.1)');

            const sub = user.subscription || { planName: 'حساب مجاني', status: '---', expiryDate: '---' };
            let subColor = '#94a3b8';
            if (sub.status === 'نشط') subColor = '#00f3ff';
            if (sub.status === 'منتهي') subColor = '#ef4444';
            const expiryText = sub.expiryDate !== '---' ? `ينتهي: ${sub.expiryDate}` : 'باقة مجانية';

            tbody.innerHTML += `
                <tr class="main-row">
                    <td>
                        <span class="badge user-code-badge" onclick="editUserCode('${user.username}', '${displayCode}')" title="انقر هنا لتعديل الكود">
                            ${displayCode}
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                        </span>
                    </td>
                    <td><div class="user-cell"><div class="user-avatar-sm">${firstLetter}</div><span style="color: ${nameColor}; font-weight: bold;">${user.name}</span></div></td>
                    <td><span style="color:#cbd5e1;">${user.username || '----'}</span></td>
                    <td>
                        <div class="sub-cell">
                            <span style="color:${subColor}; font-weight:800; font-size:0.95rem;">${sub.planName}</span>
                            <span style="font-size:0.8rem; color:#94a3b8;">| ${expiryText}</span>
                        </div>
                    </td>
                    <td><span class="badge" style="background: ${statusBg}; color: ${statusColor};">${user.status}</span></td>
                    <td class="actions-cell">${actionButtons}</td>
                </tr>
            `;
        });
    } else if(tbody) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 3rem; color: #94a3b8;">لا يوجد مستخدمين مطابقين للبحث.</td></tr>`;
    }
}

// ==========================================
// 12. إدارة حسابات المشرفين (Admins Management)
// ==========================================
function renderAdmins() {
    const admins = JSON.parse(localStorage.getItem('luxen_admin_accounts')) || [];
    const tbody = document.getElementById('adminsTableBody');
    if(tbody) {
        if (admins.length > 0) {
            tbody.innerHTML = '';
            admins.forEach(admin => {
                const permsCount = admin.permissions.length;
                tbody.innerHTML += `
                    <tr class="main-row">
                        <td><span style="font-weight: 700; color: #a855f7;">${admin.username}</span></td>
                        <td><span style="letter-spacing: 2px;">${admin.password}</span></td>
                        <td><span class="badge" style="background: rgba(168, 85, 247, 0.1); color: #a855f7; border: 1px solid rgba(168, 85, 247, 0.3);">يمتلك ${permsCount} صلاحيات</span></td>
                        <td>${admin.date}</td>
                        <td class="actions-cell">
                            <button class="action-btn" style="color: #00f3ff; background: rgba(0, 243, 255, 0.1);" onclick="editAdmin(${admin.id})">تعديل</button>
                            <button class="action-btn delete-btn" onclick="deleteAdmin(${admin.id})">مسح</button>
                        </td>
                    </tr>
                `;
            });
        } else {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem; color: #94a3b8;">لا توجد حسابات مشرفين فرعية حالياً.</td></tr>`;
        }
    }
}

function openAddAdminModal() {
    currentEditAdminId = null;
    document.getElementById('adminUsernameInput').value = '';
    document.getElementById('adminPasswordInput').value = '';
    document.querySelectorAll('.admin-perm-cb').forEach(cb => cb.checked = false);
    document.getElementById('adminModalTitle').textContent = 'إنشاء حساب مشرف جديد';
    document.getElementById('adminSubmitBtn').textContent = 'إنشاء الحساب';
    openModal('addAdminModal');
}

function submitAdmin() {
    const username = document.getElementById('adminUsernameInput').value.trim();
    const password = document.getElementById('adminPasswordInput').value.trim();
    const permsCheckboxes = document.querySelectorAll('.admin-perm-cb:checked');
    const permissions = Array.from(permsCheckboxes).map(cb => cb.value);

    if(!username || !password) return alert('يرجى إدخال اسم المستخدم وكلمة المرور.');
    if(permissions.length === 0) return alert('يجب اختيار صلاحية واحدة على الأقل للمشرف.');

    let admins = JSON.parse(localStorage.getItem('luxen_admin_accounts')) || [];
    
    if(currentEditAdminId) {
        const index = admins.findIndex(a => a.id === currentEditAdminId);
        if(index !== -1) {
            admins[index].username = username;
            admins[index].password = password;
            admins[index].permissions = permissions;
        }
        addAuditLog('تعديل مشرف', `تم تعديل صلاحيات المشرف (${username})`);
    } else {
        if(admins.find(a => a.username === username)) return alert('اسم المستخدم هذا موجود بالفعل!');
        admins.push({ id: Date.now(), username, password, permissions, date: new Date().toLocaleDateString('ar-EG') });
        addAuditLog('إضافة مشرف', `تم إنشاء حساب مشرف جديد (${username})`);
    }

    localStorage.setItem('luxen_admin_accounts', JSON.stringify(admins));
    closeModal('addAdminModal');
    renderAdmins();
}

function editAdmin(id) {
    const admins = JSON.parse(localStorage.getItem('luxen_admin_accounts')) || [];
    const admin = admins.find(a => a.id === id);
    if(admin) {
        currentEditAdminId = id;
        document.getElementById('adminUsernameInput').value = admin.username;
        document.getElementById('adminPasswordInput').value = admin.password;
        document.querySelectorAll('.admin-perm-cb').forEach(cb => {
            cb.checked = admin.permissions.includes(cb.value);
        });
        document.getElementById('adminModalTitle').textContent = 'تعديل حساب المشرف';
        document.getElementById('adminSubmitBtn').textContent = 'حفظ التعديلات';
        openModal('addAdminModal');
    }
}

function deleteAdmin(id) {
    if(confirm('هل أنت متأكد من حذف حساب المشرف هذا نهائياً؟')) {
        let admins = JSON.parse(localStorage.getItem('luxen_admin_accounts')) || [];
        admins = admins.filter(a => a.id !== id);
        localStorage.setItem('luxen_admin_accounts', JSON.stringify(admins));
        addAuditLog('حذف مشرف', 'تم حذف حساب مشرف نهائياً');
        renderAdmins();
    }
}

// ==========================================
// 13. الأجهزة المتصلة
// ==========================================
function renderDevices() {
    let devices = JSON.parse(localStorage.getItem('luxen_devices')) || [
        { id: 1, browser: 'Chrome / Windows 11', ip: '192.168.1.5', lastSeen: 'الآن', isCurrent: true },
        { id: 2, browser: 'Safari / iPhone 14', ip: '10.0.0.12', lastSeen: 'منذ ساعتين', isCurrent: false },
        { id: 3, browser: 'Edge / MacOS', ip: '172.16.254.1', lastSeen: 'منذ يومين', isCurrent: false }
    ];
    localStorage.setItem('luxen_devices', JSON.stringify(devices));

    const tbody = document.getElementById('devicesTableBody');
    if (tbody) {
        tbody.innerHTML = '';
        devices.forEach(dev => {
            const statusHtml = dev.isCurrent 
                ? `<span class="badge" style="background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3);">هذا الجهاز (نشط)</span>`
                : `<span class="badge" style="background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3);">متصل مسبقاً</span>`;
            
            const actionHtml = dev.isCurrent 
                ? `<span style="color: #94a3b8; font-size: 0.85rem;">لا يمكن الحذف</span>`
                : `<button class="action-btn delete-btn" onclick="logoutSingleDevice(${dev.id})">تسجيل خروج</button>`;

            tbody.innerHTML += `
                <tr class="main-row">
                    <td><span style="font-weight: 700; color: #fff;">${dev.browser}</span></td>
                    <td dir="ltr" style="text-align: right; color: #38bdf8;">${dev.ip}</td>
                    <td><span style="color: #94a3b8;">${dev.lastSeen}</span></td>
                    <td>${statusHtml}</td>
                    <td class="actions-cell">${actionHtml}</td>
                </tr>
            `;
        });
    }
}

function logoutSingleDevice(id) {
    if(confirm('هل تريد تسجيل خروج هذا الجهاز؟ سيحتاج المستخدم لتسجيل الدخول مرة أخرى.')) {
        let devices = JSON.parse(localStorage.getItem('luxen_devices')) || [];
        devices = devices.filter(d => d.id !== id);
        localStorage.setItem('luxen_devices', JSON.stringify(devices));
        addAuditLog('إدارة الأجهزة', 'تم إنهاء جلسة اتصال لجهاز عن بُعد.');
        renderDevices();
    }
}

function logoutAllDevices() {
    if(confirm('تحذير: هذا سيقوم بتسجيل الخروج من كافة الأجهزة الأخرى. هل أنت متأكد؟')) {
        let devices = JSON.parse(localStorage.getItem('luxen_devices')) || [];
        devices = devices.filter(d => d.isCurrent);
        localStorage.setItem('luxen_devices', JSON.stringify(devices));
        addAuditLog('إدارة الأجهزة', 'تم تسجيل الخروج الإجباري من جميع الأجهزة الأخرى.');
        renderDevices();
        alert('تم تسجيل الخروج من جميع الأجهزة الأخرى بنجاح.');
    }
}

// ==========================================
// 14. الأسعار والباقات (العامة) والكوبونات
// ==========================================
function renderPlans() {
    const plans = JSON.parse(localStorage.getItem('luxen_subscription_plans')) || [];
    const tbody = document.getElementById('plansTableBody');
    if(tbody) {
        if (plans.length > 0) {
            tbody.innerHTML = '';
            plans.forEach(plan => {
                const featuresList = plan.features.split('\n').map(f => `<li>${f}</li>`).join('');
                tbody.innerHTML += `
                    <tr class="main-row">
                        <td><span style="font-weight: 700; color: #fff;">${plan.name}</span></td>
                        <td><span style="color: #10b981; font-weight: 800; font-size: 1.1rem;">$${plan.price}</span></td>
                        <td><span class="badge" style="background: rgba(56, 189, 248, 0.1); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3);">${plan.duration}</span></td>
                        <td><ul style="margin:0; padding-right:15px; color:#94a3b8; font-size:0.85rem; max-height: 80px; overflow-y:auto; direction: rtl;">${featuresList}</ul></td>
                        <td class="actions-cell">
                            <button class="action-btn" style="color: #00f3ff; background: rgba(0, 243, 255, 0.1);" onclick="editPlan(${plan.id})">تعديل</button>
                            <button class="action-btn delete-btn" onclick="deletePlan(${plan.id})">مسح</button>
                        </td>
                    </tr>
                `;
            });
        } else {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem; color: #94a3b8;">لا توجد باقات أسعار مضافة حتى الآن.</td></tr>`;
        }
    }
}

function openAddPlanModal() {
    currentEditPlanId = null;
    document.getElementById('planNameInput').value = '';
    document.getElementById('planPriceInput').value = '';
    document.getElementById('planDurationInput').value = 'شهري';
    document.getElementById('planFeaturesInput').value = '';
    document.getElementById('planModalTitle').textContent = 'إضافة باقة جديدة';
    document.getElementById('planSubmitBtn').textContent = 'حفظ الباقة';
    openModal('addPlanModal');
}

function submitPlan() {
    const name = document.getElementById('planNameInput').value.trim();
    const price = document.getElementById('planPriceInput').value;
    const duration = document.getElementById('planDurationInput').value;
    const features = document.getElementById('planFeaturesInput').value.trim();

    if(!name || !price || !features) return alert('يرجى تعبئة كافة بيانات الباقة.');

    let plans = JSON.parse(localStorage.getItem('luxen_subscription_plans')) || [];
    
    if(currentEditPlanId) {
        const index = plans.findIndex(p => p.id === currentEditPlanId);
        if(index !== -1) {
            plans[index] = { ...plans[index], name, price, duration, features };
        }
        addAuditLog('تعديل باقة', `تم تعديل الباقة (${name})`);
    } else {
        plans.push({ id: Date.now(), name, price, duration, features });
        addAuditLog('إضافة باقة', `تم إضافة باقة جديدة باسم (${name})`);
    }

    localStorage.setItem('luxen_subscription_plans', JSON.stringify(plans));
    closeModal('addPlanModal');
    renderPlans();
}

function editPlan(id) {
    const plans = JSON.parse(localStorage.getItem('luxen_subscription_plans')) || [];
    const plan = plans.find(p => p.id === id);
    if(plan) {
        currentEditPlanId = id;
        document.getElementById('planNameInput').value = plan.name;
        document.getElementById('planPriceInput').value = plan.price;
        document.getElementById('planDurationInput').value = plan.duration;
        document.getElementById('planFeaturesInput').value = plan.features;
        document.getElementById('planModalTitle').textContent = 'تعديل الباقة';
        document.getElementById('planSubmitBtn').textContent = 'حفظ التعديلات';
        openModal('addPlanModal');
    }
}

function deletePlan(id) {
    if(confirm('هل أنت متأكد من مسح هذه الباقة؟')) {
        let plans = JSON.parse(localStorage.getItem('luxen_subscription_plans')) || [];
        plans = plans.filter(p => p.id !== id);
        localStorage.setItem('luxen_subscription_plans', JSON.stringify(plans));
        addAuditLog('مسح باقة', 'تم مسح إحدى الباقات من النظام');
        renderPlans();
    }
}

function submitPromoCode() {
    const code = document.getElementById('promoCodeInput').value.trim().toUpperCase();
    const type = document.getElementById('promoTypeInput').value;
    const value = document.getElementById('promoValueInput').value;
    const expiry = document.getElementById('promoExpiryInput').value;
    const limit = document.getElementById('promoLimitInput').value;

    if(!code || !value || !expiry || !limit) return alert('يرجى تعبئة جميع الحقول لإنشاء الكوبون.');
    let promos = JSON.parse(localStorage.getItem('luxen_promo_codes')) || [];
    if(promos.some(p => p.code === code)) return alert('كود الخصم هذا موجود بالفعل!');

    promos.push({ id: Date.now(), code: code, type: type, value: Number(value), expiry: expiry, limit: Number(limit), usedCount: 0, status: 'فعال' });
    localStorage.setItem('luxen_promo_codes', JSON.stringify(promos));
    
    addAuditLog('إضافة كوبون', `تم إصدار كوبون خصم جديد باسم (${code})`);
    closeModal('addPromoModal');
    renderPromoCodes();
}

function renderPromoCodes() {
    const promos = JSON.parse(localStorage.getItem('luxen_promo_codes')) || [];
    const tbody = document.getElementById('promoTableBody');
    if (promos.length > 0 && tbody) {
        tbody.innerHTML = '';
        const today = new Date().toISOString().split('T')[0];
        promos.reverse().forEach(promo => {
            let isExpired = promo.expiry < today;
            let isDepleted = promo.usedCount >= promo.limit;
            let currentStatus = (isExpired || isDepleted) ? 'منتهي' : promo.status;
            let statusColor = currentStatus === 'فعال' ? '#10b981' : '#ef4444';
            let valueText = promo.type === 'percentage' ? `${promo.value}%` : `$${promo.value}`;

            tbody.innerHTML += `
                <tr class="main-row">
                    <td><span style="font-weight: 800; color: #10b981; letter-spacing: 1px; background: rgba(16, 185, 129, 0.1); padding: 0.3rem 0.6rem; border-radius: 6px;">${promo.code}</span></td>
                    <td><span style="color: #fff; font-weight: 600;">خصم ${valueText}</span></td>
                    <td dir="ltr" style="text-align: right;">${promo.usedCount} / ${promo.limit}</td>
                    <td><span style="${isExpired ? 'color: #ef4444; text-decoration: line-through;' : ''}">${promo.expiry}</span></td>
                    <td><span class="badge" style="background: ${statusColor}15; color: ${statusColor}; border: 1px solid ${statusColor}40;">${currentStatus}</span></td>
                    <td class="actions-cell">
                        <button class="action-btn delete-btn" onclick="deletePromo(${promo.id}, '${promo.code}')">إيقاف ومسح</button>
                    </td>
                </tr>
            `;
        });
    } else if(tbody) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem; color: #94a3b8;">لا توجد كوبونات خصم مسجلة في النظام.</td></tr>`;
    }
}

function deletePromo(id, code) {
    if(confirm(`هل أنت متأكد من إيقاف وحذف الكوبون ${code}؟`)) {
        let promos = JSON.parse(localStorage.getItem('luxen_promo_codes')) || [];
        promos = promos.filter(p => p.id !== id);
        localStorage.setItem('luxen_promo_codes', JSON.stringify(promos));
        addAuditLog('حذف كوبون', `تم حذف وإيقاف الكوبون (${code})`);
        renderPromoCodes();
    }
}

// ==========================================
// 15. الشركاء (Cards Grid System)
// ==========================================
function renderPartners() {
    const partners = JSON.parse(localStorage.getItem('luxen_partners')) || [];
    const container = document.getElementById('partnersGridContainer');
    if(!container) return;
    
    // خريطة لعرض اسم القسم الجميل ولونه والتنسيق الخاص به
    const categoryData = {
        'community': { name: 'مجتمع طلابي', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)' },
        'initiative': { name: 'مبادرة', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
        'competition': { name: 'مسابقة', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
        'event': { name: 'نادي علمي', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
        // دعم المسميات القديمة
        'communities': { name: 'مجتمع طلابي', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)' },
        'initiatives': { name: 'مبادرة', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
        'competitions': { name: 'مسابقة', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
        'clubs_events': { name: 'نادي علمي', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' }
    };

    if (partners.length > 0) {
        container.innerHTML = '';
        partners.slice().reverse().forEach(p => {
            const cat = categoryData[p.type] || { name: p.type, color: '#00f3ff', bg: 'rgba(0, 243, 255, 0.1)' };
            
            container.innerHTML += `
                <div class="note-card" style="align-items: center; text-align: center; border-top-color: ${cat.color};">
                    <div style="width: 76px; height: 76px; border-radius: 16px; overflow: hidden; margin-bottom: 0.5rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center;">
                        <img src="${p.logo}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'">
                    </div>
                    <h3 style="color: #fff; margin: 0; font-size: 1.15rem; font-weight: 800;">${p.name}</h3>
                    <span class="badge" style="background: ${cat.bg}; color: ${cat.color}; border: 1px solid ${cat.color}40; margin-bottom: 1rem; padding: 0.3rem 0.8rem;">${cat.name}</span>
                    <div style="display: flex; gap: 0.8rem; width: 100%; justify-content: center; margin-top: auto; border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 1rem;">
                        <button class="action-btn" style="color: #00f3ff; background: rgba(0, 243, 255, 0.1); width: 100%;" onclick="editPartner(${p.id})">تعديل</button>
                        <button class="action-btn delete-btn" style="width: 100%;" onclick="deletePartner(${p.id})">حذف</button>
                    </div>
                </div>
            `;
        });
    } else {
        container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #94a3b8; font-size: 1.1rem; background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">لا يوجد شركاء مسجلين حالياً. انقر على زر إضافة شريك جديد.</div>`;
    }
}

function openAddPartnerModal() {
    currentEditPartnerId = null;
    document.getElementById('partnerNameInput').value = '';
    document.getElementById('partnerTypeInput').value = 'community';
    document.getElementById('partnerLogoInput').value = '';
    document.getElementById('partnerModalTitle').textContent = 'إضافة شريك جديد';
    document.getElementById('submitPartnerBtnText').textContent = 'إضافة الشريك';
    openModal('addPartnerModal');
}

function submitPartner() {
    const name = document.getElementById('partnerNameInput').value.trim();
    const type = document.getElementById('partnerTypeInput').value; 
    const logo = document.getElementById('partnerLogoInput').value.trim();

    if (!name || !logo || !type) return alert('يرجى تعبئة جميع الحقول المطلوبة.');

    let partners = JSON.parse(localStorage.getItem('luxen_partners')) || [];
    
    if (currentEditPartnerId) {
        const index = partners.findIndex(p => p.id === currentEditPartnerId);
        if (index !== -1) {
            partners[index].name = name;
            partners[index].type = type;
            partners[index].logo = logo;
        }
        addAuditLog('تعديل شريك', `تم تعديل بيانات الشريك: ${name}`);
    } else {
        partners.push({ id: Date.now(), name, type, logo, date: new Date().toLocaleDateString('ar-EG') });
        addAuditLog('إضافة شريك', `تم إضافة شريك جديد (${name}) إلى النظام`);
    }
    
    localStorage.setItem('luxen_partners', JSON.stringify(partners));
    closeModal('addPartnerModal');
    renderPartners();
}

function editPartner(id) {
    const partners = JSON.parse(localStorage.getItem('luxen_partners')) || [];
    const partner = partners.find(p => p.id === id);
    if (partner) {
        currentEditPartnerId = id;
        document.getElementById('partnerNameInput').value = partner.name;
        
        const typeInput = document.getElementById('partnerTypeInput');
        if(Array.from(typeInput.options).some(opt => opt.value === partner.type)) {
            typeInput.value = partner.type;
        } else {
            typeInput.value = 'community'; 
        }

        document.getElementById('partnerLogoInput').value = partner.logo;
        document.getElementById('partnerModalTitle').textContent = 'تعديل بيانات الشريك';
        document.getElementById('submitPartnerBtnText').textContent = 'حفظ التعديلات';
        openModal('addPartnerModal');
    }
}

function deletePartner(id) {
    if (confirm('هل أنت متأكد من حذف هذا الشريك نهائياً؟')) {
        let partners = JSON.parse(localStorage.getItem('luxen_partners')) || [];
        partners = partners.filter(p => p.id !== id);
        localStorage.setItem('luxen_partners', JSON.stringify(partners));
        addAuditLog('حذف شريك', 'تم حذف أحد شركاء النجاح من المنصة');
        renderPartners();
    }
}

function renderCollabsAndConsults() {
    const collabsData = [
        { id: 1, name: 'عمر أيمن', email: 'omar@example.com', org: 'جامعة القاهرة', type: 'مجتمع تعليمي', website: 'https://cu.edu.eg', social: 'linkedin.com/in/omar', message: 'نرغب في التعاون لتقديم ورشة عمل للطلاب حول أساسيات الذكاء الاصطناعي وتطبيقاته في المشاريع التعليمية.', date: new Date().toLocaleDateString('ar-EG') },
        { id: 2, name: 'أحمد محمود', email: 'ahmed@startup.io', org: 'تيك فالي', type: 'شركة / Startup', website: 'https://techvalley.io', social: 'twitter.com/techvalley', message: 'نبحث عن شراكة تقنية لتطوير منصة جديدة تخدم المؤسسات الصغيرة وربطها بأنظمة سحابية.', date: new Date().toLocaleDateString('ar-EG') }
    ];

    const consultsData = [
        { id: 1, name: 'سارة علي', email: 'sara@test.com', phone: '+20 1000000000', field: 'بناء وتكامل أنظمة الذكاء الاصطناعي', budget: 'شركة ناشئة / فكرة أولية', details: 'لدينا فكرة لتطبيق ذكاء اصطناعي ونحتاج استشارة في الهيكلة البرمجية المطلوبة واختيار النماذج اللغوية الأنسب للبدء.', date: new Date().toLocaleDateString('ar-EG') },
        { id: 2, name: 'محمد حسن', email: 'mohamed@enterprise.com', phone: '+20 1111111111', field: 'تطوير البرمجيات والمواقع الذكية', budget: 'مؤسسة ضخمة / Enterprise', details: 'نحتاج إلى نقل أنظمتنا الحالية إلى السحابة مع تحسين الأداء وحل مشكلة البطء في تحميل قواعد البيانات الضخمة التي نواجهها مؤخراً.', date: new Date().toLocaleDateString('ar-EG') }
    ];

    const collabTbody = document.getElementById('collabTableBody');
    const consultTbody = document.getElementById('consultTableBody');

    if(collabTbody) {
        collabTbody.innerHTML = '';
        if(collabsData.length > 0) {
            collabsData.forEach(item => {
                collabTbody.innerHTML += `
                    <tr class="main-row">
                        <td><div class="user-cell"><div class="user-avatar-sm" style="background: rgba(0, 243, 255, 0.1); color: #00f3ff;">${item.name.charAt(0)}</div><span>${item.name}</span></div></td>
                        <td>${item.org}</td>
                        <td><span style="color: #00f3ff; font-weight:600;">${item.type}</span></td>
                        <td>${item.date}</td>
                        <td class="actions-cell">
                            <button class="action-btn details-btn" onclick="toggleRowDetails('collab-${item.id}')">التفاصيل</button>
                        </td>
                    </tr>
                    <tr id="details-collab-${item.id}" class="details-row" style="display: none;">
                        <td colspan="5">
                            <div class="details-expanded-content">
                                <div class="details-grid">
                                    <p><strong>البريد الإلكتروني:</strong> ${item.email}</p>
                                    <p><strong>الموقع الإلكتروني:</strong> <a href="${item.website}" target="_blank" style="color: #00f3ff;">${item.website}</a></p>
                                    <p><strong>وسائل التواصل الاجتماعي:</strong> <span dir="ltr">${item.social}</span></p>
                                </div>
                                <div class="details-message"><p><strong>نبذة عن التعاون الكاملة:</strong></p><p class="message-text">${item.message}</p></div>
                            </div>
                        </td>
                    </tr>
                `;
            });
        }
    }

    if(consultTbody) {
        consultTbody.innerHTML = '';
        if(consultsData.length > 0) {
            consultsData.forEach(item => {
                consultTbody.innerHTML += `
                    <tr class="main-row">
                        <td><div class="user-cell"><div class="user-avatar-sm" style="background: rgba(255, 0, 234, 0.1); color: #ff00ea;">${item.name.charAt(0)}</div><span>${item.name}</span></div></td>
                        <td><span style="color: #ff00ea; font-weight:600;">${item.field}</span></td>
                        <td>${item.budget}</td>
                        <td>${item.date}</td>
                        <td class="actions-cell">
                            <button class="action-btn details-btn" onclick="toggleRowDetails('consult-${item.id}')">التفاصيل</button>
                        </td>
                    </tr>
                    <tr id="details-consult-${item.id}" class="details-row" style="display: none;">
                        <td colspan="5">
                            <div class="details-expanded-content">
                                <div class="details-grid">
                                    <p><strong>البريد الإلكتروني:</strong> ${item.email}</p>
                                    <p><strong>رقم الهاتف:</strong> <span class="user-phone" dir="ltr">${item.phone}</span></p>
                                </div>
                                <div class="details-message"><p><strong>تفاصيل المشروع / المشكلة كاملة:</strong></p><p class="message-text">${item.details}</p></div>
                            </div>
                        </td>
                    </tr>
                `;
            });
        }
    }
}

// ==========================================
// 16. الأسئلة الشائعة (FAQs)
// ==========================================
window.changeFaqStatus = function(id, newStatus) {
    let faqs = JSON.parse(localStorage.getItem('luxen_faqs')) || [];
    let index = faqs.findIndex(f => f.id === id);
    if(index !== -1) {
        faqs[index].status = newStatus;
        localStorage.setItem('luxen_faqs', JSON.stringify(faqs));
        addAuditLog('تحديث سؤال', `تم تغيير حالة السؤال إلى: ${newStatus}`);
        renderDashboardFaqs();
    }
};

window.setGlobalFaqStatus = function(newStatus) {
    if(confirm(`هل أنت متأكد من تحويل جميع الأسئلة الشائعة إلى حالة: "${newStatus}"؟`)) {
        let faqs = JSON.parse(localStorage.getItem('luxen_faqs')) || [];
        faqs.forEach(f => f.status = newStatus);
        localStorage.setItem('luxen_faqs', JSON.stringify(faqs));
        addAuditLog('تحديث شامل للأسئلة', `تم تحويل جميع الأسئلة إلى: ${newStatus}`);
        renderDashboardFaqs();
    }
};

function renderDashboardFaqs() {
    const faqs = JSON.parse(localStorage.getItem('luxen_faqs')) || [];
    const tbody = document.getElementById('faqTableBody');
    if (faqs.length > 0) {
        tbody.innerHTML = '';
        faqs.slice().reverse().forEach(faq => {
            let statusColor = '#10b981'; 
            let statusBg = 'rgba(16, 185, 129, 0.1)';
            
            if (faq.status === 'مخفي') {
                statusColor = '#94a3b8';
                statusBg = 'rgba(148, 163, 184, 0.1)';
            } else if (faq.status === 'قريباً') {
                statusColor = '#f59e0b';
                statusBg = 'rgba(245, 158, 11, 0.1)';
            } else if (faq.status !== 'نشط') {
                faq.status = 'نشط'; 
            }

            tbody.innerHTML += `
                <tr class="main-row">
                    <td style="max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${faq.question}">${faq.question}</td>
                    <td>${faq.date}</td>
                    <td><span class="badge" style="background: ${statusBg}; color: ${statusColor}; border: 1px solid ${statusColor}40;">${faq.status}</span></td>
                    <td class="actions-cell">
                        <button class="action-btn" style="color: #94a3b8; background: rgba(148, 163, 184, 0.1);" title="إخفاء" onclick="changeFaqStatus(${faq.id}, 'مخفي')">إخفاء</button>
                        <button class="action-btn" style="color: #10b981; background: rgba(16, 185, 129, 0.1);" title="إظهار" onclick="changeFaqStatus(${faq.id}, 'نشط')">إظهار</button>
                        <button class="action-btn" style="color: #facc15; background: rgba(250, 204, 21, 0.1);" title="قريباً" onclick="changeFaqStatus(${faq.id}, 'قريباً')">قريباً</button>
                        
                        <div style="width: 1px; height: 20px; background: rgba(255,255,255,0.1); margin: 0 5px;"></div>
                        
                        <button class="action-btn" style="color: #00f3ff; background: rgba(0, 243, 255, 0.1);" onclick="editFaq(${faq.id})">تعديل</button>
                        <button class="action-btn delete-btn" onclick="deleteFaq(${faq.id})">حذف</button>
                    </td>
                </tr>`;
        });
    } else {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 2rem; color: #94a3b8;">لا توجد أسئلة مضافة حالياً في النظام.</td></tr>`;
    }
}

function submitFaq() {
    const question = document.getElementById('faqQuestionInput').value.trim();
    const answer = document.getElementById('faqAnswerInput').value.trim();
    if (!question || !answer) return alert('يرجى تعبئة جميع الحقول المطلوبة.');
    let faqs = JSON.parse(localStorage.getItem('luxen_faqs')) || [];
    if (currentEditFaqId) {
        const index = faqs.findIndex(f => f.id === currentEditFaqId);
        if (index !== -1) {
            faqs[index].question = question;
            faqs[index].answer = answer.replace(/\n/g, '<br>');
            faqs[index].status = faqs[index].status || 'نشط';
        }
        addAuditLog('تعديل سؤال', 'تم تعديل سؤال شائع في المنصة');
    } else {
        faqs.push({ id: Date.now(), question, answer: answer.replace(/\n/g, '<br>'), date: new Date().toLocaleDateString('ar-EG'), status: 'نشط' });
        addAuditLog('إضافة سؤال', 'تم إضافة سؤال شائع جديد');
    }
    localStorage.setItem('luxen_faqs', JSON.stringify(faqs));
    closeModal('addFaqModal');
    renderDashboardFaqs();
}

function editFaq(id) {
    const faqs = JSON.parse(localStorage.getItem('luxen_faqs')) || [];
    const faq = faqs.find(f => f.id === id);
    if (faq) {
        currentEditFaqId = id;
        document.getElementById('faqQuestionInput').value = faq.question;
        document.getElementById('faqAnswerInput').value = faq.answer.replace(/<br>/g, '\n');
        openModal('addFaqModal');
    }
}

function deleteFaq(id) {
    if (confirm('هل أنت متأكد من حذف هذا السؤال بشكل نهائي؟')) {
        let faqs = JSON.parse(localStorage.getItem('luxen_faqs')) || [];
        faqs = faqs.filter(f => f.id !== id);
        localStorage.setItem('luxen_faqs', JSON.stringify(faqs));
        addAuditLog('حذف سؤال', 'تم حذف سؤال من قسم الأسئلة الشائعة');
        renderDashboardFaqs();
    }
}

// ==========================================
// 17. الملاحظات الذكية (Smart Notes)
// ==========================================
function renderNotes() {
    const notes = JSON.parse(localStorage.getItem('luxen_notes')) || [];
    const container = document.getElementById('notesGridContainer');
    
    if (notes.length > 0) {
        container.innerHTML = '';
        notes.sort((a, b) => b.isPinned - a.isPinned || b.id - a.id).forEach(note => {
            const priorityClass = note.priority + '-priority';
            const pinClass = note.isPinned ? 'active' : '';
            
            container.innerHTML += `
                <div class="note-card ${priorityClass} ${note.isPinned ? 'pinned' : ''}">
                    <button class="note-pin-btn ${pinClass}" onclick="toggleNotePin(${note.id})" title="تثبيت / إلغاء التثبيت">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="${note.isPinned ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 11.2V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3v5.2a2 2 0 0 1-1.11 1.35l-1.78.9A2 2 0 0 0 5 15.24Z"/></svg>
                    </button>
                    <div class="note-header">
                        <h4>${note.title}</h4>
                        <span class="note-date">${note.date}</span>
                    </div>
                    <p class="note-content">${note.content}</p>
                    <div class="note-actions">
                        <button class="action-btn" style="color: #00f3ff; background: rgba(0, 243, 255, 0.1);" onclick="editNote(${note.id})">تعديل</button>
                        <button class="action-btn delete-btn" onclick="deleteNote(${note.id})">مسح</button>
                    </div>
                </div>
            `;
        });
    } else {
        container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #94a3b8; font-size: 1.1rem;">لا توجد ملاحظات حالياً. انقر على الزر بالأعلى لإضافة واحدة.</div>`;
    }
}

function openAddNoteModal() {
    currentEditNoteId = null;
    document.getElementById('noteTitleInput').value = '';
    document.getElementById('notePriorityInput').value = 'medium';
    document.getElementById('noteContentInput').value = '';
    document.getElementById('noteModalTitle').textContent = 'إضافة ملاحظة جديدة';
    document.getElementById('noteSubmitBtn').textContent = 'حفظ الملاحظة';
    openModal('addNoteModal');
}

function submitNote() {
    const title = document.getElementById('noteTitleInput').value.trim();
    const priority = document.getElementById('notePriorityInput').value;
    const content = document.getElementById('noteContentInput').value.trim();

    if (!title || !content) return alert('يرجى إدخال عنوان وتفاصيل الملاحظة.');

    let notes = JSON.parse(localStorage.getItem('luxen_notes')) || [];
    
    if (currentEditNoteId) {
        const index = notes.findIndex(n => n.id === currentEditNoteId);
        if (index !== -1) {
            notes[index].title = title;
            notes[index].priority = priority;
            notes[index].content = content;
        }
    } else {
        notes.push({ 
            id: Date.now(), 
            title, 
            priority, 
            content, 
            date: new Date().toLocaleString('ar-EG', { hour12: true }), 
            isPinned: false 
        });
    }

    localStorage.setItem('luxen_notes', JSON.stringify(notes));
    closeModal('addNoteModal');
    renderNotes();
}

function editNote(id) {
    const notes = JSON.parse(localStorage.getItem('luxen_notes')) || [];
    const note = notes.find(n => n.id === id);
    if (note) {
        currentEditNoteId = id;
        document.getElementById('noteTitleInput').value = note.title;
        document.getElementById('notePriorityInput').value = note.priority;
        document.getElementById('noteContentInput').value = note.content;
        document.getElementById('noteModalTitle').textContent = 'تعديل الملاحظة';
        document.getElementById('noteSubmitBtn').textContent = 'حفظ التعديلات';
        openModal('addNoteModal');
    }
}

function deleteNote(id) {
    if (confirm('هل أنت متأكد من حذف هذه الملاحظة؟')) {
        let notes = JSON.parse(localStorage.getItem('luxen_notes')) || [];
        notes = notes.filter(n => n.id !== id);
        localStorage.setItem('luxen_notes', JSON.stringify(notes));
        renderNotes();
    }
}

function toggleNotePin(id) {
    let notes = JSON.parse(localStorage.getItem('luxen_notes')) || [];
    const note = notes.find(n => n.id === id);
    if (note) {
        note.isPinned = !note.isPinned;
        localStorage.setItem('luxen_notes', JSON.stringify(notes));
        renderNotes();
    }
}

// ==========================================
// 18. توليد بطاقات الدول والمستخدمين
// ==========================================
function renderCountries() {
    const countries = [
        'مصر', 'السعودية', 'الإمارات', 'الكويت', 'قطر', 'البحرين', 'عُمان', 'الأردن',
        'لبنان', 'سوريا', 'العراق', 'فلسطين', 'المغرب', 'الجزائر', 'تونس'
    ];
    
    const container = document.getElementById('countriesGridContainer');
    if (!container) return;

    let users = JSON.parse(localStorage.getItem('luxen_all_users')) || [];

    container.innerHTML = '';
    countries.forEach(country => {
        let count = users.filter(u => u.country === country).length;
        
        container.innerHTML += `
            <div class="stat-card" style="min-width: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 2rem;">
                <h4 style="color: #fff; margin: 0; font-size: 1.3rem;">${country}</h4>
                <span style="color: #00f3ff; font-size: 2.2rem; font-weight: bold; text-shadow: 0 0 10px rgba(0, 243, 255, 0.4);">${count}</span>
                <span style="color: #94a3b8; font-size: 0.9rem;">مستخدم</span>
            </div>
        `;
    });
}

// ==========================================
// 19. إدارة الوسائط وتهيئة النظام عند التحميل 
// ==========================================
const videoInputEl = document.getElementById('introVideoInput');
if (videoInputEl) {
    videoInputEl.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            if (file.type.startsWith('video/')) {
                const videoURL = URL.createObjectURL(file);
                const videoPlayer = document.getElementById('videoPlayer');
                const noVideoText = document.getElementById('noVideoText');
                
                videoPlayer.src = videoURL;
                videoPlayer.style.display = 'block';
                noVideoText.style.display = 'none';
                
                addAuditLog('رفع فيديو', 'تم رفع وتحديث الفيديو التعريفي للمنصة');
                alert('تم رفع الفيديو وعرضه بنجاح!');
            } else {
                alert('عفواً، الرجاء اختيار ملف فيديو صالح.');
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    ensureFounderAccount(); 
    applyDynamicSettings();

    const passInput = document.getElementById('adminPassword');
    if (passInput) {
        passInput.addEventListener('input', function(e) {
            const sidebarMenu = document.getElementById('sidebarMenuContainer');
            const mainArea = document.getElementById('mainContentArea');
            
            if(e.target.value === systemConfig.intPass) {
                sidebarMenu.style.display = 'flex';
                mainArea.style.opacity = '1';
                mainArea.style.pointerEvents = 'auto';
                
                if (!isAuthenticated) {
                    isAuthenticated = true;
                    loggedInUser = { role: 'superadmin', username: 'مدير النظام (داخلي)', permissions: 'all' };
                    document.getElementById('currentUserRoleText').textContent = 'المدير العام للمنصة';
                    addAuditLog('تخطي مفتاح المرور', 'تم فتح الصلاحيات الداخلية الجانبية بنجاح');
                }
                applyPermissionsInSidebar();
                updateWorkspacesVisibility();
            } else {
                sidebarMenu.style.display = 'none';
                mainArea.style.opacity = '0';
                mainArea.style.pointerEvents = 'none';
                
                if (loggedInUser && loggedInUser.username === 'مدير النظام (داخلي)') {
                    isAuthenticated = false;
                    loggedInUser = null;
                    unlockedSessionPages = {};
                }
            }
        });
    }

    const cardsContainer = document.getElementById('cardsContainer');
    const scrollRightBtn = document.getElementById('scrollRightBtn');
    const scrollLeftBtn = document.getElementById('scrollLeftBtn');
    if(scrollLeftBtn && cardsContainer) scrollLeftBtn.addEventListener('click', () => cardsContainer.scrollBy({ left: -280, behavior: 'smooth' }));
    if(scrollRightBtn && cardsContainer) scrollRightBtn.addEventListener('click', () => cardsContainer.scrollBy({ left: 280, behavior: 'smooth' }));

    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
        });
    }
});