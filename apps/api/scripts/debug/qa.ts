

const BASE_URL = 'http://localhost:3333';

async function qa() {
  console.log('--- Starting QA Tests ---');

  // Test 1: Log in as Pre-sales using Phone Number
  console.log('\n[Test 1] Logging in as Pre-sales (Phone: 1234567800)');
  const loginRes1 = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // Notice how we use phone number in the email field! Our interceptor in auth.ts handles it.
    body: JSON.stringify({ email: '1234567800', password: 'admin123' }),
  });

  if (!loginRes1.ok) {
    throw new Error(`Login failed: ${await loginRes1.text()}`);
  }

  const cookie1 = loginRes1.headers.getSetCookie().join('; ');
  const loginData1 = await loginRes1.json();
  console.log('Login successful! Session returned for roleId:', loginData1.user.roleId);

  // Test 2: Access Pre-sales Dashboard
  console.log('\n[Test 2] Accessing Pre-sales Dashboard...');
  const presalesRes = await fetch(`${BASE_URL}/dashboard/pre-sales`, {
    headers: { Cookie: cookie1 },
  });

  if (presalesRes.ok) {
    console.log('✅ Access GRANTED to Pre-sales dashboard');
  } else {
    throw new Error(`Expected access granted, got ${presalesRes.status}`);
  }

  // Test 3: Attempt to Access Admin Dashboard
  console.log('\n[Test 3] Attempting to access Admin Dashboard as Pre-sales user...');
  const adminRes = await fetch(`${BASE_URL}/dashboard/admin`, {
    headers: { Cookie: cookie1 },
  });

  if (adminRes.status === 403) {
    console.log('✅ Access DENIED to Admin dashboard (403 Forbidden as expected)');
  } else {
    throw new Error(`Expected 403 Forbidden, got ${adminRes.status}`);
  }

  // Test 4: Log in as Admin using Phone Number
  console.log('\n[Test 4] Logging in as Admin (Phone: 1234567808)');
  const loginRes2 = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: '1234567808', password: 'admin123' }),
  });

  const cookie2 = loginRes2.headers.getSetCookie().join('; ');

  // Test 5: Access Admin Dashboard as Admin
  console.log('\n[Test 5] Accessing Admin Dashboard as Admin...');
  const adminRes2 = await fetch(`${BASE_URL}/dashboard/admin`, {
    headers: { Cookie: cookie2 },
  });

  if (adminRes2.ok) {
    console.log('✅ Access GRANTED to Admin dashboard');
  } else {
    throw new Error(`Expected access granted, got ${adminRes2.status}`);
  }

  console.log('\n🎉 All QA Tests Passed Successfully!');
}

qa().catch(err => {
  console.error('\n❌ QA Test Failed:', err);
  process.exit(1);
});
