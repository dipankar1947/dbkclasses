'use strict';

const PROFILE_KEY = 'dbkclasses.student.profile';
const RESULTS_KEY = 'dbkclasses.student.results';
const DRAFT_KEY = 'dbkclasses.student.draft';
const SESSION_KEY = 'dbkclasses.student.session';
const STUDENT_STORE_KEY = 'dbkclasses.students.registry';
const ENQUIRY_STORE_KEY = 'dbkclasses.enquiries.registry';
const ACTIVE_STUDENT_KEY = 'dbkclasses.student.activeId';
const ADMIN_SESSION_KEY = 'dbkclasses.admin.session';
const ADMIN_AUTH = Object.freeze({
  username: 'admin013',
  password: 'hiimdbk',
});
const STUDENT_HOME_PAGE = 'student.html';
const STUDENT_LOGIN_PAGE = 'student-login.html';
const STUDENT_SIGNUP_PAGE = 'student-signup.html';
const SIGNUP_PREVIEW_PHOTO_KEY = 'dbkclasses.student.previewPhoto';
const ID_CARD_WIDTH = 1440;
const ID_CARD_HEIGHT = 2133;

const navToggle = document.querySelector('.nav-toggle');
const primaryNav = document.querySelector('.primary-nav');
const navLinks = document.querySelectorAll('.primary-nav a');

if (navToggle && primaryNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = primaryNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      primaryNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

function initHomepageMotion() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  if (window.AOS) {
    AOS.init({
      duration: 900,
      easing: 'ease-out-back',
      once: true,
      offset: 110,
    });
  }

  if (window.gsap) {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    tl.from('.site-header', { yPercent: -120, opacity: 0, duration: 0.7 })
      .from('.ticker-band', { yPercent: -100, opacity: 0, duration: 0.55 }, 0.08)
      .from('.home-hero', { scale: 0.965, opacity: 0, duration: 0.85 }, 0.1)
      .from('.home-hero .hero-copy > *', {
        y: 34,
        opacity: 0,
        duration: 0.75,
        stagger: 0.09,
      }, 0.18)
      .from('.home-hero .hero-banner-frame', {
        x: 42,
        opacity: 0,
        scale: 0.96,
        duration: 0.85,
      }, 0.28)
      .from('.home-hero .hero-banner-actions a', {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
      }, 0.58);
  }
}

function setModalVisibility(modal, isOpen) {
  if (!modal) return;

  modal.hidden = !isOpen;
  modal.classList.toggle('is-open', isOpen);
  modal.setAttribute('aria-hidden', String(!isOpen));

  const anyOpen = Boolean(document.querySelector('.site-modal.is-open:not([hidden])'));
  document.body.classList.toggle('modal-open', anyOpen);
}

function openSiteModal(modal) {
  if (!modal) return;
  setModalVisibility(modal, true);

  const focusTarget = modal.querySelector('input:not([type="hidden"]), textarea, button, a[href], [tabindex]:not([tabindex="-1"])');
  if (focusTarget && typeof focusTarget.focus === 'function') {
    focusTarget.focus({ preventScroll: true });
  }
}

function closeSiteModal(modal) {
  if (!modal) return;
  setModalVisibility(modal, false);
}

function initHomepageModals() {
  const welcomeModal = document.getElementById('welcomeModal');
  const enquiryModal = document.getElementById('enquiryModal');
  const teacherMaintenanceModal = document.getElementById('teacherMaintenanceModal');
  const openEnquiryButtons = document.querySelectorAll('[data-open-enquiry-modal]');
  const openMaintenanceButtons = document.querySelectorAll('[data-open-maintenance-modal]');
  const closeButtons = document.querySelectorAll('[data-modal-close]');

  const closeAll = () => {
    closeSiteModal(welcomeModal);
    closeSiteModal(enquiryModal);
    closeSiteModal(teacherMaintenanceModal);
  };

  openEnquiryButtons.forEach((button) => {
    button.addEventListener('click', () => {
      closeSiteModal(welcomeModal);
      closeSiteModal(teacherMaintenanceModal);
      openSiteModal(enquiryModal);
    });
  });

  openMaintenanceButtons.forEach((button) => {
    button.addEventListener('click', () => {
      closeSiteModal(welcomeModal);
      closeSiteModal(enquiryModal);
      openSiteModal(teacherMaintenanceModal);
    });
  });

  closeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      closeSiteModal(button.closest('.site-modal'));
    });
  });

  [welcomeModal, enquiryModal, teacherMaintenanceModal].forEach((modal) => {
    modal?.addEventListener('click', (event) => {
      if (event.target === modal || event.target.classList.contains('site-modal-backdrop')) {
        closeSiteModal(modal);
      }
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeAll();
    }
  });

  openSiteModal(welcomeModal);
}

function initHomepageEnquiryForm() {
  const form = document.getElementById('homeEnquiryForm');
  if (!form) return;

  const status = document.getElementById('homeEnquiryStatus');

  const setStatus = (message, tone = 'success') => {
    if (!status) return;
    status.textContent = message;
    status.dataset.tone = tone;
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const fullName = document.getElementById('enquiryFullName')?.value.trim() || '';
    const phoneNo = document.getElementById('enquiryPhoneNo')?.value.trim() || '';
    const email = document.getElementById('enquiryEmail')?.value.trim() || '';
    const address = document.getElementById('enquiryAddress')?.value.trim() || '';
    const enquiryText = document.getElementById('enquiryText')?.value.trim() || '';

    if (!fullName || !phoneNo || !email || !address || !enquiryText) {
      setStatus('Please fill every enquiry field before sending.', 'error');
      return;
    }

    if (phoneNo.length < 8) {
      setStatus('Please enter a valid phone number.', 'error');
      return;
    }

    if (!email.includes('@')) {
      setStatus('Please enter a valid email address.', 'error');
      return;
    }

    const enquiry = upsertEnquiry({
      enquiryId: generateEnquiryId(),
      fullName,
      phoneNo,
      email,
      address,
      enquiryText,
      createdAt: new Date().toISOString(),
    });

    if (enquiry) {
      form.reset();
      setStatus('Enquiry sent. The admin panel will show it shortly.', 'success');
      return;
    }

    setStatus('Could not save the enquiry. Please try again.', 'error');
  });
}

