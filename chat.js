/* Town Square chat. Demo mode works locally; Supabase mode works across devices after setup. */
const $chat = (selector) => document.querySelector(selector);
const chatEls = {
  launcher: $chat('#chatLauncher'), panel: $chat('#chatPanel'), close: $chat('#chatClose'),
  nav: $chat('#chatNavButton'), status: $chat('#chatStatusText'), launcherStatus: $chat('#chatLauncherStatus'),
  statusDot: $chat('#chatStatusDot'), note: $chat('#chatModeNote'), name: $chat('#chatDisplayName'),
  saveName: $chat('#chatNameSave'), messages: $chat('#chatMessages'), form: $chat('#chatForm'),
  input: $chat('#chatMessageInput'), send: $chat('#chatSendButton'), count: $chat('#chatCharCount'),
  transport: $chat('#chatTransportNote'), unread: $chat('#chatUnread')
};
const CHAT_KEY = 'lia-town-square-demo-v1';
const NAME_KEY = 'lia-town-square-name-v1';
let supabase = null, currentUser = null, channel = null, live = false, unread = 0;
let messages = [];
const configured = () => {
  const c = window.LIA_CHAT_CONFIG || {};
  return c.supabaseUrl && !c.supabaseUrl.includes('YOUR-PROJECT') && c.supabaseAnonKey && !c.supabaseAnonKey.includes('YOUR_SUPABASE');
};
const safe = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const localName = () => localStorage.getItem(NAME_KEY) || localStorage.getItem('lia-player-name') || 'Resident';
const stamp = (iso) => { try { return new Date(iso).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}); } catch { return ''; } };
function setStatus(text, isLive = false) {
  if (chatEls.status) chatEls.status.textContent = text;
  if (chatEls.launcherStatus) chatEls.launcherStatus.textContent = isLive ? 'Live community' : 'Demo chat on this browser';
  if (chatEls.transport) chatEls.transport.textContent = isLive ? 'Connected live' : 'Local demo';
  if (chatEls.statusDot) chatEls.statusDot.classList.toggle('is-live', isLive);
}
function toggle(open) {
  if (!chatEls.panel || !chatEls.launcher) return;
  const show = typeof open === 'boolean' ? open : chatEls.panel.classList.contains('hidden');
  chatEls.panel.classList.toggle('hidden', !show);
  chatEls.launcher.setAttribute('aria-expanded', String(show));
  if (show) { unread = 0; renderUnread(); setTimeout(() => chatEls.input?.focus(), 50); scrollBottom(); }
}
function renderUnread() {
  if (!chatEls.unread) return;
  chatEls.unread.textContent = String(unread);
  chatEls.unread.classList.toggle('hidden', unread < 1);
}
function scrollBottom() { if (chatEls.messages) chatEls.messages.scrollTop = chatEls.messages.scrollHeight; }
function renderMessages() {
  if (!chatEls.messages) return;
  if (!messages.length) {
    chatEls.messages.innerHTML = '<div class="chat-welcome"><span>👋</span><b>Welcome to Town Square</b><p>Say hello, share your progress, and meet other residents.</p></div>';
    return;
  }
  chatEls.messages.innerHTML = messages.slice(-100).map(m => {
    const mine = currentUser && m.user_id === currentUser.id;
    return `<article class="chat-message ${mine ? 'mine' : ''}"><div class="chat-message-meta"><b>${safe(m.display_name || 'Resident')}</b><time>${stamp(m.created_at || new Date().toISOString())}</time></div><p>${safe(m.message || '')}</p></article>`;
  }).join('');
  scrollBottom();
}
function saveDemoMessages() { try { localStorage.setItem(CHAT_KEY, JSON.stringify(messages.slice(-100))); } catch {} }
function loadDemoMessages() { try { const value = JSON.parse(localStorage.getItem(CHAT_KEY) || '[]'); return Array.isArray(value) ? value : []; } catch { return []; } }
function updateName() {
  const name = (chatEls.name?.value || '').trim().replace(/\s+/g, ' ').slice(0,22);
  if (!name) { setStatus('Enter a display name', live); chatEls.name?.focus(); return; }
  localStorage.setItem(NAME_KEY, name);
  if (live && supabase && currentUser) {
    supabase.from('chat_profiles').upsert({id:currentUser.id, display_name:name, updated_at:new Date().toISOString()}).then(({error}) => {
      if (error) setStatus('Name save failed', false); else setStatus('Connected live', true);
    });
  } else setStatus('Demo chat ready', false);
}
async function sendMessage(text) {
  const message = String(text || '').trim();
  if (!message) return;
  if (message.length > 500) { setStatus('Messages are limited to 500 characters', live); return; }
  const display_name = localName().trim().slice(0,22) || 'Resident';
  if (live && supabase && currentUser) {
    const { error } = await supabase.from('chat_messages').insert({user_id:currentUser.id, display_name, message});
    if (error) { setStatus(error.message.includes('wait') ? 'Please wait before sending again' : 'Could not send — check chat setup', false); return; }
    if (chatEls.input) chatEls.input.value = '';
    updateCount();
    return;
  }
  const item = {id:`local-${Date.now()}-${Math.random().toString(36).slice(2,7)}`, user_id:'local-self', display_name, message, created_at:new Date().toISOString()};
  messages.push(item); messages = messages.slice(-100); saveDemoMessages(); renderMessages();
  if (chatEls.input) chatEls.input.value = '';
  updateCount();
  setStatus('Demo mode — only this browser', false);
}
function updateCount() {
  if (chatEls.count) chatEls.count.textContent = `${(chatEls.input?.value || '').length}/500`;
  if (chatEls.send) chatEls.send.disabled = !(chatEls.input?.value || '').trim();
}
async function connectLive() {
  try {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const config = window.LIA_CHAT_CONFIG;
    supabase = createClient(config.supabaseUrl, config.supabaseAnonKey, {auth:{persistSession:true, autoRefreshToken:true, detectSessionInUrl:true}});
    const {data:authData, error:authError} = await supabase.auth.getSession();
    if (authError) throw authError;
    if (!authData.session) {
      const {data, error} = await supabase.auth.signInAnonymously();
      if (error) throw error;
      currentUser = data.user;
    } else currentUser = authData.session.user;
    const display_name = localName();
    const {error:profileError} = await supabase.from('chat_profiles').upsert({id:currentUser.id, display_name, updated_at:new Date().toISOString()});
    if (profileError) throw profileError;
    const {data, error:loadError} = await supabase.from('chat_messages').select('id,user_id,display_name,message,created_at').order('created_at',{ascending:true}).limit(100);
    if (loadError) throw loadError;
    messages = data || []; live = true; setStatus('Connected live', true); chatEls.note.textContent = 'Live Town Square — messages are visible to all players.'; renderMessages();
    channel = supabase.channel('town-square-public').on('postgres_changes',{event:'INSERT',schema:'public',table:'chat_messages'},payload => {
      const m = payload.new;
      if (!messages.some(existing => String(existing.id) === String(m.id))) {
        messages.push(m); messages = messages.slice(-100); renderMessages();
        if (chatEls.panel.classList.contains('hidden') && m.user_id !== currentUser.id) { unread++; renderUnread(); }
      }
    }).subscribe(status => { if (status === 'SUBSCRIBED') setStatus('Connected live', true); });
  } catch (error) {
    console.warn('Town Square is using demo mode:', error);
    live = false; messages = loadDemoMessages(); renderMessages();
    setStatus(configured() ? 'Live setup needs attention' : 'Demo chat — setup required', false);
    if (chatEls.note) chatEls.note.textContent = configured() ? 'Live chat could not connect. Check the Supabase setup guide.' : 'Demo mode is active. Configure Supabase to chat with players on other devices.';
  }
}
function initChat() {
  if (!chatEls.launcher) return;
  if (chatEls.name) chatEls.name.value = localName();
  messages = loadDemoMessages(); renderMessages(); updateCount();
  chatEls.launcher.addEventListener('click', () => toggle());
  chatEls.close?.addEventListener('click', () => toggle(false));
  chatEls.nav?.addEventListener('click', () => toggle(true));
  chatEls.saveName?.addEventListener('click', updateName);
  chatEls.name?.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); updateName(); } });
  chatEls.input?.addEventListener('input', updateCount);
  chatEls.form?.addEventListener('submit', async e => { e.preventDefault(); const value = chatEls.input.value; await sendMessage(value); });
  window.addEventListener('storage', e => {
    if (e.key === CHAT_KEY && !live) { messages = loadDemoMessages(); renderMessages(); }
    if (e.key === NAME_KEY && chatEls.name) chatEls.name.value = localName();
  });
  setStatus('Starting chat…', false);
  if (configured()) connectLive(); else setStatus('Demo chat — setup required', false);
}
initChat();
