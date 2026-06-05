// ─────────────────────────────────────────────
//  AUTH — gestion connexion / session
// ─────────────────────────────────────────────

const Auth = {
  currentUser: null,
  currentProfile: null,

  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await Auth.loadProfile(data.user.id);
    return data.user;
  },

  async logout() {
    await supabase.auth.signOut();
    Auth.currentUser = null;
    Auth.currentProfile = null;
  },

  async loadProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    Auth.currentProfile = data;
    return data;
  },

  async getSession() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return null;
    Auth.currentUser = data.session.user;
    await Auth.loadProfile(data.session.user.id);
    return data.session;
  },

  isManager() {
    return Auth.currentProfile?.role === 'manager';
  },

  isDriver() {
    return Auth.currentProfile?.role === 'driver';
  },

  getInitials(name) {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
};
