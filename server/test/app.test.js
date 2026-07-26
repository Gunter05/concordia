import test from 'node:test';
import assert from 'node:assert';

// Set test environment so we bypass database connection
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_value_12345';

// Use dynamic imports to ensure process.env is configured before app is loaded
const { default: app } = await import('../src/app.js');
const { default: request } = await import('supertest');

test('GET / - Should return welcome message and operational status', async (t) => {
    const response = await request(app)
        .get('/')
        .expect(200);

    assert.strictEqual(response.body.status, "Serveur opérationnel");
    assert.match(response.body.message, /Bienvenue sur l'API de Concordia/);
});

test('GET /non-existent-route - Should return 404', async (t) => {
    const response = await request(app)
        .get('/non-existent-route')
        .expect(404);

    assert.strictEqual(response.body.message, 'Route non trouvée');
});

test('POST /api/auth/register - Should return 400 Bad Request if empty payload', async (t) => {
    const response = await request(app)
        .post('/api/auth/register')
        .send({})
        .expect(400);

    // Expecting validation errors from validateRegister middleware
    assert.ok(response.body.errors);
    assert.ok(Array.isArray(response.body.errors));

    // Check if some specific errors are present
    const fieldsWithErrors = response.body.errors.map(err => err.path || err.param);
    assert.ok(fieldsWithErrors.includes('nom'));
    assert.ok(fieldsWithErrors.includes('email'));
    assert.ok(fieldsWithErrors.includes('password'));
});

test('POST /api/auth/login - Should return 400 Bad Request if missing credentials', async (t) => {
    const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

    // Expecting validation errors from validateLogin middleware
    assert.ok(response.body.errors);
    assert.ok(Array.isArray(response.body.errors));

    const fieldsWithErrors = response.body.errors.map(err => err.path || err.param);
    assert.ok(fieldsWithErrors.includes('email'));
    assert.ok(fieldsWithErrors.includes('password'));
});