function normalizeStudentValue(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizeStudentId(value) {
  return String(value || '').trim().toLowerCase();
}

function getProfileId(profile) {
  if (!profile) return '';
  return String(profile.studentId || profile.virtualId || '').trim();
}

function normalizeStudentRecord(profile) {
  if (!profile) return null;

  const studentId = normalizeStudentId(getProfileId(profile));
  if (!studentId) return null;

  const createdAt = profile.createdAt || new Date().toISOString();
  const updatedAt = profile.updatedAt || createdAt;
  const testSeriesNumber = Number.parseInt(profile.testSeriesNumber, 10);

  return {
    studentName: String(profile.studentName || '').trim(),
    studentId,
    virtualId: studentId,
    guardianName: String(profile.guardianName || '').trim(),
    contactNo: String(profile.contactNo || '').trim(),
    studentClass: String(profile.studentClass || '').trim(),
    bloodGroup: String(profile.bloodGroup || '').trim(),
    address: String(profile.address || '').trim(),
    photo: String(profile.photo || ''),
    ownerNotice: String(profile.ownerNotice || '').trim(),
    rank: String(profile.rank || '').trim(),
    testSeriesNumber: Number.isFinite(testSeriesNumber) && testSeriesNumber >= 0 ? testSeriesNumber : 0,
    createdAt,
    updatedAt,
  };
}

function generateStudentId(studentName) {
  const nameSlug = slugify(studentName).replace(/_/g, '').slice(0, 18) || 'student';
  return `${nameSlug}_dbklove`;
}

function generateStudentPassword(studentName) {
  return generateStudentId(studentName);
}

function readStoredStudents() {
  try {
    const item = localStorage.getItem(STUDENT_STORE_KEY);
    const parsed = item ? JSON.parse(item) : [];
    return Array.isArray(parsed) ? parsed.map(normalizeStudentRecord).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function readLegacyProfile() {
  try {
    const item = localStorage.getItem(PROFILE_KEY);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

function writeStudentRegistry(students) {
  const normalized = Array.isArray(students)
    ? students.map(normalizeStudentRecord).filter(Boolean)
    : [];
  localStorage.setItem(STUDENT_STORE_KEY, JSON.stringify(normalized));
}

function readStudentRegistry() {
  const students = readStoredStudents();
  if (students.length) {
    return students;
  }

  const legacyProfile = readLegacyProfile();
  return legacyProfile ? [normalizeStudentRecord(legacyProfile)] : [];
}

function migrateLegacyStudentRegistry() {
  const storedStudents = readStoredStudents();
  if (storedStudents.length) {
    return;
  }

  const legacyProfile = readLegacyProfile();
  if (!legacyProfile) {
    return;
  }

  const normalized = normalizeStudentRecord(legacyProfile);
  if (!normalized) {
    return;
  }

  localStorage.setItem(STUDENT_STORE_KEY, JSON.stringify([normalized]));

  const legacyResults = readLegacyResults();
  if (legacyResults.length) {
    localStorage.setItem(getResultsKey(normalized.studentId), JSON.stringify(legacyResults));
  }
}

function getStudentById(studentId, students = readStudentRegistry()) {
  const normalizedId = normalizeStudentId(studentId);
  return students.find((student) => normalizeStudentId(getProfileId(student)) === normalizedId) || null;
}

function normalizeStudentPassword(value) {
  return String(value || '').trim().toLowerCase();
}

function findStudentByLogin(studentName, password) {
  const normalizedName = normalizeStudentValue(studentName);
  const normalizedPassword = normalizeStudentPassword(password);

  return readStudentRegistry().find((student) => {
    if (normalizeStudentValue(student.studentName) !== normalizedName) {
      return false;
    }

    return normalizeStudentId(getProfileId(student)) === normalizedPassword;
  }) || null;
}

function upsertStudent(profile) {
  const normalized = normalizeStudentRecord(profile);
  if (!normalized) {
    return null;
  }

  const students = readStudentRegistry();
  const index = students.findIndex((student) => normalizeStudentId(getProfileId(student)) === normalized.studentId);
  const timestamp = new Date().toISOString();

  if (index >= 0) {
    const existing = students[index];
    students[index] = {
      ...existing,
      ...normalized,
      createdAt: existing.createdAt || normalized.createdAt,
      updatedAt: timestamp,
    };
  } else {
    students.unshift({
      ...normalized,
      createdAt: normalized.createdAt || timestamp,
      updatedAt: timestamp,
    });
  }

  writeStudentRegistry(students);
  localStorage.setItem(PROFILE_KEY, JSON.stringify(students[index >= 0 ? index : 0]));
  return students[index >= 0 ? index : 0];
}

function deleteStudent(studentId) {
  const normalizedId = normalizeStudentId(studentId);
  const students = readStudentRegistry().filter((student) => normalizeStudentId(getProfileId(student)) !== normalizedId);
  writeStudentRegistry(students);
  localStorage.removeItem(getResultsKey(normalizedId));

  const session = readSession();
  if (session && normalizeStudentId(session.studentId) === normalizedId) {
    clearSession();
  }

  const activeId = normalizeStudentId(localStorage.getItem(ACTIVE_STUDENT_KEY));
  if (activeId === normalizedId) {
    localStorage.removeItem(ACTIVE_STUDENT_KEY);
  }
}

function generateEnquiryId() {
  return `enq_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeEnquiryRecord(record) {
  if (!record) return null;

  const enquiryId = String(record.enquiryId || record.id || '').trim();
  if (!enquiryId) return null;

  return {
    enquiryId,
    fullName: String(record.fullName || '').trim(),
    phoneNo: String(record.phoneNo || '').trim(),
    email: String(record.email || '').trim(),
    address: String(record.address || '').trim(),
    enquiryText: String(record.enquiryText || '').trim(),
    createdAt: record.createdAt || new Date().toISOString(),
    updatedAt: record.updatedAt || record.createdAt || new Date().toISOString(),
  };
}

function readEnquiryRegistry() {
  try {
    const item = localStorage.getItem(ENQUIRY_STORE_KEY);
    const parsed = item ? JSON.parse(item) : [];
    return Array.isArray(parsed) ? parsed.map(normalizeEnquiryRecord).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function writeEnquiryRegistry(enquiries) {
  const normalized = Array.isArray(enquiries)
    ? enquiries.map(normalizeEnquiryRecord).filter(Boolean)
    : [];
  localStorage.setItem(ENQUIRY_STORE_KEY, JSON.stringify(normalized));
}

function upsertEnquiry(record) {
  const normalized = normalizeEnquiryRecord(record);
  if (!normalized) return null;

  const enquiries = readEnquiryRegistry();
  const index = enquiries.findIndex((item) => item.enquiryId === normalized.enquiryId);
  const timestamp = new Date().toISOString();

  if (index >= 0) {
    enquiries[index] = {
      ...enquiries[index],
      ...normalized,
      updatedAt: timestamp,
    };
  } else {
    enquiries.unshift({
      ...normalized,
      createdAt: normalized.createdAt || timestamp,
      updatedAt: timestamp,
    });
  }

  writeEnquiryRegistry(enquiries);
  return enquiries[index >= 0 ? index : 0];
}

function deleteEnquiry(enquiryId) {
  const normalizedId = String(enquiryId || '').trim();
  const enquiries = readEnquiryRegistry().filter((item) => item.enquiryId !== normalizedId);
  writeEnquiryRegistry(enquiries);
}

function getResultsKey(studentId) {
  return `dbkclasses.student.results.${normalizeStudentId(studentId)}`;
}

function readLegacyResults() {
  try {
    const item = localStorage.getItem(RESULTS_KEY);
    const parsed = item ? JSON.parse(item) : null;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeResults(studentId, results) {
  const normalized = Array.isArray(results)
    ? results.map((item, index) => normalizeResultEntry(item, index))
    : [];
  localStorage.setItem(getResultsKey(studentId), JSON.stringify(normalized));
}

function readSession() {
  try {
    const item = localStorage.getItem(SESSION_KEY);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

function writeSession(profile) {
  const studentId = getProfileId(profile);
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    studentId,
    studentName: profile?.studentName || '',
    loggedInAt: new Date().toISOString(),
  }));
  localStorage.setItem(ACTIVE_STUDENT_KEY, studentId);
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(ACTIVE_STUDENT_KEY);
}

function hasActiveSession() {
  const profile = readActiveProfile();
  const session = readSession();
  if (!profile || !session) return false;
  return normalizeStudentId(getProfileId(profile)) === normalizeStudentId(session.studentId);
}

function readActiveProfile() {
  const session = readSession();
  const students = readStudentRegistry();
  const activeId = session?.studentId || localStorage.getItem(ACTIVE_STUDENT_KEY);

  if (activeId) {
    const profile = getStudentById(activeId, students);
    if (profile) {
      return profile;
    }
  }

  const legacyProfile = readLegacyProfile();
  return legacyProfile ? normalizeStudentRecord(legacyProfile) : students[0] || null;
}

function requireActiveProfile() {
  const profile = readActiveProfile();
  const session = readSession();

  if (!profile || !session) {
    window.location.href = STUDENT_LOGIN_PAGE;
    return null;
  }

  if (normalizeStudentId(getProfileId(profile)) !== normalizeStudentId(session.studentId)) {
    window.location.href = STUDENT_LOGIN_PAGE;
    return null;
  }

  return profile;
}

function readAdminSession() {
  try {
    const item = localStorage.getItem(ADMIN_SESSION_KEY);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

function writeAdminSession() {
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({
    username: ADMIN_AUTH.username,
    loggedInAt: new Date().toISOString(),
  }));
}

function clearAdminSession() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
}

function hasAdminSession() {
  return Boolean(readAdminSession());
}

document.querySelectorAll('img.faculty-photo').forEach((image) => {
  const wrap = image.closest('.faculty-photo-wrap');

  const markMissing = () => {
    if (wrap) wrap.classList.add('is-missing');
    image.hidden = true;
  };

  if (image.complete && image.naturalWidth === 0) {
    markMissing();
  } else {
    image.addEventListener('error', markMissing);
  }
});

window.addEventListener('load', () => {
  initHomepageMotion();

  const slider = document.querySelector('.faculty-slider');
  const track = document.querySelector('.faculty-track');

  if (!slider || !track || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  let lastTime = performance.now();

  const step = (now) => {
    const delta = now - lastTime;
    lastTime = now;

    const loopWidth = track.scrollWidth / 2;
    if (loopWidth > 0) {
      slider.scrollLeft += delta * 0.03;
      if (slider.scrollLeft >= loopWidth) {
        slider.scrollLeft -= loopWidth;
      }
    }

    requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
});

document.addEventListener('DOMContentLoaded', () => {
  migrateLegacyStudentRegistry();

  const page = document.body.dataset.page;

  if (page === 'student-auth') {
    window.location.href = STUDENT_HOME_PAGE;
    return;
  }

  if (page === 'student-home') {
    if (hasActiveSession()) {
      window.location.href = 'student-dashboard.html';
      return;
    }
  }

  if (page === 'student-login') {
    if (hasActiveSession()) {
      window.location.href = 'student-dashboard.html';
      return;
    }
    initStudentLoginPage();
  }

  if (page === 'student-signup') {
    // Signup is always a clean start; old unfinished data must never reappear.
    localStorage.removeItem(DRAFT_KEY);
    localStorage.removeItem(SIGNUP_PREVIEW_PHOTO_KEY);
    if (hasActiveSession()) {
      window.location.href = 'student-dashboard.html';
      return;
    }
    initStudentSignupPage();
  }

  if (page === 'student-dashboard') {
    initStudentDashboardPage();
  }

  if (page === 'student-results') {
    initStudentResultsPage();
  }

  if (page === 'student-profile') {
    initStudentProfilePage();
  }

  if (page === 'admin-login') {
    initAdminLoginPage();
  }

  if (page === 'admin-portal') {
    initAdminPortalPage();
  }

  if (page === 'admin-student') {
    initAdminStudentDashboardPage();
  }

  if (page === 'admin-student-edit') {
    initAdminStudentEditPage();
  }

  initHomepageModals();
  initHomepageEnquiryForm();

  document.querySelectorAll('[data-student-logout]').forEach((button) => {
    button.addEventListener('click', () => {
      clearSession();
      window.location.href = STUDENT_HOME_PAGE;
    });
  });

  const adminLogoutButton = document.getElementById('logoutAdminBtn');
  adminLogoutButton?.addEventListener('click', () => {
    clearAdminSession();
    window.location.href = 'admin.html';
  });
});

function initStudentLoginPage() {
  const loginForm = document.getElementById('studentLoginForm');

  loginForm?.addEventListener('submit', (event) => {
    event.preventDefault();

    const loginName = document.getElementById('loginStudentName')?.value?.trim() || '';
    const loginSpecialId = document.getElementById('loginStudentPassword')?.value?.trim() || '';
    const profile = findStudentByLogin(loginName, loginSpecialId);

    if (!profile) {
      alert('No saved student profile matched that name and special ID.');
      return;
    }

    writeSession(profile);
    window.location.href = 'student-dashboard.html';
  });
}

function initStudentSignupPage() {
  const form = document.getElementById('studentSignupForm');
  const photoInput = document.getElementById('photoInput');
  const studentNameField = document.getElementById('studentName');
  const studentIdField = document.getElementById('studentId');
  const contactField = document.getElementById('contactNo');
  const bloodGroupField = document.getElementById('bloodGroup');
  const studentClassField = document.getElementById('studentClass');
  const guardianField = document.getElementById('guardianName');
  const addressField = document.getElementById('address');

  photoInput?.addEventListener('change', (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      localStorage.setItem(SIGNUP_PREVIEW_PHOTO_KEY, String(reader.result || ''));
    };
    reader.readAsDataURL(file);
  });

  form?.addEventListener('submit', (event) => {
    event.preventDefault();

    const studentName = studentNameField.value.trim();
    const studentId = studentIdField.value.trim();
    const contactNo = contactField.value.trim();
    const bloodGroup = bloodGroupField.value.trim();
    const studentClass = studentClassField.value.trim();
    const guardianName = guardianField.value.trim();
    const address = addressField.value.trim();

    if (!studentName || !studentId || !contactNo || !bloodGroup || !studentClass || !guardianName || !address) {
      alert('Please complete every required profile field before creating your account.');
      return;
    }

    if (!/^[a-z0-9]+(?:_[a-z0-9]+)*_dbklove$/.test(studentId.toLowerCase())) {
      alert('Please enter a special ID using letters, numbers, underscores, and ending with _dbklove.');
      return;
    }

    if (contactNo.replace(/\D/g, '').length < 10) {
      alert('Please enter a valid mobile number.');
      return;
    }

    if (address.length < 8) {
      alert('Please enter a complete location or address.');
      return;
    }

    const existingStudent = getStudentById(studentId);
    const profile = {
      studentName,
      studentId: studentId.toLowerCase(),
      virtualId: studentId.toLowerCase(),
      guardianName,
      contactNo,
      studentClass,
      bloodGroup,
      address,
      photo: localStorage.getItem(SIGNUP_PREVIEW_PHOTO_KEY) || '',
      testSeriesNumber: existingStudent?.testSeriesNumber || 0,
      createdAt: new Date().toISOString(),
    };

    const savedProfile = upsertStudent(profile);
    localStorage.removeItem(DRAFT_KEY);
    localStorage.removeItem(SIGNUP_PREVIEW_PHOTO_KEY);
    writeSession(savedProfile || profile);
    window.location.href = 'student-dashboard.html';
  });

}

function initStudentAuthPage() {
  initStudentSignupPage();
}

function initStudentDashboardPage() {
  const profile = requireActiveProfile();
  if (!profile) {
    return;
  }

  const nameEl = document.getElementById('dashboardName');
  const virtualIdEl = document.getElementById('dashboardVirtualId');
  const classEl = document.getElementById('dashboardClass');
  const avatarImage = document.getElementById('avatarImage');
  const avatarFallback = document.getElementById('avatarFallback');

  nameEl.textContent = profile.studentName;
  virtualIdEl.textContent = getProfileId(profile);
  classEl.textContent = profile.studentClass || 'Batch to be updated';

  setStudentPortrait(avatarImage, avatarFallback, profile.studentName, profile.photo);
}

function initStudentResultsPage() {
  const profile = requireActiveProfile();
  if (!profile) {
    return;
  }

  const results = readResults();
  const summary = summarizeResults(results);

  document.getElementById('resultAverage').textContent = `${summary.average}%`;
  document.getElementById('resultBest').textContent = `${summary.highest}%`;
  document.getElementById('resultLatest').textContent = `${summary.latest}%`;
  document.getElementById('resultTotal').textContent = String(summary.totalTests);
  document.getElementById('resultRank').textContent = profile.rank || '0';
  document.getElementById('resultNotice').textContent = profile.ownerNotice || 'Keep learning, stay consistent, and let your progress speak for itself.';
  renderChart(document.getElementById('resultChart'), results);

  const container = document.getElementById('resultList');
  if (!results.length) {
    container.innerHTML = `
      <div class="empty-state">
        <strong>No results uploaded yet</strong>
        <p>Your test series marks will appear here after DBKClasses publishes them.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = results.map((item) => `
    <article class="mark-item">
      <div class="mark-item-head">
        <strong>${item.label}</strong>
        <span>${item.score}%</span>
      </div>
      <div class="mark-bar"><span style="width:${item.score}%"></span></div>
      <div class="mark-subline">
        <span>${item.note}</span>
        <span>${item.grade}</span>
      </div>
    </article>
  `).join('');
}

function initStudentProfilePage() {
  const profile = requireActiveProfile();
  if (!profile) {
    return;
  }

  const detailName = document.getElementById('profileDetailName');
  const detailId = document.getElementById('profileDetailId');
  const guardianEl = document.getElementById('profileGuardian');
  const contactEl = document.getElementById('profileContact');
  const classEl = document.getElementById('profileClass');
  const bloodEl = document.getElementById('profileBlood');
  const addressEl = document.getElementById('profileAddress');
  const detailImage = document.getElementById('profileDetailImage');
  const detailFallback = document.getElementById('profileDetailFallback');
  const previewImage = document.getElementById('profileIdCardPreview');
  const downloadButton = document.getElementById('downloadProfilePdf');

  let cardPromise = Promise.resolve({ svg: '', png: '' });

  (async () => {
    try {
      const logoHref = await loadImageDataUri('assets/logo/dbk-logo.jpg');
      const svg = buildIdCardSvg(profile, logoHref);

      if (previewImage) {
        previewImage.src = svgToDataUri(svg);
      }

      const png = await svgToPngDataUrl(svg);
      if (previewImage) {
        previewImage.src = png;
      }

      cardPromise = Promise.resolve({ svg, png });
    } catch {
      const svg = buildIdCardSvg(profile, '');
      const fallback = svgToDataUri(svg);
      if (previewImage) {
        previewImage.src = fallback;
      }
      cardPromise = Promise.resolve({ svg, png: fallback });
    }
  })();

  downloadButton?.addEventListener('click', async () => {
    const assets = await cardPromise;
    const downloadUrl = assets.png || svgToDataUri(assets.svg);
    downloadDataUrl(downloadUrl, `${getProfileId(profile)}-id-card.png`);
  });
}

function initAdminLoginPage() {
  if (hasAdminSession()) {
    window.location.href = 'admin-portal.html';
    return;
  }

  const loginForm = document.getElementById('adminLoginForm');

  loginForm?.addEventListener('submit', (event) => {
    event.preventDefault();

    const username = document.getElementById('adminUsername')?.value.trim().toLowerCase() || '';
    const password = document.getElementById('adminPassword')?.value.trim() || '';

    if (username !== ADMIN_AUTH.username || password !== ADMIN_AUTH.password) {
      alert('Invalid admin credentials.');
      return;
    }

    writeAdminSession();
    window.location.href = 'admin-portal.html';
  });
}

function getAdminStudentIdFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    return normalizeStudentId(params.get('studentId'));
  } catch {
    return '';
  }
}

function buildAdminStudentUrl(pageName, studentId) {
  return `${pageName}?studentId=${encodeURIComponent(normalizeStudentId(studentId))}`;
}

function requireAdminStudentFromUrl() {
  if (!hasAdminSession()) {
    window.location.href = 'admin.html';
    return null;
  }

  const studentId = getAdminStudentIdFromUrl();
  if (!studentId) {
    window.location.href = 'admin-portal.html';
    return null;
  }

  const student = getStudentById(studentId);
  if (!student) {
    window.location.href = 'admin-portal.html';
    return null;
  }

  return student;
}

function renderAdminProgressRows(container, results) {
  if (!container) return;

  container.innerHTML = results.map((item, index) => {
    const rowNumber = index + 1;
    return `
      <div class="admin-progress-row" data-progress-row>
        <div class="admin-progress-row-head">
          <strong>Test series ${rowNumber}</strong>
          <button class="ghost-btn admin-row-remove" type="button" data-remove-progress-row>Remove</button>
        </div>
        <div class="admin-progress-row-grid">
          <label class="field">
            <span>Title</span>
            <input data-progress-field="label" type="text" value="${escapeHtml(item.label || `Test ${rowNumber}`)}" />
          </label>
          <label class="field">
            <span>Marks</span>
            <input data-progress-field="score" type="number" min="0" max="100" step="1" value="${escapeHtml(String(item.score ?? 0))}" />
          </label>
          <label class="field admin-wide-field">
            <span>Note</span>
            <input data-progress-field="note" type="text" value="${escapeHtml(item.note || '')}" />
          </label>
        </div>
      </div>
    `;
  }).join('');
}

function readAdminProgressRows(container) {
  if (!container) return [];

  return Array.from(container.querySelectorAll('[data-progress-row]')).map((row, index) => {
    const label = row.querySelector('[data-progress-field="label"]')?.value?.trim() || `Test ${index + 1}`;
    const scoreValue = Number.parseInt(row.querySelector('[data-progress-field="score"]')?.value || '', 10);
    const note = row.querySelector('[data-progress-field="note"]')?.value?.trim() || '';
    return normalizeResultEntry({ label, score: Number.isFinite(scoreValue) ? scoreValue : 0, note }, index);
  });
}

function updateAdminProgressSummary(summaryElements, results, statusText = '') {
  const summary = summarizeResults(results);
  if (summaryElements.average) summaryElements.average.textContent = `${summary.average}%`;
  if (summaryElements.best) summaryElements.best.textContent = `${summary.highest}%`;
  if (summaryElements.latest) summaryElements.latest.textContent = `${summary.latest}%`;
  if (summaryElements.total) summaryElements.total.textContent = String(summary.totalTests);
  if (summaryElements.status) summaryElements.status.textContent = statusText;
}

function initAdminPortalPage() {
  if (!hasAdminSession()) {
    window.location.href = 'admin.html';
    return;
  }

  const searchField = document.getElementById('adminSearch');
  const refreshButton = document.getElementById('refreshAdminStudents');
  const studentList = document.getElementById('adminStudentList');
  const totalCount = document.getElementById('adminMetricTotal');
  const visibleCount = document.getElementById('adminMetricVisible');
  const listLabel = document.getElementById('adminListLabel');
  const listTitle = document.getElementById('adminListTitle');
  const listStatus = document.getElementById('adminListStatus');
  const detailTitle = document.getElementById('adminDetailTitle');
  const detailStatus = document.getElementById('adminDetailStatus');
  const detailPanel = document.getElementById('adminSelectedDetail');
  const closeDetailButton = document.getElementById('closeAdminDetail');
  const tabButtons = Array.from(document.querySelectorAll('[data-admin-view]'));

  let activeView = 'students';
  let filterText = '';
  let students = readStudentRegistry();
  let enquiries = readEnquiryRegistry();
  let selectedId = '';

  const sortByRecent = (items) => [...items].sort((a, b) => {
    const left = new Date(b.updatedAt || b.createdAt || 0).getTime();
    const right = new Date(a.updatedAt || a.createdAt || 0).getTime();
    return left - right;
  });

  const visibleItems = () => {
    const query = normalizeStudentValue(filterText);
    const source = activeView === 'enquiries' ? sortByRecent(enquiries) : sortByRecent(students);

    if (!query) {
      return source;
    }

    return source.filter((item) => {
      const haystack = activeView === 'enquiries'
        ? [
          item.fullName,
          item.phoneNo,
          item.email,
          item.address,
          item.enquiryText,
        ].join(' ').toLowerCase()
        : [
          item.studentName,
          item.studentId,
          item.studentClass,
          item.contactNo,
          item.guardianName,
          String(item.testSeriesNumber || ''),
        ].join(' ').toLowerCase();
      return haystack.includes(query);
    });
  };

  const setTab = (view) => {
    activeView = view;
    selectedId = '';
    tabButtons.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.adminView === view);
    });
    if (searchField) {
      searchField.value = '';
      searchField.placeholder = view === 'enquiries'
        ? 'Name, phone, email, address, or message'
        : 'Name, ID, class, guardian, or series';
    }
    renderList();
  };

  const renderStudentDetail = (student) => `
    <div class="admin-detail-stack">
      <div class="admin-detail-hero">
        <div class="admin-detail-chip">${student.studentName ? getInitials(student.studentName) : 'DB'}</div>
        <div>
          <span class="mini-label">Student</span>
          <h4>${escapeHtml(student.studentName || 'Student')}</h4>
          <p>${escapeHtml(student.studentId || '-')}</p>
        </div>
      </div>
      <dl class="admin-detail-grid">
        <div><dt>Class / batch</dt><dd>${escapeHtml(student.studentClass || '-')}</dd></div>
        <div><dt>Guardian</dt><dd>${escapeHtml(student.guardianName || '-')}</dd></div>
        <div><dt>Contact</dt><dd>${escapeHtml(student.contactNo || '-')}</dd></div>
        <div><dt>Test series</dt><dd>${escapeHtml(String(student.testSeriesNumber || 0))}</dd></div>
        <div class="details-span"><dt>Address</dt><dd>${escapeHtml(student.address || '-')}</dd></div>
      </dl>
      <div class="admin-card-actions">
        <a class="solid-btn" href="${buildAdminStudentUrl('admin-student.html', student.studentId)}">View profile</a>
        <a class="ghost-btn" href="${buildAdminStudentUrl('admin-student-edit.html', student.studentId)}">Edit marks</a>
        <button class="ghost-btn admin-danger-btn" type="button" data-admin-delete-student="${escapeHtml(student.studentId)}">Delete profile</button>
      </div>
    </div>
  `;

  const renderEnquiryDetail = (enquiry) => `
    <div class="admin-detail-stack">
      <div class="admin-detail-hero">
        <div class="admin-detail-chip admin-detail-chip-alt">EN</div>
        <div>
          <span class="mini-label">Enquiry</span>
          <h4>${escapeHtml(enquiry.fullName || 'Enquiry')}</h4>
          <p>${escapeHtml(enquiry.email || '-')}</p>
        </div>
      </div>
      <dl class="admin-detail-grid">
        <div><dt>Phone</dt><dd>${escapeHtml(enquiry.phoneNo || '-')}</dd></div>
        <div><dt>Email</dt><dd>${escapeHtml(enquiry.email || '-')}</dd></div>
        <div class="details-span"><dt>Address</dt><dd>${escapeHtml(enquiry.address || '-')}</dd></div>
        <div class="details-span"><dt>Enquiry</dt><dd>${escapeHtml(enquiry.enquiryText || '-')}</dd></div>
      </dl>
      <div class="admin-card-actions">
        <button class="ghost-btn admin-danger-btn" type="button" data-admin-delete-enquiry="${escapeHtml(enquiry.enquiryId)}">Delete enquiry</button>
      </div>
    </div>
  `;

  const renderDetail = (item, openMobile = false) => {
    if (!detailPanel) return;

    detailPanel.classList.toggle('is-mobile-open', openMobile);
    const isMobileDetail = window.matchMedia?.('(max-width: 1080px)').matches;
    if (openMobile && isMobileDetail) {
      document.body.classList.add('modal-open');
    } else if (!document.querySelector('.site-modal.is-open:not([hidden])')) {
      document.body.classList.remove('modal-open');
    }

    if (!item) {
      detailPanel.innerHTML = `
        <div class="admin-empty-list">
          <strong>Select a record</strong>
          <p>Choose a student or enquiry from the list to see the full information here.</p>
        </div>
      `;
      if (detailTitle) detailTitle.textContent = 'Selected record';
      if (detailStatus) detailStatus.textContent = 'Ready';
      return;
    }

    if (activeView === 'enquiries') {
      detailPanel.innerHTML = renderEnquiryDetail(item);
      if (detailTitle) detailTitle.textContent = item.fullName || 'Enquiry';
      if (detailStatus) detailStatus.textContent = 'Enquiry';
      return;
    }

    detailPanel.innerHTML = renderStudentDetail(item);
    if (detailTitle) detailTitle.textContent = item.studentName || 'Student';
    if (detailStatus) detailStatus.textContent = 'Student';
  };

  const renderList = (openMobile = false) => {
    const visible = visibleItems();

    if (totalCount) totalCount.textContent = String(activeView === 'enquiries' ? enquiries.length : students.length);
    if (visibleCount) visibleCount.textContent = String(visible.length);
    if (listLabel) listLabel.textContent = activeView === 'enquiries' ? 'Enquiry list' : 'Student list';
    if (listTitle) listTitle.textContent = activeView === 'enquiries'
      ? 'Click any enquiry to see the details'
      : 'Click any student to view details';
    if (listStatus) listStatus.textContent = activeView === 'enquiries' ? 'Enquiries' : 'Directory';

    if (!visible.length) {
      studentList.innerHTML = activeView === 'enquiries'
        ? `
          <div class="admin-empty-list">
            <strong>No enquiries found</strong>
            <p>Try another name, phone, email, or message.</p>
          </div>
        `
        : `
          <div class="admin-empty-list">
            <strong>No students found</strong>
            <p>Try another name, class, guardian, or ID.</p>
          </div>
        `;
      renderDetail(null, openMobile);
      return;
    }

    if (!selectedId || !visible.some((item) => (activeView === 'enquiries' ? item.enquiryId : item.studentId) === selectedId)) {
      selectedId = activeView === 'enquiries' ? visible[0].enquiryId : visible[0].studentId;
    }

    studentList.innerHTML = visible.map((item) => {
      if (activeView === 'enquiries') {
        const isSelected = item.enquiryId === selectedId;
        return `
          <button type="button" class="admin-student-row ${isSelected ? 'is-selected' : ''}" data-enquiry-id="${escapeHtml(item.enquiryId)}">
            <span class="admin-student-chip admin-student-chip-alt">EN</span>
            <span class="admin-student-copy">
              <strong>${escapeHtml(item.fullName || '')}</strong>
              <span>${escapeHtml(item.phoneNo || '-')} | ${escapeHtml(item.email || '-')}</span>
              <small>${escapeHtml((item.enquiryText || '').slice(0, 90))}</small>
            </span>
            <span class="portal-btn admin-row-open">Open</span>
          </button>
        `;
      }

      const isSelected = item.studentId === selectedId;
      return `
        <button type="button" class="admin-student-row ${isSelected ? 'is-selected' : ''}" data-student-id="${escapeHtml(item.studentId)}">
          <span class="admin-student-chip">${item.studentName ? getInitials(item.studentName) : 'DB'}</span>
          <span class="admin-student-copy">
            <strong>${escapeHtml(item.studentName || '')}</strong>
            <span>${escapeHtml(item.studentClass || '-')} | ${escapeHtml(item.studentId)}</span>
            <small>Series ${escapeHtml(String(item.testSeriesNumber || 0))} | View profile</small>
          </span>
          <span class="portal-btn admin-row-open">View profile</span>
        </button>
      `;
    }).join('');

    const current = visible.find((item) => (activeView === 'enquiries' ? item.enquiryId : item.studentId) === selectedId) || visible[0] || null;
    renderDetail(current, openMobile);
  };

  const syncData = () => {
    students = readStudentRegistry();
    enquiries = readEnquiryRegistry();
  };

  searchField?.addEventListener('input', () => {
    filterText = searchField.value;
    renderList();
  });

  refreshButton?.addEventListener('click', () => {
    syncData();
    renderList();
  });

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => setTab(button.dataset.adminView || 'students'));
  });

  studentList?.addEventListener('click', (event) => {
    const enquiryButton = event.target.closest('[data-enquiry-id]');
    if (enquiryButton) {
      selectedId = enquiryButton.dataset.enquiryId || '';
      renderList(true);
      return;
    }

    const studentButton = event.target.closest('[data-student-id]');
    if (studentButton) {
      const studentId = studentButton.dataset.studentId || '';
      if (activeView === 'students') {
        selectedId = studentId;
        renderList(true);
      } else {
        selectedId = studentId;
        renderList(true);
      }
    }
  });

  closeDetailButton?.addEventListener('click', () => {
    detailPanel?.classList.remove('is-mobile-open');
    if (!document.querySelector('.site-modal.is-open:not([hidden])')) {
      document.body.classList.remove('modal-open');
    }
  });

  detailPanel?.addEventListener('click', (event) => {
    const studentDelete = event.target.closest('[data-admin-delete-student]');
    if (studentDelete) {
      const studentId = studentDelete.dataset.adminDeleteStudent || '';
      const student = getStudentById(studentId);
      if (!student) return;
      const confirmed = window.confirm(`Delete ${student.studentName}? This removes the profile and marks permanently.`);
      if (!confirmed) return;
      deleteStudent(studentId);
      syncData();
      selectedId = '';
      renderList();
      return;
    }

    const enquiryDelete = event.target.closest('[data-admin-delete-enquiry]');
    if (enquiryDelete) {
      const enquiryId = enquiryDelete.dataset.adminDeleteEnquiry || '';
      const enquiry = readEnquiryRegistry().find((item) => item.enquiryId === enquiryId);
      if (!enquiry) return;
      const confirmed = window.confirm(`Delete enquiry from ${enquiry.fullName || 'this person'}?`);
      if (!confirmed) return;
      deleteEnquiry(enquiryId);
      syncData();
      selectedId = '';
      renderList();
    }
  });

  window.addEventListener('storage', () => {
    syncData();
    renderList();
  });

  syncData();
  renderList();
}

