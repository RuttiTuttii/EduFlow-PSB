import fetch from 'node-fetch';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Test data
const testUser = {
  email: `test${Date.now()}@example.com`,
  password: 'password123',
  name: 'Test User'
};

let authToken = '';
let refreshToken = '';
let userId = null;

const API_BASE = 'http://localhost:5000/api';

async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} - ${JSON.stringify(data)}`);
  }

  return data;
}

async function testAuth() {
  console.log('🧪 Testing Auth API...');

  try {
    // Test registration
    console.log('  📝 Testing user registration...');
    const registerResponse = await makeRequest('/auth/register', {
      method: 'POST',
      body: testUser
    });

    console.log('    ✅ Registration successful');
    authToken = registerResponse.authToken;
    refreshToken = registerResponse.refreshToken;
    userId = registerResponse.user.id;

    // Test duplicate registration
    console.log('  📝 Testing duplicate registration...');
    try {
      await makeRequest('/auth/register', {
        method: 'POST',
        body: testUser
      });
      throw new Error('Should have failed');
    } catch (error) {
      if (error.message.includes('Email already exists')) {
        console.log('    ✅ Duplicate registration correctly rejected');
      } else {
        throw error;
      }
    }

    // Test login
    console.log('  🔐 Testing user login...');
    const loginResponse = await makeRequest('/auth/login', {
      method: 'POST',
      body: {
        email: testUser.email,
        password: testUser.password
      }
    });
    console.log('    ✅ Login successful');

    // Test invalid login
    console.log('  🔐 Testing invalid login...');
    try {
      await makeRequest('/auth/login', {
        method: 'POST',
        body: {
          email: testUser.email,
          password: 'wrongpassword'
        }
      });
      throw new Error('Should have failed');
    } catch (error) {
      if (error.message.includes('Invalid credentials')) {
        console.log('    ✅ Invalid login correctly rejected');
      } else {
        throw error;
      }
    }

    // Test token refresh
    console.log('  🔄 Testing token refresh...');
    const refreshResponse = await makeRequest('/auth/refresh', {
      method: 'POST',
      body: { refreshToken }
    });
    console.log('    ✅ Token refresh successful');

    console.log('✅ Auth API tests passed!');

  } catch (error) {
    console.error('❌ Auth API test failed:', error.message);
    throw error;
  }
}

async function cleanup() {
  console.log('🧹 Test data cleanup note:');
  console.log(`    Test user created: ${testUser.email}`);
  console.log('    This user will remain in the database for manual cleanup if needed.');
  console.log('    ✅ Tests completed successfully!');
}

async function runTests() {
  try {
    console.log('🚀 Starting API tests...\n');

    // Start the server
    console.log('🔧 Starting server...');
    const serverProcess = exec('npm run dev', { cwd: process.cwd() });

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Run tests
    await testAuth();

    // Clean up
    await cleanup();

    // Stop server
    serverProcess.kill();

    console.log('\n🎉 All tests passed!');

  } catch (error) {
    console.error('\n💥 Tests failed:', error);
    process.exit(1);
  }
}

// Run the tests
runTests();