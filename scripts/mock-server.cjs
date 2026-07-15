const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const host = '127.0.0.1';
const port = 4173;
const root = path.resolve(__dirname, '..');
const records = new Map();

const seedResponse = {
  account_id: 'seed-valid',
  account_email: 'test123@gmail.com',
  start_date: '2024-03-15T16:00:00+05:30',
  end_date: '2024-03-15T16:02:00+05:30',
  locale: 'en-IN',
  text: 'agile methodology process',
  suggestion_list: 'agile methodology process, agile methodology process testing',
  completed: true
};
records.set(seedResponse.account_id, seedResponse);

function sendJson(response, status, payload) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*'
  });
  response.end(JSON.stringify(payload));
}

function sendFile(response, filename, contentType) {
  fs.readFile(filename, (error, content) => {
    if (error) {
      sendJson(response, 404, { error: 'Not found' });
      return;
    }
    response.writeHead(200, { 'Content-Type': contentType });
    response.end(content);
  });
}

function isBcp47(value) {
  return typeof value === 'string' && /^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/.test(value);
}

function isIstTimestamp(value) {
  return typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?\+05:30$/.test(value) &&
    !Number.isNaN(Date.parse(value));
}

function validatePayload(payload) {
  const required = [
    'account_id', 'account_email', 'start_date', 'end_date',
    'locale', 'text', 'suggestion_list', 'completed'
  ];
  for (const field of required) {
    if (!(field in payload)) return `Missing required field: ${field}`;
  }
  if (typeof payload.account_id !== 'string' || !payload.account_id) return 'account_id must be a non-empty string';
  if (typeof payload.account_email !== 'string' || !payload.account_email.includes('@')) return 'account_email must be a valid email';
  if (!isIstTimestamp(payload.start_date)) return 'start_date must be an IST local timestamp with +05:30 offset';
  if (!isIstTimestamp(payload.end_date)) return 'end_date must be an IST local timestamp with +05:30 offset';
  if (Date.parse(payload.end_date) < Date.parse(payload.start_date)) return 'end_date must not precede start_date';
  if (!isBcp47(payload.locale)) return 'locale must be a valid BCP 47 language tag';
  if (typeof payload.text !== 'string') return 'text must be a string';
  if (typeof payload.suggestion_list !== 'string') return 'suggestion_list must be a string';
  if (typeof payload.completed !== 'boolean') return 'completed must be a boolean';
  return null;
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    });
    response.end();
    return;
  }

  if (request.method === 'GET' && url.pathname === '/health') {
    sendJson(response, 200, { status: 'ok' });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/autocomplete-form') {
    sendFile(response, path.join(root, 'mock-app', 'index.html'), 'text/html; charset=utf-8');
    return;
  }

  if (request.method === 'GET' && url.pathname === '/app.js') {
    sendFile(response, path.join(root, 'mock-app', 'app.js'), 'application/javascript; charset=utf-8');
    return;
  }

  if (request.method === 'GET' && url.pathname.startsWith('/api/responses/')) {
    const accountId = decodeURIComponent(url.pathname.split('/').pop());
    const record = records.get(accountId);
    if (!record) {
      sendJson(response, 404, { error: 'Response not found' });
      return;
    }
    sendJson(response, 200, record);
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/responses') {
    let raw = '';
    request.on('data', chunk => { raw += chunk; });
    request.on('end', () => {
      let payload;
      try {
        payload = JSON.parse(raw || '{}');
      } catch (_error) {
        sendJson(response, 400, { error: 'Invalid JSON body' });
        return;
      }

      const validationError = validatePayload(payload);
      if (validationError) {
        sendJson(response, 400, { error: validationError });
        return;
      }

      records.set(payload.account_id, payload);
      sendJson(response, 200, payload);
    });
    return;
  }

  sendJson(response, 404, { error: 'Not found' });
});

server.listen(port, host, () => {
  console.log(`Mock autocomplete app running at http://${host}:${port}/autocomplete-form`);
});