function initAdminStudentDashboardPage() {
  const student = requireAdminStudentFromUrl();
  if (!student) {
    return;
  }

  const dashboardUrl = buildAdminStudentUrl('admin-student.html', student.studentId);
  const editUrl = buildAdminStudentUrl('admin-student-edit.html', student.studentId);
  const nameEl = document.getElementById('adminStudentName');
  const metaEl = document.getElementById('adminStudentMeta');
  const guardianEl = document.getElementById('adminStudentGuardian');
  const contactEl = document.getElementById('adminStudentContact');
  const classEl = document.getElementById('adminStudentClass');
  const seriesEl = document.getElementById('adminStudentSeries');
  const addressEl = document.getElementById('adminStudentAddress');
  const detailStatus = document.getElementById('adminStudentStatus');
  const photoImage = document.getElementById('adminStudentPhoto');
  const photoFallback = document.getElementById('adminStudentPhotoFallback');
  const chartEl = document.getElementById('adminDashboardChart');
  const recentResultsEl = document.getElementById('adminDashboardRecent');
  const avgEl = document.getElementById('adminProgressAverage');
  const bestEl = document.getElementById('adminProgressBest');
  const latestEl = document.getElementById('adminProgressLatest');
  const totalEl = document.getElementById('adminProgressTotal');
  const previewImage = document.getElementById('adminDashboardIdCardPreview');
  const downloadButton = document.getElementById('downloadAdminIdCard');
  const editLink = document.getElementById('adminStudentEditLink');
  const editButton = document.getElementById('adminStudentEditButton');
  const deleteButton = document.getElementById('adminDeleteStudent');

  if (nameEl) nameEl.textContent = student.studentName || 'Student name';
  if (metaEl) metaEl.textContent = `${student.studentId} | ${student.studentClass || '-'}`;
  if (guardianEl) guardianEl.textContent = student.guardianName || '-';
  if (contactEl) contactEl.textContent = student.contactNo || '-';
  if (classEl) classEl.textContent = student.studentClass || '-';
  if (seriesEl) seriesEl.textContent = String(student.testSeriesNumber || 0);
  if (addressEl) addressEl.textContent = student.address || '-';
  if (detailStatus) detailStatus.textContent = 'Active';
  if (editLink) editLink.href = editUrl;
  if (editButton) editButton.href = editUrl;

  setStudentPortrait(photoImage, photoFallback, student.studentName, student.photo);

  const results = readResults(student.studentId);
  const summary = summarizeResults(results);
  if (avgEl) avgEl.textContent = `${summary.average}%`;
  if (bestEl) bestEl.textContent = `${summary.highest}%`;
  if (latestEl) latestEl.textContent = `${summary.latest}%`;
  if (totalEl) totalEl.textContent = String(summary.totalTests);
  renderChart(chartEl, results);
  renderRecentResults(recentResultsEl, results);

  let previewPromise = Promise.resolve({ svg: '', png: '' });
  (async () => {
    try {
      const logoHref = await loadImageDataUri('assets/logo/dbk-logo.jpg');
      const svg = buildIdCardSvg(student, logoHref);
      const png = await svgToPngDataUrl(svg);
      if (previewImage) {
        previewImage.src = png;
      }
      previewPromise = Promise.resolve({ svg, png });
    } catch {
      const svg = buildIdCardSvg(student, '');
      const fallback = svgToDataUri(svg);
      if (previewImage) {
        previewImage.src = fallback;
      }
      previewPromise = Promise.resolve({ svg, png: fallback });
    }
  })();

  downloadButton?.addEventListener('click', async () => {
    const assets = await previewPromise;
    const downloadUrl = assets.png || svgToDataUri(assets.svg);
    downloadDataUrl(downloadUrl, `${getProfileId(student)}-id-card.png`);
  });

  deleteButton?.addEventListener('click', () => {
    const confirmed = window.confirm(`Delete ${student.studentName}? This removes the profile and marks permanently.`);
    if (!confirmed) {
      return;
    }

    deleteStudent(student.studentId);
    window.location.href = 'admin-portal.html';
  });

  window.addEventListener('storage', () => {
    if (!getStudentById(student.studentId)) {
      window.location.href = 'admin-portal.html';
    }
  });
}

