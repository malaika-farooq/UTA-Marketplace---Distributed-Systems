import autocannon from 'autocannon';
import axios from 'axios';
import chalk from 'chalk';

const BASE_URL = 'http://localhost:9000';
let authToken = '';
let userId = '';

async function setupTestUser() {
  console.log(chalk.blue('Setting up test user...'));
  
  const email = `testuser_${Date.now()}@example.com`;
  const password = 'TestPassword123!';
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/register`, {
      email,
      password,
      full_name: 'Test User',
      phone: '1234567890'
    });
    
    authToken = response.data.token;
    userId = response.data.user_id;
    console.log(chalk.green('Test user created successfully'));
  } catch (error) {
    console.log(chalk.yellow('User might already exist, trying to login...'));
    
    try {
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: 'test@example.com',
        password: 'password123'
      });
      authToken = loginResponse.data.token;
      userId = loginResponse.data.user_id;
      console.log(chalk.green('Logged in with existing user'));
    } catch (loginError) {
      console.error(chalk.red('Failed to setup test user'));
      throw loginError;
    }
  }
}

function runTest(name, config) {
  return new Promise((resolve, reject) => {
    console.log(chalk.cyan(`\n${'='.repeat(60)}`));
    console.log(chalk.cyan(`Running test: ${name}`));
    console.log(chalk.cyan('='.repeat(60)));
    
    const instance = autocannon(config, (err, result) => {
      if (err) {
        console.error(chalk.red(`Error in ${name}:`), err);
        reject(err);
      } else {
        console.log(chalk.green(`\nResults for ${name}:`));
        console.log(chalk.yellow(`  Requests: ${result.requests.total}`));
        console.log(chalk.yellow(`  Duration: ${result.duration}s`));
        console.log(chalk.yellow(`  Throughput: ${result.throughput.mean} req/sec`));
        console.log(chalk.yellow(`  Latency (mean): ${result.latency.mean.toFixed(2)} ms`));
        console.log(chalk.yellow(`  Latency (p50): ${result.latency.p50} ms`));
        console.log(chalk.yellow(`  Latency (p95): ${result.latency.p95} ms`));
        console.log(chalk.yellow(`  Latency (p99): ${result.latency.p99} ms`));
        resolve(result);
      }
    });
    
    autocannon.track(instance);
  });
}

async function runAllTests() {
  console.log(chalk.bold.blue('\n🏛️  MONOLITHIC ARCHITECTURE PERFORMANCE TEST\n'));
  
  try {
    await setupTestUser();
    
    const results = {};
    
    results.register = await runTest('POST /api/auth/register', {
      url: `${BASE_URL}/api/auth/register`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: `user_${Date.now()}@example.com`,
        password: 'password123',
        full_name: 'Performance Test User',
        phone: '1234567890'
      }),
      connections: 10,
      duration: 10
    });
    
    results.login = await runTest('POST /api/auth/login', {
      url: `${BASE_URL}/api/auth/login`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      }),
      connections: 10,
      duration: 10
    });
    
    results.getListings = await runTest('GET /api/listings', {
      url: `${BASE_URL}/api/listings`,
      connections: 20,
      duration: 15
    });
    
    results.searchListings = await runTest('GET /api/search/listings', {
      url: `${BASE_URL}/api/search/listings?query=laptop`,
      connections: 20,
      duration: 15
    });
    
    results.createListing = await runTest('POST /api/listings (authenticated)', {
      url: `${BASE_URL}/api/listings`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        title: 'Performance Test Item',
        description: 'Test description',
        price: 99.99,
        category_id: 'electronics',
        condition_id: 'new',
        seller_email: 'test@example.com',
        seller_whatsapp: '1234567890',
        image_url: 'https://example.com/image.jpg',
        meet_spot_id: 'library'
      }),
      connections: 10,
      duration: 10
    });
    
    results.getUserProfile = await runTest('GET /api/user/profile (authenticated)', {
      url: `${BASE_URL}/api/user/profile`,
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      connections: 15,
      duration: 10
    });
    
    results.getTrending = await runTest('GET /api/analytics/trending', {
      url: `${BASE_URL}/api/analytics/trending?limit=10`,
      connections: 15,
      duration: 10
    });
    
    console.log(chalk.bold.green('\n✅ All tests completed successfully!\n'));
    
    console.log(chalk.bold.blue('SUMMARY REPORT:'));
    console.log(chalk.blue('='.repeat(60)));
    
    const summary = {
      totalRequests: 0,
      avgThroughput: 0,
      avgLatency: 0,
      avgP95: 0,
      avgP99: 0
    };
    
    let testCount = 0;
    for (const [name, result] of Object.entries(results)) {
      summary.totalRequests += result.requests.total;
      summary.avgThroughput += result.throughput.mean;
      summary.avgLatency += result.latency.mean;
      summary.avgP95 += result.latency.p95;
      summary.avgP99 += result.latency.p99;
      testCount++;
    }
    
    summary.avgThroughput /= testCount;
    summary.avgLatency /= testCount;
    summary.avgP95 /= testCount;
    summary.avgP99 /= testCount;
    
    console.log(chalk.yellow(`Total Requests Across All Tests: ${summary.totalRequests}`));
    console.log(chalk.yellow(`Average Throughput: ${summary.avgThroughput.toFixed(2)} req/sec`));
    console.log(chalk.yellow(`Average Latency (mean): ${summary.avgLatency.toFixed(2)} ms`));
    console.log(chalk.yellow(`Average Latency (p95): ${summary.avgP95.toFixed(2)} ms`));
    console.log(chalk.yellow(`Average Latency (p99): ${summary.avgP99.toFixed(2)} ms`));
    
    console.log(chalk.blue('='.repeat(60)));
    
    return results;
    
  } catch (error) {
    console.error(chalk.red('\n❌ Test failed:'), error.message);
    process.exit(1);
  }
}

runAllTests();
