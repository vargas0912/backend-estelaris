const request = require('supertest');
const server = require('../../app');
const { users, employees, userprivileges, privileges, userAuditLogs } = require('../models/index');

const api = request(server.app);

let token = '';
let superId = null;
let adminToken = '';
let templateId = null;
let templatePrivilegeIds = [];
const createdEmployees = [];

const authed = (req, t = token) => req.auth(t, { type: 'bearer' });

const newEmployee = async(suffix) => {
  const res = await authed(api.post('/api/employees')).send({
    name: `Grant Access ${suffix}`,
    email: `grant.access.${suffix}@test.com`,
    phone: '8181234567',
    hire_date: '2026-01-15',
    position_id: 1,
    branch_id: 1,
    active: true
  }).expect(200);
  createdEmployees.push(res.body.employee.id);
  return res.body.employee.id;
};

describe('[EMPLOYEES] Grant access //api/employees/:id/grant-access', () => {
  test('Setup: login, template and admin with grant privilege', async() => {
    const login = await api.post('/api/auth/login')
      .send({ email: 'superadmin@estelaris.com', password: 'Admin123' }).expect(200);
    token = login.body.sesion.token;
    superId = login.body.sesion.user.id;

    const all = await authed(api.get('/api/privileges')).expect(200);
    templatePrivilegeIds = all.body.privileges.slice(0, 3).map(x => x.id);

    const tpl = await authed(api.post('/api/privilege-templates'))
      .send({ name: 'Grant access template', privileges: templatePrivilegeIds }).expect(201);
    templateId = tpl.body.template.id;

    const adm = await authed(api.post('/api/auth/register')).send({
      name: 'Grant Admin', email: 'grant.admin@test.com', role: 'admin', password: 'Test1234'
    }).expect(200);
    const adminId = adm.body.user.user.id;
    const grantPriv = await privileges.findOne({ where: { codename: 'grant_employee_access' }, raw: true });
    await authed(api.post('/api/privileges/user')).send({ user_id: adminId, privilege_id: grantPriv.id }).expect(200);
    const adminLogin = await api.post('/api/auth/login')
      .send({ email: 'grant.admin@test.com', password: 'Test1234' }).expect(200);
    adminToken = adminLogin.body.sesion.token;
  });

  test('1. With template: replace mode, template recorded, temporary password returned', async() => {
    const empId = await newEmployee('tpl');
    const res = await authed(api.post(`/api/employees/${empId}/grant-access`))
      .send({ email: 'grant.tpl@test.com', template_id: templateId }).expect(201);

    expect(res.body.employee.user_id).toBe(res.body.user.id);
    expect(res.body.user.role).toBe('user');
    expect(typeof res.body.temporaryPassword).toBe('string');
    expect(res.body.temporaryPassword.length).toBeGreaterThanOrEqual(12);
    expect(res.body.privileges).toHaveLength(templatePrivilegeIds.length);

    const user = await users.findByPk(res.body.user.id);
    expect(user.template_id).toBe(templateId);
    expect(user.must_change_password).toBe(true);
    const rows = await userprivileges.findAll({ where: { user_id: user.id }, raw: true });
    expect(rows.map(r => r.privilege_id).sort((a, b) => a - b)).toEqual([...templatePrivilegeIds].sort((a, b) => a - b));
    expect(rows.every(r => r.source_template_id === templateId)).toBe(true);
  });

  test('2. Without template: user has no privileges', async() => {
    const empId = await newEmployee('notpl');
    const res = await authed(api.post(`/api/employees/${empId}/grant-access`))
      .send({ email: 'grant.notpl@test.com' }).expect(201);

    expect(res.body.privileges).toEqual([]);
    expect(res.body.temporaryPassword).toBeDefined();
    expect(await userprivileges.count({ where: { user_id: res.body.user.id } })).toBe(0);
  });

  test('3. Login with the returned password has must_change_password: true', async() => {
    const empId = await newEmployee('login');
    const res = await authed(api.post(`/api/employees/${empId}/grant-access`))
      .send({ email: 'grant.login@test.com' }).expect(201);

    const login = await api.post('/api/auth/login')
      .send({ email: 'grant.login@test.com', password: res.body.temporaryPassword }).expect(200);
    expect(login.body.sesion.user.must_change_password).toBe(true);
  });

  test('4. Unknown template: 404 and nothing is created', async() => {
    const empId = await newEmployee('badtpl');
    await authed(api.post(`/api/employees/${empId}/grant-access`))
      .send({ email: 'grant.badtpl@test.com', template_id: 999999 }).expect(404);

    expect(await users.count({ where: { email: 'grant.badtpl@test.com' }, paranoid: false })).toBe(0);
    expect((await employees.findByPk(empId)).user_id).toBeNull();
  });

  test('5. Employee already linked to a user: 422', async() => {
    const empId = await newEmployee('twice');
    await authed(api.post(`/api/employees/${empId}/grant-access`))
      .send({ email: 'grant.twice@test.com' }).expect(201);
    const res = await authed(api.post(`/api/employees/${empId}/grant-access`))
      .send({ email: 'grant.twice2@test.com' }).expect(422);
    expect(res.body.error).toBe('EMPLOYEE_ALREADY_HAS_ACCESS');
  });

  test('6. Duplicate email: 422 and nothing is created', async() => {
    const empId = await newEmployee('dup');
    const before = await users.count();
    const res = await authed(api.post(`/api/employees/${empId}/grant-access`))
      .send({ email: 'grant.tpl@test.com', template_id: templateId }).expect(422);
    expect(res.body.error).toBe('EMAIL_ALREADY_IN_USE');
    expect(await users.count()).toBe(before);
    expect((await employees.findByPk(empId)).user_id).toBeNull();
  });

  test('7. Unknown employee: 404', async() => {
    await authed(api.post('/api/employees/999999/grant-access'))
      .send({ email: 'grant.noemp@test.com' }).expect(404);
  });

  test('8. Invalid email / invalid template_id: 400', async() => {
    const empId = await newEmployee('invalid');
    await authed(api.post(`/api/employees/${empId}/grant-access`)).send({ email: 'nope' }).expect(400);
    await authed(api.post(`/api/employees/${empId}/grant-access`))
      .send({ email: 'grant.invalid@test.com', template_id: 'abc' }).expect(400);
  });

  test('9. Admin with grant_employee_access privilege can grant access', async() => {
    const empId = await newEmployee('admin');
    await authed(api.post(`/api/employees/${empId}/grant-access`), adminToken)
      .send({ email: 'grant.byadmin@test.com', template_id: templateId }).expect(201);
  });

  test('10. Grant and revoke are recorded in the audit log', async() => {
    const empId = await newEmployee('audit');
    const res = await authed(api.post(`/api/employees/${empId}/grant-access`))
      .send({ email: 'grant.audit@test.com' }).expect(201);
    const userId = res.body.user.id;

    const granted = await userAuditLogs.findAll({ where: { target_user_id: userId, action: 'grant_access' }, raw: true });
    expect(granted).toHaveLength(1);
    expect(granted[0].caller_id).toBe(superId);

    await authed(api.delete(`/api/employees/${empId}/revoke-access`)).expect(200);

    const revoked = await userAuditLogs.findAll({ where: { target_user_id: userId, action: 'revoke_access' }, raw: true });
    expect(revoked).toHaveLength(1);
    expect(revoked[0].caller_id).toBe(superId);
  });

  test('11. Failed grant leaves no audit entry', async() => {
    const empId = await newEmployee('auditfail');
    const before = await userAuditLogs.count({ where: { action: 'grant_access' } });
    await authed(api.post(`/api/employees/${empId}/grant-access`))
      .send({ email: 'grant.auditfail@test.com', template_id: 999999 }).expect(404);
    expect(await userAuditLogs.count({ where: { action: 'grant_access' } })).toBe(before);
  });

  test('12. Assign access is recorded in the audit log', async() => {
    const empId = await newEmployee('assign');
    const reg = await authed(api.post('/api/auth/register')).send({
      name: 'Assign Target', email: 'assign.target@test.com', role: 'user', password: 'Test1234'
    }).expect(200);
    const userId = reg.body.user.user.id;

    await authed(api.post(`/api/employees/${empId}/assign-access`))
      .send({ user_id: userId, privileges: ['view_me_profile'] }).expect(201);

    const rows = await userAuditLogs.findAll({ where: { target_user_id: userId, action: 'assign_access' }, raw: true });
    expect(rows).toHaveLength(1);
    expect(rows[0].caller_id).toBe(superId);
  });
});