function initAdminStudentEditPage() {
  const student = requireAdminStudentFromUrl();
  if (!student) {
    return;
  }

  const dashboardUrl = buildAdminStudentUrl('admin-student.html', student.studentId);
  const editBackButton = document.getElementById('adminEditBackButton');
  const nameEl = document.getElementById('adminEditStudentName');
  const metaEl = document.getElementById('adminEditStudentMeta');
  const deleteButton = document.getElementById('adminDeleteStudent');
  const progressList = document.getElementById('adminProgressList');
  const progressStatus = document.getElementById('adminProgressStatus');
  const avgEl = document.getElementById('adminProgressAverage');
  const bestEl = document.getElementById('adminProgressBest');
  const latestEl = document.getElementById('adminProgressLatest');
  const totalEl = document.getElementById('adminProgressTotal');
  const addRowButton = document.getElementById('adminAddProgressRow');
  const saveButton = document.getElementById('adminSaveProgress');
  const rankField = document.getElementById('adminStudentRank');
  const noticeField = document.getElementById('adminOwnerNotice');

  if (editBackButton) editBackButton.href = dashboardUrl;
  if (nameEl) nameEl.textContent = student.studentName || 'Student name';
  if (metaEl) metaEl.textContent = `${student.studentId} | ${student.studentClass || '-'}`;
  if (rankField) rankField.value = student.rank || '';
  if (noticeField) noticeField.value = student.ownerNotice || '';

  const renderEditor = (results) => {
    if (results.length) {
      renderAdminProgressRows(progressList, results);
    } else if (progressList) {
      progressList.innerHTML = `
        <div class="admin-empty-list">
          <strong>No results uploaded yet</strong>
          <p>Add the first test series with the button below.</p>
        </div>
      `;
    }
    updateAdminProgressSummary(
      { average: avgEl, best: bestEl, latest: latestEl, total: totalEl, status: progressStatus },
      results,
      `${student.studentName} report`
    );
  };

  const ensureRows = () => {
    renderEditor(readResults(student.studentId));
  };

  addRowButton?.addEventListener('click', () => {
    const current = readAdminProgressRows(progressList);
    const nextIndex = current.length + 1;
    const nextRows = current.concat(normalizeResultEntry({ label: `Test ${nextIndex}`, score: 0, note: '' }, nextIndex - 1));
    renderEditor(nextRows);
  });

  progressList?.addEventListener('click', (event) => {
    const removeButton = event.target.closest('[data-remove-progress-row]');
    if (!removeButton) {
      return;
    }

    const row = removeButton.closest('[data-progress-row]');
    row?.remove();

    const remaining = readAdminProgressRows(progressList);
    if (remaining.length) {
      updateAdminProgressSummary(
        { average: avgEl, best: bestEl, latest: latestEl, total: totalEl, status: progressStatus },
        remaining,
        `${student.studentName} report`
      );
    } else {
      ensureRows();
    }
  });

  saveButton?.addEventListener('click', () => {
    const results = readAdminProgressRows(progressList);
    writeResults(student.studentId, results);
    upsertStudent({
      ...student,
      testSeriesNumber: results.length,
      rank: rankField?.value.trim() || '',
      ownerNotice: noticeField?.value.trim() || '',
      updatedAt: new Date().toISOString(),
    });
    alert('Student report details saved.');
    window.location.href = dashboardUrl;
  });

  deleteButton?.addEventListener('click', () => {
    const confirmed = window.confirm(`Delete ${student.studentName}? This removes the profile and marks permanently.`);
    if (!confirmed) {
      return;
    }

    deleteStudent(student.studentId);
    window.location.href = 'admin-portal.html';
  });

  window.addEventListener('storage', () => {
    if (!getStudentById(student.studentId)) {
      window.location.href = 'admin-portal.html';
    }
  });

  ensureRows();
}

