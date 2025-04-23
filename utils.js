let contextEnabled = false; // Estado inicial do contexto
const startTime = Date.now(); // Marca o início do bot

module.exports = {
  // Alterna o estado do contexto
  setContextEnabled: (status) => {
    contextEnabled = status;
  },

  // Retorna o estado atual do contexto
  getContextStatus: () => {
    return contextEnabled;
  },

  // Retorna o tempo de atividade do bot
  getUptime: () => {
    const uptime = Date.now() - startTime;
    const seconds = Math.floor((uptime / 1000) % 60);
    const minutes = Math.floor((uptime / (1000 * 60)) % 60);
    const hours = Math.floor((uptime / (1000 * 60 * 60)) % 24);
    return `${hours}h ${minutes}m ${seconds}s`;
  },

  // Retorna o nível do usuário (admin ou user)
  getUserLevel: (userId) => {
    return userId === process.env.OWNER_ID ? "admin" : "user";
  },
};