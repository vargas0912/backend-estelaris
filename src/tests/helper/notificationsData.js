const superadminLogin = {
  email: 'superadmin@estelaris.com',
  password: 'Admin123'
};

const buildUser = (suffix, role = 'user') => ({
  name: `Notif ${suffix}`,
  email: `notif_${suffix}@test.com`,
  role,
  password: 'Test1234'
});

const HOUR = 60 * 60 * 1000;
const inFuture = (hours = 1) => new Date(Date.now() + hours * HOUR).toISOString();
const inPast = (hours = 1) => new Date(Date.now() - hours * HOUR).toISOString();

const notificationNoTitle = { body: 'Sin titulo', user_ids: [1] };
const notificationNoBody = { title: 'Sin cuerpo', user_ids: [1] };
const notificationNoRecipients = { title: 'Sin destinatarios', body: 'Nadie' };
const notificationBothRecipients = { title: 'Ambos', body: 'Ambos', user_ids: [1], branch_id: 1 };
const notificationUserIdsNotArray = { title: 'x', body: 'x', user_ids: 'abc' };
const notificationBadScheduledAt = { title: 'x', body: 'x', user_ids: [1], scheduled_at: 'manana' };

module.exports = {
  superadminLogin,
  buildUser,
  inFuture,
  inPast,
  notificationNoTitle,
  notificationNoBody,
  notificationNoRecipients,
  notificationBothRecipients,
  notificationUserIdsNotArray,
  notificationBadScheduledAt
};
