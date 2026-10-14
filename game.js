(() => {
  'use strict';
  const SAVE_KEY = 'lifeInAkwaIbom_v1';
  const defaultState = {
    name: 'New Resident', avatar: '👨🏾', wallet: 25000, bank: 0, energy: 80, happiness: 72,
    needs: { hunger: 82, fun: 72, social: 55, hygiene: 78, bladder: 90 }, gameMinutes: 480, gameDay: 1, rentDebt: 0, homeRent: 0,
    reputation: 10, xp: 0, level: 1, job: '', home: 'A place to start', businesses: [],
    completed: [], visits: [], started: false, lastVisit: Date.now(), streak: 1
  };
  let state = loadState();
  let currentPage = 'home';
  let activeTip = 0;
  const tips = [
    'Every big story starts with one small decision. Take a job today and invest in your future.',
    'Energy is a resource. Rest when you need to, then get back out there and chase your goals.',
    'A small hustle can become a big business. Start with what you can afford and grow step by step.',
    'Exploring new places can unlock fresh opportunities. The city rewards curious residents.',
    'Complete your daily missions to earn bonus cash and experience points.',
    'Spend with purpose. A little planning today can help you afford your dream home tomorrow.'
  ];
  const missions = [
    { id: 'job', title: 'Make an honest day’s pay', desc: 'Complete any job shift', reward: 2500, xp: 40, icon: '▣' },
    { id: 'explore', title: 'Get to know your city', desc: 'Explore a neighbourhood', reward: 1000, xp: 20, icon: '⌖' },
    { id: 'rest', title: 'Look after yourself', desc: 'Restore your energy', reward: 500, xp: 15, icon: '☾' },
    { id: 'fun', title: 'Make time for joy', desc: 'Do something for happiness', reward: 500, xp: 15, icon: '☺' }
  ];
  const jobs = [
    { id: 'shop', name: 'Shop Assistant', icon: '🛍️', description: 'Help customers at a busy neighbourhood shop.', pay: 4500, energy: 18, xp: 35, skill: 'Beginner friendly' },
    { id: 'delivery', name: 'Delivery Rider', icon: '🛵', description: 'Get orders safely across town.', pay: 6000, energy: 28, xp: 45, skill: 'Good stamina needed' },
    { id: 'designer', name: 'Fashion Assistant', icon: '🧵', description: 'Support a local designer and learn a craft.', pay: 5500, energy: 20, xp: 45, skill: 'Creative career' },
    { id: 'creator', name: 'Content Creator', icon: '📱', description: 'Make content and grow your local audience.', pay: 4000, energy: 15, xp: 50, skill: 'Build your reputation' },
    { id: 'office', name: 'Office Administrator', icon: '💼', description: 'Keep a small company organised.', pay: 8000, energy: 25, xp: 55, skill: 'Level 2 recommended', minLevel: 2 },
    { id: 'mechanic', name: 'Workshop Apprentice', icon: '🔧', description: 'Learn practical skills in a local workshop.', pay: 7000, energy: 25, xp: 50, skill: 'Level 2 recommended', minLevel: 2 }
  ];
  const places = [
    { id: 'uyo', name: 'Uyo Central', emoji: '🏙️', subtitle: 'City life · Shops · Jobs', detail: 'The lively heart of your new story. Find work, visit shops, meet people and look for your next opportunity.', reward: 600, xp: 20 },
    { id: 'market', name: 'Itam Market', emoji: '🛍️', subtitle: 'Trading · Food · Culture', detail: 'A colourful market full of small businesses, everyday essentials and people with big ideas.', reward: 700, xp: 25 },
    { id: 'coast', name: 'Oron Waterfront', emoji: '🌴', subtitle: 'Coast · Fishing · Trade', detail: 'Take a breather by the water and discover a different side of Akwa Ibom-inspired life.', reward: 500, xp: 20 },
    { id: 'craft', name: 'Ikot Ekpene Craft Quarter', emoji: '🧺', subtitle: 'Craft · Skills · Trade', detail: 'Discover craft-inspired work, learn about local enterprise and look for business ideas.', reward: 650, xp: 25 },
    { id: 'eket', name: 'Eket Opportunity Hub', emoji: '🏢', subtitle: 'Careers · Industry · Growth', detail: 'A place for ambitious residents to look for career opportunities and build new skills.', reward: 650, xp: 25 }
  ];
  const businesses = [
    { id: 'snacks', name: 'Snack & Drinks Stand', icon: '🥤', price: 8000, income: 1400, description: 'A small street-side refreshment stand.' },
    { id: 'fashion', name: 'Mini Fashion Corner', icon: '👕', price: 18000, income: 2800, description: 'Sell everyday clothes and accessories.' },
    { id: 'provisions', name: 'Provision Store', icon: '🛒', price: 30000, income: 4300, description: 'Stock essentials for the neighbourhood.' },
    { id: 'food', name: 'Local Food Spot', icon: '🍲', price: 45000, income: 6500, description: 'Serve tasty meals to hungry residents.' }
  ];
  const homes = [
    { id: 'room', name: 'Shared Room', icon: '🛏️', price: 0, rent: 0, upkeep: 0, description: 'A simple place to begin. No purchase cost.' },
    { id: 'studio', name: 'Self-contained Studio', icon: '🏠', price: 18000, rent: 6000, upkeep: 600, description: 'Your own compact space in the city.' },
    { id: 'flat', name: 'City Apartment', icon: '🏢', price: 65000, rent: 18000, upkeep: 1500, description: 'More room to relax and plan your next move.' },
    { id: 'house', name: 'Family House', icon: '🏡', price: 160000, rent: 35000, upkeep: 3000, description: 'A long-term goal for a growing resident.' }
  ];
  function loadState() {
    try { const saved = JSON.parse(localStorage.getItem(SAVE_KEY)); const merged = saved ? { ...defaultState, ...saved } : { ...defaultState }; merged.needs = { ...defaultState.needs, ...(saved && saved.needs || {}) }; return merged; }
    catch { return { ...defaultState, needs: { ...defaultState.needs } }; }
  }
  function saveState() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch {} }
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const money = n => '₦' + Math.max(0, Math.floor(n)).toLocaleString('en-NG');
  const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, n));
  function esc(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function toast(title, message, mark = '✓') {
    const el = document.createElement('div'); el.className = 'toast';
    el.innerHTML = `<span class="toast-mark">${mark}</span><span><b>${esc(title)}</b><small>${esc(message)}</small></span>`;
    $('#toastRegion').appendChild(el); setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateY(8px)'; setTimeout(() => el.remove(), 250); }, 3200);
  }
  function awardXP(amount) {
    state.xp += amount;
    while (state.xp >= 500) { state.xp -= 500; state.level++; state.reputation += 5; toast('Level up!', `You are now a level ${state.level} resident.`, '✦'); }
  }
  const dayNames = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
  function renderClockAndNeeds() {
    const mins = ((state.gameMinutes || 480) % 1440 + 1440) % 1440;
    const clock = `${String(Math.floor(mins / 60)).padStart(2,'0')}:${String(mins % 60).padStart(2,'0')}`;
    const el = $('#gameClock'); if (el) el.textContent = `${dayNames[((state.gameDay || 1)-1)%7]} · ${clock}`;
    const needs = { hunger: state.needs.hunger, energy: state.energy, fun: state.needs.fun ?? state.happiness, social: state.needs.social, hygiene: state.needs.hygiene, bladder: state.needs.bladder };
    Object.entries(needs).forEach(([key,value]) => { const v = clamp(Number(value) || 0); const label = $(`#need${key[0].toUpperCase()+key.slice(1)}Value`); const meter = $(`#need${key[0].toUpperCase()+key.slice(1)}Meter`); if(label) label.textContent = v; if(meter){meter.style.width = v+'%';meter.classList.toggle('need-low',v<25);} });
  }
  function advanceTime(minutes = 30) {
    const oldDay = Math.floor((state.gameMinutes || 480) / 1440);
    state.gameMinutes = (state.gameMinutes || 480) + minutes;
    const newDay = Math.floor(state.gameMinutes / 1440);
    if (newDay > oldDay) {
      state.gameDay = (state.gameDay || 1) + (newDay - oldDay);
      state.needs.hunger = clamp(state.needs.hunger - 9 * (newDay-oldDay));
      state.needs.hygiene = clamp(state.needs.hygiene - 5 * (newDay-oldDay));
      state.needs.bladder = clamp(state.needs.bladder - 8 * (newDay-oldDay));
      if ((state.gameDay - 1) % 7 === 6 && state.homeRent > 0) {
        if (state.wallet >= state.homeRent) { state.wallet -= state.homeRent; toast('Rent paid', `${money(state.homeRent)} weekly rent was paid.`, '⌂'); state.rentDebt = 0; }
        else { state.rentDebt = (state.rentDebt || 0) + state.homeRent; toast('Rent due', `You owe ${money(state.rentDebt)} in game rent.`, '!'); }
      }
    }
    state.needs.hunger = clamp(state.needs.hunger - minutes * 0.035);
    state.needs.fun = clamp(state.needs.fun - minutes * 0.018);
    state.needs.social = clamp(state.needs.social - minutes * 0.01);
    state.needs.hygiene = clamp(state.needs.hygiene - minutes * 0.008);
    state.needs.bladder = clamp(state.needs.bladder - minutes * 0.02);
    state.energy = clamp(state.energy - minutes * 0.012);
    state.happiness = Math.round((state.needs.fun + state.needs.social) / 2);
    renderClockAndNeeds();
  }
  function fulfillNeed(kind) {
    if (kind === 'eat') {
      if (state.wallet < 500) return toast('Not enough cash','You need ₦500 for a meal.','!');
      if (state.needs.hunger >= 95) return toast('Not hungry right now','Your hunger is already satisfied.','✓');
      state.wallet -= 500; state.needs.hunger = clamp(state.needs.hunger + 35); state.needs.fun = clamp(state.needs.fun + 3); advanceTime(20); toast('Meal enjoyed','You had a local meal and restored hunger.','🍲');
    } else if (kind === 'shower') {
      if (state.energy < 5) return toast('Too tired','Rest a little before taking a shower.','☾');
      state.needs.hygiene = clamp(state.needs.hygiene + 45); advanceTime(15); toast('Fresh again','Your hygiene improved.','🚿');
    } else if (kind === 'bathroom') {
      state.needs.bladder = clamp(state.needs.bladder + 65); advanceTime(5); toast('All good','You took care of a basic need.','✓');
    } else if (kind === 'social') {
      state.needs.social = clamp(state.needs.social + 25); state.needs.fun = clamp(state.needs.fun + 8); advanceTime(15); toast('Good conversation','You feel more connected.','💬');
    }
    state.happiness = Math.round((state.needs.fun + state.needs.social) / 2); renderStats(); renderCurrentPage();
  }
  function renderStats() {
    $('#walletValue').textContent = money(state.wallet); $('#energyValue').textContent = state.energy; $('#happyValue').textContent = state.happiness;
    $('#energyMeter').style.width = state.energy + '%'; $('#happyMeter').style.width = state.happiness + '%'; $('#repValue').textContent = state.reputation; $('#levelValue').textContent = state.level;
    $('#seasonXp').textContent = state.xp; $('.season-progress span').style.width = (state.xp / 500 * 100) + '%';
    $('#topName').textContent = state.name; $('#miniAvatar').textContent = state.avatar;
    const first = state.name.split(' ')[0] || 'Resident';
    $('#welcomeTitle').innerHTML = `Good ${getGreeting()}, <span>${esc(first)}.</span>`;
    $('#moodLabel').textContent = state.happiness >= 80 ? 'Feeling great' : state.happiness >= 55 ? 'Doing alright' : 'Could use a boost';
    renderClockAndNeeds();
    $('#homeMissionList').innerHTML = missions.slice(0, 3).map(m => missionHTML(m)).join('');
    $$('.mission-row [data-complete]').forEach(btn => btn.addEventListener('click', () => completeMission(btn.dataset.complete)));
    saveState();
  }
  function getGreeting() { const h = new Date().getHours(); return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'; }
  function missionDone(id) { return state.completed.includes(id); }
  function missionHTML(m) {
    const done = missionDone(m.id);
    return `<div class="mission-row ${done ? 'completed' : ''}"><button class="mission-check ${done ? 'done' : ''}" data-complete="${m.id}" aria-label="${done ? 'Completed' : 'Complete mission'}">${done ? '✓' : m.icon}</button><div class="mission-copy"><b>${m.title}</b><small>${done ? 'Completed today — nice work!' : m.desc}</small></div><span class="mission-reward">${done ? 'CLAIMED' : '+' + money(m.reward)}</span></div>`;
  }
  function completeMission(id) {
    if (missionDone(id)) return toast('Already completed', 'You have completed this mission today.', '✓');
    const m = missions.find(x => x.id === id); if (!m) return;
    const conditions = { job: () => !!state.job && state.lastJobShift, explore: () => state.visits.length > 0, rest: () => state.lastRest, fun: () => state.lastFun };
    if (!conditions[id]()) return toast('One more step', m.desc + ' first, then claim this mission.', '!');
    state.completed.push(id); state.wallet += m.reward; awardXP(m.xp); renderStats(); renderCurrentPage(); toast('Mission completed!', `You earned ${money(m.reward)} and ${m.xp} XP.`, '✦');
  }
  function openModal({ kicker = 'YOUR NEXT CHAPTER', title, description = '', body = '', actions = [] }) {
    $('#modalKicker').textContent = kicker; $('#modalTitle').textContent = title; $('#modalDescription').textContent = description; $('#modalBody').innerHTML = body;
    $('#modalActions').innerHTML = actions.map((a, i) => `<button class="${a.primary ? 'modal-primary' : 'modal-secondary'}" data-modal-action="${i}">${a.label}</button>`).join('');
    $$('#modalActions button').forEach(btn => btn.addEventListener('click', () => { const a = actions[Number(btn.dataset.modalAction)]; if (a && a.run) a.run(); }));
    $('#modalBackdrop').classList.remove('hidden'); document.body.style.overflow = 'hidden';
  }
  function closeModal() { $('#modalBackdrop').classList.add('hidden'); document.body.style.overflow = ''; }
  function showCharacterModal() {
    const avatars = ['👨🏾','👩🏾','🧑🏿','👨🏿','👩🏿','🧑🏾']; let selected = state.avatar;
    openModal({ kicker: 'WELCOME TO YOUR WORLD', title: 'Create your character', description: 'Every great story starts with a name. Choose how your journey begins.', body: `<label class="field-label" for="characterName">What should we call you?</label><input class="text-input" id="characterName" maxlength="22" placeholder="Enter your character name" value="${state.started ? esc(state.name) : ''}"><div class="form-row" style="margin-top:17px"><span class="field-label">Choose your avatar</span><div class="avatar-picker">${avatars.map(a => `<button class="avatar-option ${a === selected ? 'selected' : ''}" data-avatar="${a}" aria-label="Choose avatar ${a}">${a}</button>`).join('')}</div></div><div class="notice">This is a fictional game world. Game cash and rewards have no real-world monetary value.</div>`, actions: [{ label: 'Maybe later', run: closeModal }, { label: 'Start my life →', primary: true, run: () => { const name = $('#characterName').value.trim(); if (!name) { $('#characterName').focus(); toast('Add a character name', 'Choose a name before starting your journey.', '!'); return; } state.name = name; state.avatar = selected; state.started = true; renderStats(); closeModal(); toast('Welcome to Akwa Ibom!', `Your story starts now, ${name}.`, '✦'); } }] });
    $$('.avatar-option').forEach(btn => btn.addEventListener('click', () => { selected = btn.dataset.avatar; $$('.avatar-option').forEach(b => b.classList.toggle('selected', b === btn)); }));
    setTimeout(() => $('#characterName')?.focus(), 60);
  }
  function setPage(page) {
    currentPage = page; $$('.nav-item[data-page]').forEach(btn => btn.classList.toggle('active', btn.dataset.page === page));
    $('#pageCrumb').textContent = ({home:'OVERVIEW',city:'EXPLORE THE CITY',jobs:'JOBS & CAREERS',business:'MY BUSINESSES',homebase:'HOME & PROPERTY',missions:'DAILY MISSIONS'})[page] || 'OVERVIEW';
    $('#sidebar').classList.remove('open');
    if (page === 'home') { renderCurrentPage(); return; }
    const pageContent = $('#pageDynamic'); if (pageContent) pageContent.remove();
    const main = document.createElement('section'); main.id = 'pageDynamic'; main.className = 'dynamic-page';
    const welcome = $('.welcome-row'); const hero = $('.hero-card'); const stats = $('.stats-grid'); const needs = $('.needs-panel'); const grid = $('.content-grid');
    welcome.classList.add('hidden-original'); hero.classList.add('hidden-original'); stats.classList.add('hidden-original'); needs?.classList.add('hidden-original'); grid.classList.add('hidden-original');
    $('.page-content').insertBefore(main, $('.page-footer'));
    renderCurrentPage(); window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function showHome() { $$('.hidden-original').forEach(el => el.classList.remove('hidden-original')); $('#pageDynamic')?.remove(); }
  function pageHeader(eyebrow, title, desc, icon = '✦') { return `<div class="dynamic-heading"><div><div class="eyebrow small-eyebrow">${eyebrow}</div><h2>${title}</h2><p>${desc}</p></div><span class="dynamic-heading-icon">${icon}</span></div>`; }
  function renderCurrentPage() {
    if (currentPage === 'home') { showHome(); renderStats(); return; }
    const main = $('#pageDynamic'); if (!main) return;
    let html = '';
    if (currentPage === 'jobs') html = renderJobsPage();
    else if (currentPage === 'city') html = renderCityPage();
    else if (currentPage === 'business') html = renderBusinessPage();
    else if (currentPage === 'homebase') html = renderHomePage();
    else if (currentPage === 'missions') html = renderMissionsPage();
    main.innerHTML = html; attachDynamicEvents();
  }
  function renderJobsPage() {
    return pageHeader('BUILD YOUR FUTURE','Jobs & careers','Put your energy to work. Every shift can move your story forward.','▣') + `<div class="dynamic-stats"><div><small>YOUR WALLET</small><b>${money(state.wallet)}</b></div><div><small>CURRENT CAREER</small><b>${state.job ? esc(jobs.find(j => j.id === state.job)?.name || state.job) : 'Not employed'}</b></div><div><small>RESIDENT LEVEL</small><b>Level ${state.level}</b></div></div><div class="dynamic-grid">${jobs.map(j => { const locked = j.minLevel && state.level < j.minLevel; return `<article class="feature-card"><div class="feature-card-top"><span class="feature-emoji">${j.icon}</span><span class="feature-pill">${j.minLevel ? 'LEVEL ' + j.minLevel + '+' : 'OPEN TO ALL'}</span></div><h3>${j.name}</h3><p>${j.description}</p><div class="feature-meta"><span>💰 ${money(j.pay)} <small>/ shift</small></span><span>ϟ ${j.energy} energy</span></div><div class="feature-foot"><small>${j.skill}</small><button class="small-primary" data-work="${j.id}" ${locked || state.energy < j.energy ? 'disabled' : ''}>${locked ? 'Locked' : state.energy < j.energy ? 'Rest first' : 'Work shift →'}</button></div></article>`; }).join('')}</div><div class="notice">Game jobs and payments are fictional. They are not real job vacancies or employment offers.</div>`;
  }
  function renderCityPage() {
    return pageHeader('GO BEYOND YOUR STREET','Explore the city','Every neighbourhood has a story. Discover new places and earn exploration rewards.','⌖') + `<div class="city-feature-banner"><div><span class="feature-pill">YOUR MAP</span><h3>Akwa Ibom-inspired world</h3><p>Start in Uyo, then explore the places that shape your journey.</p></div><div class="map-doodle">⌖<span>✦</span><i>●</i></div></div><div class="dynamic-grid">${places.map(p => { const visited = state.visits.includes(p.id); return `<article class="feature-card place-feature"><div class="place-feature-art place-art-${p.id}"><span>${p.emoji}</span><small>${visited ? 'VISITED' : 'READY TO EXPLORE'}</small></div><h3>${p.name}</h3><p>${p.subtitle}</p><div class="feature-meta"><span>✦ +${p.xp} XP</span><span>Reward ${money(p.reward)}</span></div><div class="feature-foot"><small>${visited ? 'You have been here' : 'A new place to discover'}</small><button class="small-primary" data-explore="${p.id}">${visited ? 'Visit again →' : 'Explore →'}</button></div></article>`; }).join('')}</div><div class="notice">Locations are game-inspired representations. This is not an official map or service from Akwa Ibom State.</div>`;
  }
  function renderBusinessPage() {
    return pageHeader('MAKE YOUR OWN OPPORTUNITY','My businesses','Turn your ideas into a local hustle. Buy a business and collect its fictional daily earnings.','▤') + `<div class="dynamic-stats"><div><small>BUSINESSES OWNED</small><b>${state.businesses.length}</b></div><div><small>EST. DAILY INCOME</small><b>${money(state.businesses.reduce((sum,id)=>sum+(businesses.find(b=>b.id===id)?.income||0),0))}</b></div><div><small>YOUR WALLET</small><b>${money(state.wallet)}</b></div></div><div class="business-owned-panel"><div><div><span class="feature-pill">YOUR PORTFOLIO</span><h3>${state.businesses.length ? 'Your hustle is growing' : 'Your first business awaits'}</h3><p>${state.businesses.length ? 'Keep showing up and give your business a chance to grow.' : 'Choose a business below that fits your budget and your ambition.'}</p></div><span class="portfolio-emoji">${state.businesses.length ? '📈' : '💡'}</span></div>${state.businesses.length ? `<div class="owned-business-list">${state.businesses.map(id => { const b=businesses.find(x=>x.id===id); return b ? `<div><span>${b.icon}</span><b>${b.name}</b><small>${money(b.income)} estimated per collection</small><button class="small-primary" data-collect="${id}">Collect income</button></div>`:''; }).join('')}</div>` : ''}</div><h3 class="subsection-title">Start something of your own</h3><div class="dynamic-grid">${businesses.map(b => { const owned=state.businesses.includes(b.id); return `<article class="feature-card"><div class="feature-card-top"><span class="feature-emoji">${b.icon}</span><span class="feature-pill">${owned?'OWNED':'STARTER BUSINESS'}</span></div><h3>${b.name}</h3><p>${b.description}</p><div class="feature-meta"><span>🏷️ ${money(b.price)}</span><span>↗ ${money(b.income)} <small>/ collection</small></span></div><div class="feature-foot"><small>${owned?'Already in your portfolio':'One-time game purchase'}</small><button class="small-primary" data-buy-business="${b.id}" ${owned||state.wallet<b.price?'disabled':''}>${owned?'Owned':state.wallet<b.price?'Need more cash':'Start business →'}</button></div></article>`; }).join('')}</div><div class="notice">Business costs and earnings are fictional game mechanics, not real investment advice or guaranteed income.</div>`;
  }
  function renderHomePage() {
    const interior = `<section class="home-interior"><div class="home-interior-copy"><span class="feature-pill">YOUR HOME BASE</span><h3>A little space to recharge</h3><p>Choose an object to take care of your needs. Each activity uses in-game time.</p><div class="home-needs-mini"><span>🍲 Hunger ${Math.round(state.needs.hunger)}</span><span>⚡ Energy ${Math.round(state.energy)}</span><span>🫧 Hygiene ${Math.round(state.needs.hygiene)}</span></div></div><div class="room-scene"><div class="room-window"><span>🌴</span></div><button class="room-object bed-object" data-home-activity="bed" aria-label="Sleep in bed"><span>🛏️</span><b>Bed</b><small>Sleep · +energy</small></button><button class="room-object kitchen-object" data-home-activity="kitchen" aria-label="Prepare food"><span>🍲</span><b>Kitchen</b><small>Cook · reduce hunger</small></button><button class="room-object shower-object" data-home-activity="shower" aria-label="Take a shower"><span>🚿</span><b>Bathroom</b><small>Wash · +hygiene</small></button><button class="room-object sofa-object" data-home-activity="sofa" aria-label="Relax on sofa"><span>🛋️</span><b>Sofa</b><small>Relax · +fun</small></button><button class="room-object toilet-object" data-home-activity="toilet" aria-label="Use toilet"><span>🚽</span><b>Toilet</b><small>Use · +comfort</small></button><div class="room-floor"></div></div></section>`;
    return pageHeader('MAKE YOURSELF AT HOME','Home & property','A place of your own can be a big milestone. Start small and upgrade when you are ready.','⌂') + interior + `<div class="home-hero"><div><span class="feature-pill">YOUR CURRENT HOME</span><h3>${esc(state.home)}</h3><p>${state.home === 'A place to start' ? 'You have a simple starting place. Save up and move into somewhere that feels more like you.' : 'Your space is part of your story. Keep building toward your dream home.'}</p><div class="home-hero-meta"><span>⌂ Housing status</span><b>${state.home === 'A place to start' ? 'Starter resident' : 'Property owner'}</b></div></div><span class="home-hero-art">🏡</span></div><div class="dynamic-grid">${homes.map(h => { const owned=state.home===h.name; return `<article class="feature-card"><div class="feature-card-top"><span class="feature-emoji">${h.icon}</span><span class="feature-pill">${owned?'CURRENT HOME':h.price===0?'STARTER':'PROPERTY'}</span></div><h3>${h.name}</h3><p>${h.description}</p><div class="feature-meta"><span>${h.price ? money(h.price) : 'FREE START'}</span><span>Upkeep ${money(h.upkeep)}<small> / day</small></span></div><div class="feature-foot home-actions"><small>${owned?'You live here':`Rent ${money(h.rent)}/week · Purchase ${h.price?money(h.price):'free'}`}</small><div><button class="small-secondary" data-rent-home="${h.id}" ${owned||state.wallet<h.rent?'disabled':''}>${owned?'Current home':h.rent===0?'Move in free':`Rent · ${money(h.rent)}`}</button><button class="small-primary" data-buy-home="${h.id}" ${owned||state.wallet<h.price?'disabled':''}>${owned?'Current home':h.price===0?'Move in →':state.wallet<h.price?'Need more cash':'Purchase →'}</button></div></div></article>`; }).join('')}</div><div class="notice">Homes are virtual properties in the game. They are not real properties for sale or rent.</div>`;
  }
  function renderMissionsPage() {
    return pageHeader('YOUR DAILY CHALLENGE','Daily missions','A few small wins can add up. Complete missions to earn game cash and XP.','✳') + `<div class="mission-hero"><span>✦</span><div><h3>Today is full of potential.</h3><p>Complete actions around your world, then claim the matching rewards.</p></div><b>${state.completed.length}/${missions.length}</b></div><div class="mission-page-list">${missions.map(m => `<div class="mission-page-row ${missionDone(m.id)?'is-done':''}"><span class="mission-page-icon">${missionDone(m.id)?'✓':m.icon}</span><div class="mission-page-copy"><b>${m.title}</b><p>${missionDone(m.id)?'Mission complete — reward claimed.':m.desc}</p><div class="mission-progress"><span style="width:${missionDone(m.id)?'100%':'0%'}"></span></div></div><div class="mission-page-reward"><b>+${money(m.reward)}</b><small>+${m.xp} XP</small></div><button class="small-primary" data-complete="${m.id}" ${missionDone(m.id)?'disabled':''}>${missionDone(m.id)?'Claimed':'Claim reward'}</button></div>`).join('')}</div><div class="notice">Some missions require you to complete a related action first. You can claim each mission once per saved game; daily reset features can be added in a future version.</div>`;
  }
  function attachDynamicEvents() {
    $$('[data-work]').forEach(btn => btn.addEventListener('click', () => doWork(btn.dataset.work)));
    $$('[data-explore]').forEach(btn => btn.addEventListener('click', () => explore(btn.dataset.explore)));
    $$('[data-buy-business]').forEach(btn => btn.addEventListener('click', () => buyBusiness(btn.dataset.buyBusiness)));
    $$('[data-collect]').forEach(btn => btn.addEventListener('click', () => collectIncome(btn.dataset.collect)));
    $$('[data-buy-home]').forEach(btn => btn.addEventListener('click', () => buyHome(btn.dataset.buyHome)));
    $$('[data-rent-home]').forEach(btn => btn.addEventListener('click', () => rentHome(btn.dataset.rentHome)));
    $$('[data-home-activity]').forEach(btn => btn.addEventListener('click', () => homeActivity(btn.dataset.homeActivity)));
    $$('[data-complete]').forEach(btn => btn.addEventListener('click', () => completeMission(btn.dataset.complete)));
  }
  function doWork(id) {
    const job = jobs.find(j => j.id === id); if (!job) return;
    if (job.minLevel && state.level < job.minLevel) return toast('Career locked', `Reach level ${job.minLevel} to unlock this role.`, '!');
    if (state.energy < job.energy) return toast('You need a break', 'Rest to recover enough energy for this shift.', '☾');
    openModal({ kicker:'JOB SHIFT', title:`Work as a ${job.name}?`, description:job.description, body:`<div class="balance-summary"><span>Shift payment</span><b>${money(job.pay)}</b></div><div class="modal-grid"><div class="modal-mini-stat"><small>ENERGY COST</small><b>ϟ ${job.energy}</b></div><div class="modal-mini-stat"><small>EXPERIENCE</small><b>✦ ${job.xp} XP</b></div></div><div class="notice">Your character will use energy, earn virtual cash and gain experience. This is a game action, not a real job application.</div>`, actions:[{label:'Not now',run:closeModal},{label:'Start shift →',primary:true,run:()=>{closeModal();state.energy=clamp(state.energy-job.energy);state.wallet+=job.pay;state.reputation+=2;state.job=id;state.lastJobShift=true;advanceTime(240);state.needs.hunger=clamp(state.needs.hunger-8);state.needs.fun=clamp(state.needs.fun-5);awardXP(job.xp);renderStats();renderCurrentPage();toast('Shift complete!',`You earned ${money(job.pay)} as a ${job.name}.`,'₦');}}]});
  }
  function explore(id) {
    const p=places.find(x=>x.id===id); if(!p)return;
    openModal({ kicker:'CITY EXPLORATION', title:p.name, description:p.detail, body:`<div class="balance-summary"><span>Exploration reward</span><b>${money(p.reward)}</b></div><div class="modal-grid"><div class="modal-mini-stat"><small>EXPERIENCE</small><b>✦ ${p.xp} XP</b></div><div class="modal-mini-stat"><small>ENERGY</small><b>ϟ 8 points</b></div></div>${state.visits.includes(id)?'<div class="notice">You have explored this location before. Revisiting gives a smaller reward.</div>':'<div class="notice">Your first visit earns the full reward and may help complete your city exploration mission.</div>'}`, actions:[{label:'Back to map',run:closeModal},{label:state.visits.includes(id)?'Visit again →':'Explore this place →',primary:true,run:()=>{closeModal();if(state.energy<8){toast('Low energy','Rest before exploring another location.','☾');return;}state.energy=clamp(state.energy-8);advanceTime(45);state.needs.fun=clamp(state.needs.fun+5);state.needs.social=clamp(state.needs.social+2);const first=!state.visits.includes(id);state.visits.push(id);const reward=first?p.reward:Math.floor(p.reward*.25);state.wallet+=reward;awardXP(first?p.xp:5);if(first)state.reputation+=1;renderStats();renderCurrentPage();toast(first?'New place discovered!':'Welcome back!',`${p.name}: ${money(reward)} added to your wallet.`,p.emoji);}}]});
  }
  function buyBusiness(id) {
    const b=businesses.find(x=>x.id===id);if(!b||state.businesses.includes(id))return;
    if(state.wallet<b.price)return toast('Not enough cash',`You need ${money(b.price-state.wallet)} more to start this business.`,'!');
    openModal({kicker:'START A HUSTLE',title:`Start ${b.name}?`,description:b.description,body:`<div class="balance-summary"><span>Startup cost</span><b>${money(b.price)}</b></div><div class="modal-grid"><div class="modal-mini-stat"><small>ESTIMATED COLLECTION</small><b>${money(b.income)}</b></div><div class="modal-mini-stat"><small>YOUR BALANCE AFTER</small><b>${money(state.wallet-b.price)}</b></div></div><div class="notice">Income is collected manually as a game reward. It does not represent real-world earnings.</div>`,actions:[{label:'Maybe later',run:closeModal},{label:'Start business →',primary:true,run:()=>{closeModal();if(state.wallet<b.price)return toast('Not enough cash','Your balance changed. Try again.','!');state.wallet-=b.price;state.businesses.push(id);state.reputation+=4;awardXP(45);renderStats();renderCurrentPage();toast('Business launched!',`${b.name} is now part of your story.`,'✦');}}]});
  }
  function collectIncome(id) {const b=businesses.find(x=>x.id===id);if(!b||!state.businesses.includes(id))return;state.wallet+=b.income;state.energy=clamp(state.energy-2);advanceTime(30);awardXP(10);renderStats();renderCurrentPage();toast('Income collected!',`${b.name} generated ${money(b.income)} in game cash.`,'₦');}
  function homeActivity(kind) {
    if (kind === 'bed') { state.energy=clamp(state.energy+42); state.needs.fun=clamp(state.needs.fun+5); state.needs.social=clamp(state.needs.social-2); advanceTime(240); toast('Rested at home','You slept and restored energy.','🛏️'); }
    else if (kind === 'kitchen') { if(state.wallet<250)return toast('Need groceries','You need ₦250 for ingredients.','!'); state.wallet-=250;state.needs.hunger=clamp(state.needs.hunger+38);state.needs.fun=clamp(state.needs.fun+4);advanceTime(35);toast('Meal prepared','You made a meal at home for ₦250.','🍲'); }
    else if (kind === 'shower') {state.needs.hygiene=clamp(state.needs.hygiene+50);advanceTime(15);toast('Fresh and clean','Your hygiene improved.','🚿');}
    else if (kind === 'sofa') {state.needs.fun=clamp(state.needs.fun+18);state.energy=clamp(state.energy+8);advanceTime(30);toast('Time to relax','A little rest improved your mood.','🛋️');}
    else if (kind === 'toilet') {state.needs.bladder=clamp(state.needs.bladder+70);advanceTime(5);toast('Feeling comfortable','You took care of a basic need.','🚽');}
    state.happiness=Math.round((state.needs.fun+state.needs.social)/2);renderStats();renderCurrentPage();
  }
  function rentHome(id) {
    const h=homes.find(x=>x.id===id); if(!h)return;
    if(state.home===h.name)return toast('Already at home','This is already your current home.','⌂');
    if(state.wallet<h.rent)return toast('Not enough for first week',`You need ${money(h.rent)} for the first week of rent.`,'!');
    openModal({kicker:'FIND YOUR PLACE',title:`Rent ${h.name}?`,description:h.description,body:`<div class="balance-summary"><span>First week</span><b>${h.rent?money(h.rent):'FREE'}</b></div><div class="notice">Rent is paid in fictional game money each in-game week. This is not a real property listing.</div>`,actions:[{label:'Not now',run:closeModal},{label:'Move in →',primary:true,run:()=>{closeModal();if(state.wallet<h.rent)return toast('Not enough cash','Your balance changed.','!');state.wallet-=h.rent;state.home=h.name;state.homeRent=h.rent;state.rentDebt=0;awardXP(25);renderStats();renderCurrentPage();toast('Welcome home!',`You moved into ${h.name}. Weekly rent is ${money(h.rent)}.`,'⌂');}}]});
  }
  function buyHome(id) {
    const h=homes.find(x=>x.id===id);if(!h||state.home===h.name)return;
    if(state.wallet<h.price)return toast('Keep saving',`You need ${money(h.price-state.wallet)} more to move here.`,'!');
    openModal({kicker:'YOUR NEXT MILESTONE',title:h.price?'Make this your home?':'Move into your starter home?',description:h.description,body:`<div class="balance-summary"><span>Property cost</span><b>${h.price?money(h.price):'FREE'}</b></div><div class="modal-grid"><div class="modal-mini-stat"><small>DAILY UPKEEP</small><b>${money(h.upkeep)}</b></div><div class="modal-mini-stat"><small>AFTER PURCHASE</small><b>${money(state.wallet-h.price)}</b></div></div><div class="notice">This is a virtual home inside the game. It is not a real property listing.</div>`,actions:[{label:'Keep looking',run:closeModal},{label:'Move in →',primary:true,run:()=>{closeModal();state.wallet-=h.price;state.home=h.name;state.homeRent=0;state.rentDebt=0;state.reputation+=3;awardXP(30);renderStats();renderCurrentPage();toast('Welcome home!',`${h.name} is now your home.`,'⌂');}}]});
  }
  function rest() {if(state.energy>=100)return toast('Fully recharged','You already have full energy.','✓');state.energy=clamp(state.energy+30);state.needs.fun=clamp(state.needs.fun+5);state.needs.social=clamp(state.needs.social+2);state.happiness=clamp(state.happiness+2);state.lastRest=true;advanceTime(60);renderStats();renderCurrentPage();toast('A little reset','You restored 15 energy and feel a bit better.','☾');}
  function haveFun() {if(state.wallet<500)return toast('Save up a little','You need ₦500 for this activity.','!');state.wallet-=500;state.needs.fun=clamp(state.needs.fun+22);state.needs.social=clamp(state.needs.social+5);state.happiness=clamp(state.happiness+12);state.energy=clamp(state.energy-3);state.lastFun=true;advanceTime(45);awardXP(5);renderStats();renderCurrentPage();toast('Good vibes!',`You spent ₦500 and boosted your happiness.`, '☺');}
  function resetDaily() {const day=new Date().toDateString();if(state.dailyStamp!==day){state.completed=[];state.lastJobShift=false;state.lastRest=false;state.lastFun=false;state.dailyStamp=day;}}
  function showSettings() {
    openModal({kicker:'YOUR GAME DATA',title:'Settings & save',description:'Manage your local game progress on this device.',body:`<div class="balance-summary"><span>Saved character</span><b>${esc(state.name)}</b></div><div class="modal-grid"><div class="modal-mini-stat"><small>WALLET</small><b>${money(state.wallet)}</b></div><div class="modal-mini-stat"><small>LEVEL</small><b>${state.level}</b></div></div><div class="notice">Your progress is saved in this browser on this device. Clearing browser data or switching devices may remove or not carry over the save. Online accounts and cloud saving are not included yet.</div>`,actions:[{label:'Close',run:closeModal},{label:'Edit character',primary:false,run:()=>{closeModal();showCharacterModal();}},{label:'Export save',primary:true,run:()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='life-in-akwa-ibom-save.json';a.click();URL.revokeObjectURL(url);toast('Save exported','Keep this file as a backup of your game.','↓');closeModal();}}]});
  }
  function showNotifications() {openModal({kicker:'YOUR INBOX',title:'All caught up',description:'Your world is just getting started. New events and community features can be added in a future version.',body:`<div class="mission-page-row"><span class="mission-page-icon">✦</span><div class="mission-page-copy"><b>Welcome to your new world</b><p>Create your character, explore the city and start building your future.</p></div></div><div class="notice">This prototype does not yet include real-time notifications or other players.</div>`,actions:[{label:'Got it',primary:true,run:closeModal}]});}
  function showPlaceModal(id) {setPage('city');setTimeout(()=>{const p=places.find(x=>x.id===id)||places[0];if(p)explore(p.id);},40);}
  function init() {
    resetDaily(); renderStats();
    $$('.nav-item[data-page]').forEach(btn=>btn.addEventListener('click',()=>setPage(btn.dataset.page)));
    $$('[data-go]').forEach(btn=>btn.addEventListener('click',()=>setPage(btn.dataset.go)));
    $('#quickExplore').addEventListener('click',()=>setPage('city'));
    $('#startMission').addEventListener('click',()=>setPage('missions'));
    $('#restBtn').addEventListener('click',rest);$('#funBtn').addEventListener('click',haveFun);
    $('#eatBtn')?.addEventListener('click',()=>fulfillNeed('eat'));$('#showerBtn')?.addEventListener('click',()=>fulfillNeed('shower'));$('#bathroomBtn')?.addEventListener('click',()=>fulfillNeed('bathroom'));$('#socialBtn')?.addEventListener('click',()=>fulfillNeed('social'));
    $('#newTip').addEventListener('click',()=>{activeTip=(activeTip+1)%tips.length;$('#lifeTip').textContent=tips[activeTip];$('#tipNumber').textContent=String(activeTip+1).padStart(2,'0');});
    $('#settingsBtn').addEventListener('click',showSettings);$('#profileBtn').addEventListener('click',showCharacterModal);$('#notificationsBtn').addEventListener('click',showNotifications);
    $('#mobileMenu').addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
    $('#modalClose').addEventListener('click',closeModal);$('#modalBackdrop').addEventListener('click',e=>{if(e.target===$('#modalBackdrop'))closeModal();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});
    $$('[data-place]').forEach(btn=>btn.addEventListener('click',()=>showPlaceModal(btn.dataset.place)));
    if(!state.started) setTimeout(showCharacterModal,500);
    else if(Date.now()-state.lastVisit>1000*60*60*6) setTimeout(()=>toast('Welcome back!',`Good to see you again, ${state.name}. Your story is waiting.`,'✦'),700);
    state.lastVisit=Date.now();saveState();
  }
  init();
})();
