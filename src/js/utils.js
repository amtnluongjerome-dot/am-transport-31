// ─────────────────────────────────────────────
//  UTILS
// ─────────────────────────────────────────────
function toast(msg, duration = 3000) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), duration);
}
function fmtDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function fmtDatetime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}
function fmtKm(val) {
  if (!val && val !== 0) return '—';
  return Number(val).toLocaleString('fr-FR') + ' km';
}
function fmtNum(val) {
  if (!val && val !== 0) return '—';
  return Number(val).toLocaleString('fr-FR');
}
function today() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().split('T')[0];
}
function initials(name) {
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}
function avatarBg(name) {
  const colors = [
    { bg: '#E6F1FB', color: '#185FA5' },
    { bg: '#EAF3DE', color: '#3B6D11' },
    { bg: '#FAEEDA', color: '#854F0B' },
    { bg: '#FBEAF0', color: '#993556' },
    { bg: '#E1F5EE', color: '#0F6E56' },
    { bg: '#EEEDFE', color: '#3C3489' },
  ];
  const idx = (name || '').charCodeAt(0) % colors.length;
  return colors[idx];
}
function avatarHTML(name, size = 34) {
  const c = avatarBg(name);
  return `<div class="av" style="width:${size}px;height:${size}px;font-size:${Math.round(size*0.35)}px;background:${c.bg};color:${c.color};">${initials(name)}</div>`;
}
function statusBadge(status) {
  const map = {
    'cloture':    '<span class="badge b-green">Clôturé</span>',
    'en_tournee': '<span class="badge b-blue">En tournée</span>',
    'absent':     '<span class="badge b-red">Absent</span>',
    'non_cloture':'<span class="badge b-amber">Non clôturé</span>',
    'disponible': '<span class="badge b-gray">Disponible</span>',
    'en_service': '<span cl