function readDraft() {
  try {
    const item = localStorage.getItem(DRAFT_KEY);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function readProfile() {
  return readActiveProfile() || readLegacyProfile() || readStudentRegistry()[0] || null;
}

function normalizeResultEntry(item, index = 0) {
  const label = String(item?.label || `Test ${index + 1}`).trim() || `Test ${index + 1}`;
  const rawScore = Number.parseInt(item?.score, 10);
  const score = clamp(Number.isFinite(rawScore) ? rawScore : 0, 0, 100);
  const note = String(item?.note || '').trim() || 'Updated result';
  return {
    label,
    score,
    grade: gradeLabel(score),
    note,
  };
}

function readResults(studentId = getProfileId(readActiveProfile())) {
  const normalizedId = normalizeStudentId(studentId);

  try {
    const item = normalizedId ? localStorage.getItem(getResultsKey(normalizedId)) : null;
    const parsed = item ? JSON.parse(item) : null;
    if (Array.isArray(parsed) && parsed.length) {
      return parsed.map((result, index) => normalizeResultEntry(result, index));
    }

    if (normalizedId) {
      const legacyResults = readLegacyResults();
      if (legacyResults.length && normalizedId === normalizeStudentId(getProfileId(readLegacyProfile()))) {
        return legacyResults.map((result, index) => normalizeResultEntry(result, index));
      }
    }
    return [];
  } catch {
    return [];
  }
}

function renderChart(container, results) {
  if (!container) return;

  if (!results.length) {
    container.innerHTML = `
      <div class="empty-state">
        <strong>No results uploaded yet</strong>
        <p>Your progress graph will appear after the admin adds test series.</p>
      </div>
    `;
    return;
  }

  const width = 420;
  const height = 220;
  const padding = 28;
  const max = 100;
  const stepX = (width - padding * 2) / Math.max(results.length - 1, 1);

  const points = results.map((item, index) => {
    const x = padding + index * stepX;
    const y = height - padding - (item.score / max) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  const lineShape = `M ${points.split(' ').join(' L ')}`;

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" width="100%" height="180" role="img" aria-label="Student marks chart">
      <line x1="${padding}" x2="${width - padding}" y1="${height - padding}" y2="${height - padding}" stroke="rgba(15,27,45,.12)" />
      <line x1="${padding}" x2="${padding}" y1="${padding}" y2="${height - padding}" stroke="rgba(15,27,45,.12)" />
      <polyline fill="none" stroke="#0f8a74" stroke-width="4" points="${points}" />
      ${results.map((item, index) => {
        const x = padding + index * stepX;
        const y = height - padding - (item.score / max) * (height - padding * 2);
        return `<g><circle cx="${x}" cy="${y}" r="5" fill="#0f4c81" /><text x="${x}" y="${height - 8}" text-anchor="middle" font-size="10" fill="#5b6b84">${item.label}</text></g>`;
      }).join('')}
    </svg>
  `;
}

function renderRecentResults(container, results) {
  if (!container) return;

  if (!results.length) {
    container.innerHTML = `
      <div class="empty-state">
        <strong>No recent results yet</strong>
        <p>Marks will show here once they are uploaded.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = results.slice(-4).reverse().map((item) => `
    <div class="result-row">
      <div>
        <strong>${item.label}</strong>
        <span>${item.note}</span>
      </div>
      <b>${item.score}%</b>
    </div>
  `).join('');
}

function summarizeResults(results) {
  const totalTests = results.length;
  const average = totalTests ? Math.round(results.reduce((sum, item) => sum + item.score, 0) / totalTests) : 0;
  const highest = totalTests ? Math.max(...results.map((item) => item.score)) : 0;
  const latest = totalTests ? results[results.length - 1].score : 0;
  return { totalTests, average, highest, latest };
}

function gradeLabel(score) {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B+';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C';
  return 'Needs focus';
}

function getInitials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'DB';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function setStudentPortrait(imageEl, fallbackEl, studentName, photo) {
  if (!imageEl) return;

  const initials = getInitials(studentName);
  if (photo) {
    imageEl.src = photo;
    imageEl.hidden = false;
    if (fallbackEl) {
      fallbackEl.hidden = true;
    }
    imageEl.onerror = () => {
      imageEl.hidden = true;
      if (fallbackEl) {
        fallbackEl.hidden = false;
        fallbackEl.textContent = initials;
      }
    };
    return;
  }

  imageEl.removeAttribute('src');
  imageEl.hidden = true;
  if (fallbackEl) {
    fallbackEl.hidden = false;
    fallbackEl.textContent = initials;
  }
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function svgToDataUri(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function svgToPngDataUrl(svg, width = ID_CARD_WIDTH, height = ID_CARD_HEIGHT) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const objectUrl = URL.createObjectURL(blob);
    const image = new Image();

    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas unavailable');
        ctx.drawImage(image, 0, 0, width, height);
        URL.revokeObjectURL(objectUrl);
        resolve(canvas.toDataURL('image/png'));
      } catch (error) {
        URL.revokeObjectURL(objectUrl);
        reject(error);
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Unable to render ID card.'));
    };

    image.src = objectUrl;
  });
}

function downloadDataUrl(dataUrl, filename) {
  const anchor = document.createElement('a');
  anchor.href = dataUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function loadImageDataUri(src) {
  return fetch(src)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Unable to load asset: ${src}`);
      }
      return response.blob();
    })
    .then((blob) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error(`Unable to read asset: ${src}`));
      reader.readAsDataURL(blob);
    }));
}

function splitCardLines(value, maxLen = 28) {
  const text = String(value || '').trim();
  if (!text) return ['-'];
  if (text.length <= maxLen) return [text];

  const commaParts = text.split(/,\s*/).filter(Boolean);
  if (commaParts.length > 1) {
    return [commaParts[0], commaParts.slice(1).join(', ')];
  }

  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxLen || !current) {
      current = next;
      return;
    }
    lines.push(current);
    current = word;
  });

  if (current) lines.push(current);
  return lines.slice(0, 2);
}

function buildIdCardSvg(profile, logoHref = '') {
  const studentId = escapeHtml(getProfileId(profile));
  const studentName = escapeHtml(profile.studentName || 'Student Name');
  const studentNameLines = splitCardLines(profile.studentName || 'Student Name', 18).map(escapeHtml);
  const studentClass = escapeHtml(profile.studentClass || '-');
  const guardianName = escapeHtml(profile.guardianName || '-');
  const contactNo = escapeHtml(profile.contactNo || '-');
  const bloodGroup = escapeHtml(profile.bloodGroup || '-');
  const photoHref = escapeHtml(profile.photo || '');
  const addressLines = splitCardLines(profile.address || '-', 30).map(escapeHtml);
  const website = escapeHtml('www.dbkclasses.in');
  const logoData = escapeHtml(logoHref || '');

  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${ID_CARD_WIDTH}" height="${ID_CARD_HEIGHT}" viewBox="0 0 1080 1600">
    <defs>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#000000" flood-opacity="0.16"/>
      </filter>
      <clipPath id="photoClip">
        <circle cx="430" cy="490" r="136" />
      </clipPath>
    </defs>
    <rect width="1080" height="1600" fill="#f7f7f7"/>
    <g filter="url(#shadow)">
      <rect x="24" y="24" width="1032" height="1552" rx="46" fill="#ffffff" stroke="#111111" stroke-width="2"/>
    </g>
    <path d="M 694 24 L 1056 24 L 1056 1576 L 812 1576 L 646 1058 L 610 848 L 694 24 Z" fill="#111111"/>
    <rect x="512" y="64" width="92" height="34" rx="17" fill="#ededed" stroke="#555555" stroke-width="2"/>
    <g fill="#d8d8d8">
      <rect x="808" y="112" width="6" height="6" rx="2"/>
      <rect x="828" y="112" width="6" height="6" rx="2"/>
      <rect x="848" y="112" width="6" height="6" rx="2"/>
      <rect x="868" y="112" width="6" height="6" rx="2"/>
      <rect x="808" y="132" width="6" height="6" rx="2"/>
      <rect x="828" y="132" width="6" height="6" rx="2"/>
      <rect x="848" y="132" width="6" height="6" rx="2"/>
      <rect x="868" y="132" width="6" height="6" rx="2"/>
      <rect x="808" y="152" width="6" height="6" rx="2"/>
      <rect x="828" y="152" width="6" height="6" rx="2"/>
      <rect x="848" y="152" width="6" height="6" rx="2"/>
      <rect x="868" y="152" width="6" height="6" rx="2"/>
      <rect x="808" y="172" width="6" height="6" rx="2"/>
      <rect x="828" y="172" width="6" height="6" rx="2"/>
      <rect x="848" y="172" width="6" height="6" rx="2"/>
      <rect x="868" y="172" width="6" height="6" rx="2"/>
    </g>
    <text x="840" y="980" text-anchor="middle" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="108" font-weight="700" opacity="0.16" transform="rotate(90 840 980)">DBK CLASSES</text>
    ${logoData
      ? `<image href="${logoData}" x="26" y="18" width="360" height="238" preserveAspectRatio="xMidYMid meet" />`
      : `<text x="170" y="120" text-anchor="middle" fill="#111111" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700">DBK CLASSES</text>`}
    <circle cx="430" cy="490" r="136" fill="#ffffff" stroke="#111111" stroke-width="4"/>
    ${photoHref
      ? `<image href="${photoHref}" x="294" y="354" width="272" height="272" clip-path="url(#photoClip)" preserveAspectRatio="xMidYMid slice" />`
      : `<text x="430" y="525" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="58" font-weight="900" fill="#111111">${getInitials(profile.studentName)}</text>`}
    ${studentNameLines.map((line, index) => `<text x="112" y="${900 + (index * 54)}" fill="#111111" font-family="Arial, Helvetica, sans-serif" font-size="54" font-weight="800">${line}</text>`).join('')}
    <text x="112" y="1012" fill="#7a7a7a" font-family="Arial, Helvetica, sans-serif" font-size="22" letter-spacing="3">STUDENT</text>
    <line x1="112" y1="1038" x2="360" y2="1038" stroke="#111111" stroke-width="3"/>
    <text x="112" y="1090" fill="#111111" font-family="Arial, Helvetica, sans-serif" font-size="19" font-weight="700">ID NO.</text>
    <text x="332" y="1090" fill="#111111" font-family="Arial, Helvetica, sans-serif" font-size="25">: ${studentId}</text>
    <text x="112" y="1142" fill="#111111" font-family="Arial, Helvetica, sans-serif" font-size="19" font-weight="700">PHONE</text>
    <text x="332" y="1142" fill="#111111" font-family="Arial, Helvetica, sans-serif" font-size="25">: ${contactNo}</text>
    <text x="112" y="1194" fill="#111111" font-family="Arial, Helvetica, sans-serif" font-size="19" font-weight="700">BATCH</text>
    <text x="332" y="1194" fill="#111111" font-family="Arial, Helvetica, sans-serif" font-size="25">: ${studentClass}</text>
    <text x="112" y="1246" fill="#111111" font-family="Arial, Helvetica, sans-serif" font-size="19" font-weight="700">BLOOD GROUP</text>
    <text x="332" y="1246" fill="#111111" font-family="Arial, Helvetica, sans-serif" font-size="25">: ${bloodGroup}</text>
    <text x="112" y="1298" fill="#111111" font-family="Arial, Helvetica, sans-serif" font-size="19" font-weight="700">GUARDIAN</text>
    <text x="332" y="1298" fill="#111111" font-family="Arial, Helvetica, sans-serif" font-size="25">: ${guardianName}</text>
    <text x="112" y="1350" fill="#111111" font-family="Arial, Helvetica, sans-serif" font-size="19" font-weight="700">ADDRESS</text>
    <text x="332" y="1350" fill="#111111" font-family="Arial, Helvetica, sans-serif" font-size="21">: ${addressLines[0] || '-'}</text>
    ${addressLines[1] ? `<text x="332" y="1382" fill="#111111" font-family="Arial, Helvetica, sans-serif" font-size="21">${addressLines[1]}</text>` : ''}
    <text x="112" y="1458" fill="#111111" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700">WEBSITE</text>
    <text x="246" y="1458" fill="#111111" font-family="Arial, Helvetica, sans-serif" font-size="18">: ${website}</text>
    <rect x="82" y="1490" width="916" height="58" rx="22" fill="#111111"/>
    <text x="540" y="1527" text-anchor="middle" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="18" letter-spacing="4">INSPIRE | EDUCATE | ACHIEVE</text>
  </svg>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
