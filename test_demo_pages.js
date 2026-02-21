#!/usr/bin/env node
/**
 * Demo Page Tester for Abdullah Junior
 * This script tests all pages and generates a report
 */

const http = require('http');

const PAGES = [
  { name: 'Dashboard', url: 'http://localhost:3000/' },
  { name: 'Tasks', url: 'http://localhost:3000/tasks' },
  { name: 'Analytics', url: 'http://localhost:3000/analytics' },
  { name: 'Skills', url: 'http://localhost:3000/skills' },
];

const API_ENDPOINTS = [
  { name: 'Health', url: 'http://localhost:8000/api/health' },
  { name: 'Analytics API', url: 'http://localhost:8000/api/analytics' },
  { name: 'Tasks API', url: 'http://localhost:8000/api/tasks/pending?limit=10' },
];

function fetchUrl(url, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, { timeout }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          ok: res.statusCode >= 200 && res.statusCode < 300,
          data: data.substring(0, 500),
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testPages() {
  console.log('\n========================================');
  console.log('  Abdullah Junior - Demo Page Tester');
  console.log('========================================\n');

  console.log('Testing Frontend Pages:\n');
  for (const page of PAGES) {
    process.stdout.write(`  ${page.name}... `);
    try {
      const result = await fetchUrl(page.url);
      if (result.ok) {
        console.log(`✓ OK (${result.status})`);
      } else {
        console.log(`✗ FAILED (${result.status})`);
      }
    } catch (error) {
      console.log(`✗ ERROR: ${error.message}`);
    }
  }

  console.log('\nTesting Backend API Endpoints:\n');
  for (const endpoint of API_ENDPOINTS) {
    process.stdout.write(`  ${endpoint.name}... `);
    try {
      const result = await fetchUrl(endpoint.url);
      if (result.ok) {
        console.log(`✓ OK (${result.status})`);
      } else {
        console.log(`✗ FAILED (${result.status})`);
      }
    } catch (error) {
      console.log(`✗ ERROR: ${error.message}`);
    }
  }

  console.log('\n========================================\n');
}

testPages().catch(console.error);
