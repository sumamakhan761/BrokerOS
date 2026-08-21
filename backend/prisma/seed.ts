import { prismaClient as prisma } from '../src/lib/database/prisma-client.js';
import { auth } from '../src/lib/auth.js';

// ============================================================
// DEMO SEED — BrokerOS
// ============================================================
//
// Creates a fully functional demo environment:
//
// 👥 Users (23 total) — All password: Demo@1234
//    Brokerage: Pre-Sales Manager, 3× Pre-Sales, Sales Manager,
//               3× Sales Exec, Post-Sales Manager, 3× Post-Sales,
//               Finance, Business Manager, Director, Admin
//    CP World:  Channel Partner, 3× Sourcing Manager, 3× Closing Manager
//
// 🏗️  Projects
//    Brokerage (isCpProject=false): Luxury Villas, Sunrise Valley, Green Meadows
//    CP Exclusive (isCpProject=true): Grand Horizon
//
// 📋 Brokerage Leads (40 total)
//    Pre-Sales 1: 10  |  Pre-Sales 2: 5  |  Pre-Sales 3: 5
//    Sales Exec 1: 10 (luxury-villas) | Sales Exec 2: 5 (sunrise-valley)
//    Sales Exec 3: 5 (green-meadows)  ← each exec stays in their project
//
// 📦 Bookings (7 brokerage + 2 CP)
//    Post-Sales team (3 agents) shares 7 brokerage bookings round-robin
//
// 🤝 CP World
//    3 external Brokers managed by Sourcing Manager 1
//    5 CP leads, 2 CP bookings with BrokerageRecords
//    BRK-001 → Closing Manager 1 | BRK-002 → Closing Manager 2 | BRK-003 → Closing Manager 3
// ============================================================


const DEMO_PASSWORD = 'Demo@1234';

// ── 1. ROLES ────────────────────────────────────────────────

const ROLES = [
  { name: 'Pre-sales', code: 'PRE_SALES' },
  { name: 'Pre-sales Manager', code: 'PRE_SALES_MANAGER' },
  { name: 'Sales Executive', code: 'SALES_EXECUTIVE' },
  { name: 'Sales Manager', code: 'SALES_MANAGER' },
  { name: 'Post-sales Manager', code: 'POST_SALES_MANAGER' },
  { name: 'Post-sales', code: 'POST_SALES' },
  { name: 'Finance', code: 'FINANCE' },
  { name: 'Business Manager', code: 'BUSINESS_MANAGER' },
  { name: 'Director', code: 'DIRECTOR' },
  { name: 'Admin', code: 'ADMIN' },
  { name: 'Sourcing Manager', code: 'SOURCING_MANAGER' },
  { name: 'Closing Manager', code: 'CLOSING_MANAGER' },
  { name: 'Channel Partner', code: 'CHANNEL_PARTNER' },
];

// ── 2. DEMO USERS ───────────────────────────────────────────

const DEMO_USERS = [
  // ── Brokerage World ──
  { name: 'Pre-Sales Manager', email: 'presalesmanager@demo.com', username: 'presalesmanager', phone: '9800000001', roleCode: 'PRE_SALES_MANAGER' },
  { name: 'Pre-Sales Agent 1', email: 'presales1@demo.com', username: 'presales1', phone: '9800000002', roleCode: 'PRE_SALES' },
  { name: 'Pre-Sales Agent 2', email: 'presales2@demo.com', username: 'presales2', phone: '9800000003', roleCode: 'PRE_SALES' },
  { name: 'Pre-Sales Agent 3', email: 'presales3@demo.com', username: 'presales3', phone: '9800000004', roleCode: 'PRE_SALES' },
  { name: 'Sales Manager', email: 'salesmanager@demo.com', username: 'salesmanager', phone: '9800000005', roleCode: 'SALES_MANAGER' },
  { name: 'Sales Executive 1', email: 'salesexec1@demo.com', username: 'salesexec1', phone: '9800000006', roleCode: 'SALES_EXECUTIVE' },
  { name: 'Sales Executive 2', email: 'salesexec2@demo.com', username: 'salesexec2', phone: '9800000007', roleCode: 'SALES_EXECUTIVE' },
  { name: 'Sales Executive 3', email: 'salesexec3@demo.com', username: 'salesexec3', phone: '9800000008', roleCode: 'SALES_EXECUTIVE' },
  { name: 'Post-Sales Manager', email: 'postsalesmanager@demo.com', username: 'postsalesmanager', phone: '9800000009', roleCode: 'POST_SALES_MANAGER' },
  { name: 'Post Sales 1', email: 'postsales1@demo.com', username: 'postsales1', phone: '9800000021', roleCode: 'POST_SALES' },
  { name: 'Post Sales 2', email: 'postsales2@demo.com', username: 'postsales2', phone: '9800000022', roleCode: 'POST_SALES' },
  { name: 'Post Sales 3', email: 'postsales3@demo.com', username: 'postsales3', phone: '9800000023', roleCode: 'POST_SALES' },
  { name: 'Finance', email: 'finance@demo.com', username: 'finance', phone: '9800000010', roleCode: 'FINANCE' },
  { name: 'Business Manager', email: 'businessmanager@demo.com', username: 'businessmanager', phone: '9800000011', roleCode: 'BUSINESS_MANAGER' },
  { name: 'Director', email: 'director@demo.com', username: 'director', phone: '9800000012', roleCode: 'DIRECTOR' },
  { name: 'Admin', email: 'admin@demo.com', username: 'admin', phone: '9800000013', roleCode: 'ADMIN' },
  // ── CP World ──
  { name: 'Channel Partner', email: 'cp1@demo.com', username: 'cp1', phone: '9800000014', roleCode: 'CHANNEL_PARTNER' },
  { name: 'Sourcing Manager 1', email: 'sourcingmanager1@demo.com', username: 'sourcingmanager1', phone: '9800000015', roleCode: 'SOURCING_MANAGER' },
  { name: 'Sourcing Manager 2', email: 'sourcingmanager2@demo.com', username: 'sourcingmanager2', phone: '9800000016', roleCode: 'SOURCING_MANAGER' },
  { name: 'Sourcing Manager 3', email: 'sourcingmanager3@demo.com', username: 'sourcingmanager3', phone: '9800000017', roleCode: 'SOURCING_MANAGER' },
  { name: 'Closing Manager 1', email: 'closingmanager1@demo.com', username: 'closingmanager1', phone: '9800000018', roleCode: 'CLOSING_MANAGER' },
  { name: 'Closing Manager 2', email: 'closingmanager2@demo.com', username: 'closingmanager2', phone: '9800000019', roleCode: 'CLOSING_MANAGER' },
  { name: 'Closing Manager 3', email: 'closingmanager3@demo.com', username: 'closingmanager3', phone: '9800000020', roleCode: 'CLOSING_MANAGER' },
];

// ── Helper: create or find user via BetterAuth ───────────────

async function upsertUser(userData: typeof DEMO_USERS[0], roleId: string) {
  // Check if already exists by phone
  let user = await prisma.user.findUnique({ where: { phoneNumber: userData.phone } });
  if (!user) {
    try {
      const response = await auth.api.signUpEmail({
        body: {
          email: userData.email,
          password: DEMO_PASSWORD,
          name: userData.name,
          username: userData.username,
          phoneNumber: userData.phone,
        },
      });
      if (response?.user) {
        user = await prisma.user.findUnique({ where: { id: response.user.id } });
      }
    } catch (err) {
      // May already exist by email — fallback
      user = await prisma.user.findUnique({ where: { email: userData.email } });
    }
  }
  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { roleId, email: userData.email, username: userData.username }
    });
  }
  return user;
}

// ── Helper: build inventory for a project ───────────────────

async function buildInventory(projectId: string, towerCount = 2, floorCount = 10, unitsPerFloor = 4) {
  for (let t = 1; t <= towerCount; t++) {
    const towerName = `Tower ${t === 1 ? 'A' : 'B'}`;
    let tower = await prisma.tower.findFirst({ where: { projectId, name: towerName } });
    if (!tower) {
      tower = await prisma.tower.create({
        data: { projectId, name: towerName, totalFloors: floorCount, totalUnits: floorCount * unitsPerFloor },
      });
    }
    for (let f = 1; f <= floorCount; f++) {
      let floor = await prisma.floor.findUnique({
        where: { towerId_floorNumber: { towerId: tower.id, floorNumber: f } },
      });
      if (!floor) {
        floor = await prisma.floor.create({
          data: { towerId: tower.id, floorNumber: f, totalUnits: unitsPerFloor, name: `Floor ${f}` },
        });
      }
      for (let u = 1; u <= unitsPerFloor; u++) {
        const unitNumber = `${f}${u.toString().padStart(2, '0')}`;
        const exists = await prisma.unit.findUnique({
          where: { floorId_unitNumber: { floorId: floor.id, unitNumber } },
        });
        if (!exists) {
          const isGround = f === 1;
          const unitType = isGround ? 'SHOP' : (u % 2 === 0 ? 'THREE_BHK' : 'TWO_BHK');
          await prisma.unit.create({
            data: {
              floorId: floor.id,
              unitNumber,
              type: unitType as any,
              status: 'AVAILABLE',
              carpetArea: isGround ? 500 : (unitType === 'THREE_BHK' ? 1200 : 900),
              basePrice: isGround ? 200000 : (unitType === 'THREE_BHK' ? 5000000 : 3500000),
              facing: u % 2 === 0 ? 'East' : 'West',
            },
          });
        }
      }
    }
    console.log(`  ✓ Inventory built for ${towerName}`);
  }
}

// ── Helper: get an available unit from a project ─────────────

async function getAvailableUnit(projectId: string) {
  const unit = await prisma.unit.findFirst({
    where: {
      status: 'AVAILABLE',
      floor: { tower: { projectId } },
    },
    include: { floor: { include: { tower: true } } },
  });
  return unit;
}

// ── Helper: generate a unique booking number ─────────────────

async function nextBookingNumber(): Promise<string> {
  const count = await prisma.booking.count();
  return `BK-2026-${String(count + 1).padStart(4, '0')}`;
}

// ============================================================
// MAIN SEED FUNCTION
// ============================================================

async function main() {
  console.log('\n🌱 Starting Demo Seed...\n');

  // ── STEP 1: Roles ──────────────────────────────────────────
  console.log('📌 Step 1: Creating roles...');
  const roleMap: Record<string, string> = {};
  for (const r of ROLES) {
    const role = await prisma.role.upsert({
      where: { code: r.code },
      update: { name: r.name },
      create: { name: r.name, code: r.code },
    });
    roleMap[r.code] = role.id;
    console.log(`  ✓ Role: ${r.name}`);
  }

  // ── STEP 2: Lead Sources ───────────────────────────────────
  console.log('\n📌 Step 2: Creating lead sources...');
  const sources = [
    { name: 'Facebook Ads', type: 'FACEBOOK_ADS' },
    { name: 'Google Ads', type: 'GOOGLE_ADS' },
    { name: 'Instagram', type: 'INSTAGRAM' },
    { name: 'Referral', type: 'REFERRAL' },
    { name: 'Direct Call', type: 'DIRECT_CALL' },
    { name: 'Walk-in', type: 'WALK_IN' },
  ];
  const sourceMap: Record<string, string> = {};
  for (const s of sources) {
    const src = await prisma.leadSource.upsert({
      where: { name: s.name },
      update: {},
      create: { name: s.name, type: s.type as any },
    });
    sourceMap[s.type] = src.id;
    console.log(`  ✓ Source: ${s.name}`);
  }

  // ── STEP 3: Builder ────────────────────────────────────────
  console.log('\n📌 Step 3: Creating builder...');
  let builder = await prisma.builder.findFirst({ where: { name: 'Demo Builder' } });
  if (!builder) {
    builder = await prisma.builder.create({
      data: { name: 'Demo Builder', companyName: 'Demo Builder Corp' },
    });
  }
  console.log(`  ✓ Builder: ${builder.name}`);

  // ── STEP 4: Projects + Inventory ──────────────────────────
  console.log('\n📌 Step 4: Creating projects and inventory...');

  const brokerageProjects = [
    { name: 'Luxury Villas', slug: 'luxury-villas', isCpProject: false },
    { name: 'Sunrise Valley', slug: 'sunrise-valley', isCpProject: false },
    { name: 'Green Meadows', slug: 'green-meadows', isCpProject: false },
  ];
  const projectMap: Record<string, any> = {};
  for (const p of brokerageProjects) {
    const proj = await prisma.project.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name, slug: p.slug, builderId: builder.id,
        type: 'RESIDENTIAL', status: 'UNDER_CONSTRUCTION', isCpProject: false,
        city: 'Mumbai', state: 'Maharashtra',
      },
    });
    projectMap[p.slug] = proj;
    console.log(`  ✓ Project: ${proj.name}`);
    await buildInventory(proj.id);
  }

  // CP Exclusive project
  const cpProject = await prisma.project.upsert({
    where: { slug: 'grand-horizon-cp' },
    update: {},
    create: {
      name: 'Grand Horizon', slug: 'grand-horizon-cp', builderId: builder.id,
      type: 'RESIDENTIAL', status: 'UNDER_CONSTRUCTION', isCpProject: true,
      city: 'Pune', state: 'Maharashtra',
    },
  });
  projectMap['grand-horizon-cp'] = cpProject;
  console.log(`  ✓ CP Project: ${cpProject.name}`);
  await buildInventory(cpProject.id);

  // ── STEP 5: Users ──────────────────────────────────────────
  console.log('\n📌 Step 5: Creating users...');
  const userMap: Record<string, any> = {};
  for (const u of DEMO_USERS) {
    const user = await upsertUser(u, roleMap[u.roleCode]);
    if (user) {
      userMap[u.username] = user;
      console.log(`  ✓ User: ${u.name} (${u.email})`);
    } else {
      console.warn(`  ⚠ Failed to create user: ${u.email}`);
    }
  }

  // ── STEP 6: Manager Hierarchy ──────────────────────────────
  console.log('\n📌 Step 6: Setting manager hierarchy...');

  // Pre-Sales agents → Pre-Sales Manager
  const psm = userMap['presalesmanager'];
  for (const key of ['presales1', 'presales2', 'presales3']) {
    if (userMap[key] && psm) {
      await prisma.user.update({ where: { id: userMap[key].id }, data: { managerId: psm.id } });
    }
  }
  console.log('  ✓ Pre-Sales agents linked to Pre-Sales Manager');

  // Sales Execs → Sales Manager
  const sm = userMap['salesmanager'];
  for (const key of ['salesexec1', 'salesexec2', 'salesexec3']) {
    if (userMap[key] && sm) {
      await prisma.user.update({ where: { id: userMap[key].id }, data: { managerId: sm.id } });
    }
  }
  console.log('  ✓ Sales Executives linked to Sales Manager');

  // Post-Sales agents → Post-Sales Manager
  const posm = userMap['postsalesmanager'];
  for (const key of ['postsales1', 'postsales2', 'postsales3']) {
    if (userMap[key] && posm) {
      await prisma.user.update({ where: { id: userMap[key].id }, data: { managerId: posm.id } });
    }
  }
  console.log('  ✓ Post-Sales agents linked to Post-Sales Manager');

  // CP team → Channel Partner
  const cp = userMap['cp1'];
  for (const key of ['sourcingmanager1', 'sourcingmanager2', 'sourcingmanager3', 'closingmanager1', 'closingmanager2', 'closingmanager3']) {
    if (userMap[key] && cp) {
      await prisma.user.update({ where: { id: userMap[key].id }, data: { managerId: cp.id } });
    }
  }
  console.log('  ✓ CP team linked to Channel Partner');

  // ── STEP 7: Project Assignments ────────────────────────────
  console.log('\n📌 Step 7: Assigning users to projects...');

  // Sales Execs → brokerage projects (1 exec per project)
  const brokProjList = [projectMap['luxury-villas'], projectMap['sunrise-valley'], projectMap['green-meadows']];
  const seKeys = ['salesexec1', 'salesexec2', 'salesexec3'];
  for (let i = 0; i < seKeys.length; i++) {
    const user = userMap[seKeys[i]];
    const proj = brokProjList[i];
    if (user && proj) {
      await prisma.projectAssignment.upsert({
        where: { projectId_userId: { projectId: proj.id, userId: user.id } },
        update: {},
        create: { projectId: proj.id, userId: user.id, role: 'SALES_EXECUTIVE' },
      });
    }
  }
  // Sales Manager → all brokerage projects
  if (sm) {
    for (const proj of brokProjList) {
      await prisma.projectAssignment.upsert({
        where: { projectId_userId: { projectId: proj.id, userId: sm.id } },
        update: {},
        create: { projectId: proj.id, userId: sm.id, role: 'SALES_MANAGER' },
      });
    }
  }
  console.log('  ✓ Sales team assigned to brokerage projects');

  // Sourcing Managers → Grand Horizon CP
  for (const key of ['sourcingmanager1', 'sourcingmanager2', 'sourcingmanager3']) {
    const user = userMap[key];
    if (user) {
      await prisma.projectAssignment.upsert({
        where: { projectId_userId: { projectId: cpProject.id, userId: user.id } },
        update: {},
        create: { projectId: cpProject.id, userId: user.id, role: 'SOURCING_MANAGER' },
      });
    }
  }
  // Closing Managers → Grand Horizon CP
  for (const key of ['closingmanager1', 'closingmanager2', 'closingmanager3']) {
    const user = userMap[key];
    if (user) {
      await prisma.projectAssignment.upsert({
        where: { projectId_userId: { projectId: cpProject.id, userId: user.id } },
        update: {},
        create: { projectId: cpProject.id, userId: user.id, role: 'CLOSING_MANAGER' },
      });
    }
  }
  console.log('  ✓ CP team assigned to Grand Horizon');

  // ── STEP 8: Brokerage Leads (Pre-Sales pipeline) ────────────
  console.log('\n📌 Step 8: Creating pre-sales leads...');

  // Lead phone counter — start at 9700000001
  let leadPhoneCounter = 9700000000;
  const nextPhone = () => String(++leadPhoneCounter);

  interface LeadSpec {
    firstName: string;
    lastName?: string;
    status: string;
    temperature?: string;
    sourceType: string;
    projectSlug: string;
    assignedKey: string;
    budget?: number;
  }

  // presales1 — 10 leads
  const ps1Leads: LeadSpec[] = [
    { firstName: 'Rahul', lastName: 'Sharma', status: 'NEW', temperature: 'COLD', sourceType: 'FACEBOOK_ADS', projectSlug: 'luxury-villas', assignedKey: 'presales1' },
    { firstName: 'Priya', lastName: 'Patel', status: 'NEW', temperature: 'WARM', sourceType: 'GOOGLE_ADS', projectSlug: 'sunrise-valley', assignedKey: 'presales1' },
    { firstName: 'Amit', lastName: 'Kumar', status: 'NEW', temperature: 'COLD', sourceType: 'INSTAGRAM', projectSlug: 'green-meadows', assignedKey: 'presales1' },
    { firstName: 'Neha', lastName: 'Singh', status: 'CONTACTED', temperature: 'WARM', sourceType: 'FACEBOOK_ADS', projectSlug: 'luxury-villas', assignedKey: 'presales1', budget: 4500000 },
    { firstName: 'Ravi', lastName: 'Verma', status: 'CONTACTED', temperature: 'HOT', sourceType: 'WALK_IN', projectSlug: 'luxury-villas', assignedKey: 'presales1', budget: 5000000 },
    { firstName: 'Sunita', lastName: 'Gupta', status: 'INTERESTED', temperature: 'WARM', sourceType: 'DIRECT_CALL', projectSlug: 'sunrise-valley', assignedKey: 'presales1', budget: 3500000 },
    { firstName: 'Kiran', lastName: 'Mehta', status: 'INTERESTED', temperature: 'HOT', sourceType: 'REFERRAL', projectSlug: 'luxury-villas', assignedKey: 'presales1', budget: 5500000 },
    { firstName: 'Anjali', lastName: 'Desai', status: 'SITE_VISIT_SCHEDULED', temperature: 'HOT', sourceType: 'FACEBOOK_ADS', projectSlug: 'luxury-villas', assignedKey: 'presales1', budget: 5000000 },
    { firstName: 'Suresh', lastName: 'Rao', status: 'INTERESTED', temperature: 'WARM', sourceType: 'GOOGLE_ADS', projectSlug: 'green-meadows', assignedKey: 'presales1', budget: 3800000 },
    { firstName: 'Meera', lastName: 'Joshi', status: 'LOST', temperature: 'COLD', sourceType: 'INSTAGRAM', projectSlug: 'sunrise-valley', assignedKey: 'presales1' },
  ];

  // presales2 — 5 leads
  const ps2Leads: LeadSpec[] = [
    { firstName: 'Arjun', lastName: 'Nair', status: 'NEW', temperature: 'COLD', sourceType: 'FACEBOOK_ADS', projectSlug: 'sunrise-valley', assignedKey: 'presales2' },
    { firstName: 'Deepa', lastName: 'Pillai', status: 'NEW', temperature: 'WARM', sourceType: 'GOOGLE_ADS', projectSlug: 'green-meadows', assignedKey: 'presales2' },
    { firstName: 'Rajesh', lastName: 'Malhotra', status: 'CONTACTED', temperature: 'WARM', sourceType: 'WALK_IN', projectSlug: 'sunrise-valley', assignedKey: 'presales2', budget: 4000000 },
    { firstName: 'Pooja', lastName: 'Agarwal', status: 'INTERESTED', temperature: 'HOT', sourceType: 'REFERRAL', projectSlug: 'sunrise-valley', assignedKey: 'presales2', budget: 4500000 },
    { firstName: 'Vikram', lastName: 'Saxena', status: 'LOST', temperature: 'COLD', sourceType: 'INSTAGRAM', projectSlug: 'green-meadows', assignedKey: 'presales2' },
  ];

  // presales3 — 5 leads
  const ps3Leads: LeadSpec[] = [
    { firstName: 'Sonal', lastName: 'Trivedi', status: 'NEW', temperature: 'COLD', sourceType: 'FACEBOOK_ADS', projectSlug: 'green-meadows', assignedKey: 'presales3' },
    { firstName: 'Manish', lastName: 'Shah', status: 'NEW', temperature: 'WARM', sourceType: 'DIRECT_CALL', projectSlug: 'luxury-villas', assignedKey: 'presales3' },
    { firstName: 'Kavita', lastName: 'Bose', status: 'CONTACTED', temperature: 'WARM', sourceType: 'GOOGLE_ADS', projectSlug: 'green-meadows', assignedKey: 'presales3', budget: 3200000 },
    { firstName: 'Abhishek', lastName: 'Tiwari', status: 'SITE_VISIT_SCHEDULED', temperature: 'HOT', sourceType: 'FACEBOOK_ADS', projectSlug: 'green-meadows', assignedKey: 'presales3', budget: 3800000 },
    { firstName: 'Swati', lastName: 'Mishra', status: 'LOST', temperature: 'COLD', sourceType: 'INSTAGRAM', projectSlug: 'luxury-villas', assignedKey: 'presales3' },
  ];

  const allPreSalesLeads = [...ps1Leads, ...ps2Leads, ...ps3Leads];
  const createdPreSalesLeads: any[] = [];

  for (const spec of allPreSalesLeads) {
    const proj = projectMap[spec.projectSlug];
    const assignedUser = userMap[spec.assignedKey];
    const sourceId = sourceMap[spec.sourceType];
    if (!proj || !assignedUser) continue;

    const phone = nextPhone();
    const lead = await prisma.lead.create({
      data: {
        firstName: spec.firstName,
        lastName: spec.lastName,
        phone,
        email: `${spec.firstName.toLowerCase()}.${spec.lastName?.toLowerCase() || 'lead'}@example.com`,
        status: spec.status as any,
        temperature: spec.temperature as any,
        score: spec.temperature === 'HOT' ? 75 : spec.temperature === 'WARM' ? 50 : 25,
        sourceId,
        interestedProjectId: proj.id,
        assignedUserId: assignedUser.id,
        budget: spec.budget ? spec.budget : undefined,
        nextFollowUpDate: spec.status !== 'LOST' && spec.status !== 'SITE_VISIT_SCHEDULED'
          ? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
          : undefined,
      },
    });
    createdPreSalesLeads.push({ lead, spec });
  }
  console.log(`  ✓ Created ${createdPreSalesLeads.length} pre-sales leads`);

  // ── STEP 9: FollowUps for Pre-Sales leads ──────────────────
  console.log('\n📌 Step 9: Creating follow-ups for pre-sales leads...');
  let followUpCount = 0;
  for (const { lead, spec } of createdPreSalesLeads) {
    if (['CONTACTED', 'INTERESTED'].includes(spec.status)) {
      const assignedUser = userMap[spec.assignedKey];
      // Completed past follow-up
      await prisma.followUp.create({
        data: {
          leadId: lead.id,
          userId: assignedUser.id,
          scheduledDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          status: 'COMPLETED',
          type: 'CALL',
          remarks: 'Initial call done. Customer showed interest.',
          completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          completedRemarks: 'Good conversation. Will call back.',
        },
      });
      // Upcoming scheduled follow-up
      await prisma.followUp.create({
        data: {
          leadId: lead.id,
          userId: assignedUser.id,
          scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          status: 'SCHEDULED',
          type: 'CALL',
          remarks: 'Follow up on project interest.',
        },
      });
      followUpCount += 2;
    }
  }
  console.log(`  ✓ Created ${followUpCount} follow-ups`);

  // ── STEP 10: SiteVisits for Scheduled leads ────────────────
  console.log('\n📌 Step 10: Creating site visits for scheduled leads...');
  // Map each brokerage project slug to its assigned sales exec
  const projectSlugToExecKey: Record<string, string> = {
    'luxury-villas': 'salesexec1',
    'sunrise-valley': 'salesexec2',
    'green-meadows': 'salesexec3',
  };
  for (const { lead, spec } of createdPreSalesLeads) {
    if (spec.status === 'SITE_VISIT_SCHEDULED') {
      const proj = projectMap[spec.projectSlug];
      // Assign the correct sales exec based on project, not always salesexec1
      const execKey = projectSlugToExecKey[spec.projectSlug] || 'salesexec1';
      const salesExec = userMap[execKey];
      const createdBy = userMap[spec.assignedKey];
      await prisma.siteVisit.create({
        data: {
          leadId: lead.id,
          projectId: proj.id,
          salesExecId: salesExec.id,
          createdById: createdBy.id,
          scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          status: 'SCHEDULED',
          interestLevel: 'HIGH',
        },
      });
    }
  }
  console.log('  ✓ Site visits created for scheduled leads');

  // ── STEP 11: Sales Exec Leads (advanced pipeline) ─────────
  console.log('\n📌 Step 11: Creating sales exec pipeline leads...');

  // These leads are at advanced stages — already passed pre-sales
  // assignedUser = salesexec (they own these leads now)
  interface AdvancedLeadSpec extends LeadSpec {
    makeBooking?: boolean;
    bookingStage?: 'CONFIRMED' | 'LOAN' | 'AGREEMENT' | 'POSSESSION' | 'HANDOVER';
  }

  const se1Leads: AdvancedLeadSpec[] = [
    // salesexec1 is assigned to luxury-villas → ALL se1 leads must be luxury-villas
    { firstName: 'Nidhi', lastName: 'Kapoor', status: 'SITE_VISIT_COMPLETED', temperature: 'HOT', sourceType: 'FACEBOOK_ADS', projectSlug: 'luxury-villas', assignedKey: 'salesexec1', budget: 5000000 },
    { firstName: 'Rohit', lastName: 'Bansal', status: 'SITE_VISIT_COMPLETED', temperature: 'WARM', sourceType: 'GOOGLE_ADS', projectSlug: 'luxury-villas', assignedKey: 'salesexec1', budget: 4800000 },
    { firstName: 'Tanya', lastName: 'Chawla', status: 'SITE_VISIT_COMPLETED', temperature: 'HOT', sourceType: 'REFERRAL', projectSlug: 'luxury-villas', assignedKey: 'salesexec1', budget: 4200000 },
    { firstName: 'Ganesh', lastName: 'Iyer', status: 'NEGOTIATION', temperature: 'HOT', sourceType: 'DIRECT_CALL', projectSlug: 'luxury-villas', assignedKey: 'salesexec1', budget: 5200000 },
    { firstName: 'Lakshmi', lastName: 'Reddy', status: 'NEGOTIATION', temperature: 'HOT', sourceType: 'WALK_IN', projectSlug: 'luxury-villas', assignedKey: 'salesexec1', budget: 4600000 },
    // Leads that converted to bookings
    { firstName: 'Manoj', lastName: 'Khanna', status: 'BOOKING', temperature: 'HOT', sourceType: 'FACEBOOK_ADS', projectSlug: 'luxury-villas', assignedKey: 'salesexec1', makeBooking: true, bookingStage: 'CONFIRMED', budget: 5000000 },
    { firstName: 'Ritika', lastName: 'Sood', status: 'LOAN', temperature: 'HOT', sourceType: 'GOOGLE_ADS', projectSlug: 'luxury-villas', assignedKey: 'salesexec1', makeBooking: true, bookingStage: 'LOAN', budget: 5500000 },
    { firstName: 'Sanjay', lastName: 'Luthra', status: 'AGREEMENT', temperature: 'HOT', sourceType: 'REFERRAL', projectSlug: 'luxury-villas', assignedKey: 'salesexec1', makeBooking: true, bookingStage: 'AGREEMENT', budget: 4000000 },
    { firstName: 'Preeti', lastName: 'Arora', status: 'HANDOVER', temperature: 'HOT', sourceType: 'WALK_IN', projectSlug: 'luxury-villas', assignedKey: 'salesexec1', makeBooking: true, bookingStage: 'POSSESSION', budget: 3500000 },
    { firstName: 'Vinod', lastName: 'Chopra', status: 'HANDOVER', temperature: 'HOT', sourceType: 'DIRECT_CALL', projectSlug: 'luxury-villas', assignedKey: 'salesexec1', makeBooking: true, bookingStage: 'HANDOVER', budget: 5000000 },
  ];

  const se2Leads: AdvancedLeadSpec[] = [
    // salesexec2 is assigned to sunrise-valley → ALL se2 leads must be sunrise-valley
    { firstName: 'Sneha', lastName: 'Pillai', status: 'SITE_VISIT_COMPLETED', temperature: 'WARM', sourceType: 'FACEBOOK_ADS', projectSlug: 'sunrise-valley', assignedKey: 'salesexec2', budget: 4000000 },
    { firstName: 'Harish', lastName: 'Nanda', status: 'SITE_VISIT_COMPLETED', temperature: 'HOT', sourceType: 'WALK_IN', projectSlug: 'sunrise-valley', assignedKey: 'salesexec2', budget: 4500000 },
    { firstName: 'Aisha', lastName: 'Shaikh', status: 'NEGOTIATION', temperature: 'HOT', sourceType: 'REFERRAL', projectSlug: 'sunrise-valley', assignedKey: 'salesexec2', budget: 4300000 },
    { firstName: 'Tarun', lastName: 'Malviya', status: 'BOOKING', temperature: 'HOT', sourceType: 'GOOGLE_ADS', projectSlug: 'sunrise-valley', assignedKey: 'salesexec2', makeBooking: true, bookingStage: 'CONFIRMED', budget: 4200000 },
    { firstName: 'Ritu', lastName: 'Mishra', status: 'LOST', temperature: 'COLD', sourceType: 'INSTAGRAM', projectSlug: 'sunrise-valley', assignedKey: 'salesexec2' },
  ];

  const se3Leads: AdvancedLeadSpec[] = [
    // salesexec3 is assigned to green-meadows → ALL se3 leads must be green-meadows
    { firstName: 'Chirag', lastName: 'Desai', status: 'SITE_VISIT_COMPLETED', temperature: 'WARM', sourceType: 'FACEBOOK_ADS', projectSlug: 'green-meadows', assignedKey: 'salesexec3', budget: 3500000 },
    { firstName: 'Pallavi', lastName: 'Joshi', status: 'SITE_VISIT_COMPLETED', temperature: 'HOT', sourceType: 'DIRECT_CALL', projectSlug: 'green-meadows', assignedKey: 'salesexec3', budget: 3800000 },
    { firstName: 'Kunal', lastName: 'Mehta', status: 'NEGOTIATION', temperature: 'HOT', sourceType: 'REFERRAL', projectSlug: 'green-meadows', assignedKey: 'salesexec3', budget: 4000000 },
    { firstName: 'Divya', lastName: 'Raman', status: 'LOAN', temperature: 'HOT', sourceType: 'WALK_IN', projectSlug: 'green-meadows', assignedKey: 'salesexec3', makeBooking: true, bookingStage: 'LOAN', budget: 3600000 },
    { firstName: 'Ajay', lastName: 'Pandey', status: 'LOST', temperature: 'COLD', sourceType: 'INSTAGRAM', projectSlug: 'green-meadows', assignedKey: 'salesexec3' },
  ];

  const allSeLeads = [...se1Leads, ...se2Leads, ...se3Leads];
  const bookingsToCreate: { lead: any; spec: AdvancedLeadSpec }[] = [];

  for (const spec of allSeLeads) {
    const proj = projectMap[spec.projectSlug];
    const assignedUser = userMap[spec.assignedKey];
    const sourceId = sourceMap[spec.sourceType];
    if (!proj || !assignedUser) continue;

    const phone = nextPhone();
    const lead = await prisma.lead.create({
      data: {
        firstName: spec.firstName,
        lastName: spec.lastName,
        phone,
        email: `${spec.firstName.toLowerCase()}.${spec.lastName?.toLowerCase() || 'lead'}@demo-leads.com`,
        status: spec.status as any,
        subStatus: ['BOOKING', 'LOAN', 'AGREEMENT', 'HANDOVER'].includes(spec.status) ? 'DONE' : 'PENDING',
        temperature: spec.temperature as any,
        score: spec.temperature === 'HOT' ? 85 : 55,
        sourceId,
        interestedProjectId: proj.id,
        assignedUserId: assignedUser.id,
        budget: spec.budget,
        lastContactDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Create site visit for all advanced leads (they came through site visit)
    if (spec.status !== 'LOST') {
      await prisma.siteVisit.create({
        data: {
          leadId: lead.id,
          projectId: proj.id,
          salesExecId: assignedUser.id,
          createdById: assignedUser.id,
          scheduledDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          actualDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          status: 'COMPLETED',
          interestLevel: spec.temperature === 'HOT' ? 'HIGH' : 'MEDIUM',
          meetingNotes: 'Customer visited the site. Showed strong interest in the project.',
          completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        },
      });
    }

    if (spec.makeBooking) {
      bookingsToCreate.push({ lead, spec });
    }
  }
  console.log(`  ✓ Created ${allSeLeads.length} sales exec leads`);

  // ── STEP 12: Customers + Bookings ──────────────────────────
  console.log('\n📌 Step 12: Creating bookings and post-sales records...');

  const postSalesKeys = ['postsales1', 'postsales2', 'postsales3'];
  let postSalesIndex = 0;

  // Collect NEGOTIATION leads so we can create Negotiation records after the SE lead loop
  const negotiationLeads: { lead: any; spec: AdvancedLeadSpec }[] = [];

  // Build negotiation leads list from the SE leads array (collect during allSeLeads loop above)
  // We do it here by scanning allSeLeads for NEGOTIATION status
  for (const spec of allSeLeads) {
    if (spec.status === 'NEGOTIATION') {
      // Find the lead we created — match by firstName+lastName combo
      // We need to query it from DB since we didn't store them separately
      const salesExecUser = userMap[spec.assignedKey];
      const proj = projectMap[spec.projectSlug];
      if (!salesExecUser || !proj) continue;
      const negotiationLead = await prisma.lead.findFirst({
        where: {
          firstName: spec.firstName,
          lastName: spec.lastName,
          assignedUserId: salesExecUser.id,
          interestedProjectId: proj.id,
          status: 'NEGOTIATION',
        },
      });
      if (negotiationLead) {
        negotiationLeads.push({ lead: negotiationLead, spec });
      }
    }
  }

  // Create Negotiation records for all NEGOTIATION leads
  console.log(`  Creating ${negotiationLeads.length} negotiation records...`);
  for (const { lead, spec } of negotiationLeads) {
    const salesExecUser = userMap[spec.assignedKey];
    const askingPrice = spec.budget ?? 4500000;
    const discountRequested = Math.round(askingPrice * 0.03); // 3% discount request
    const offeredPrice = askingPrice - discountRequested;
    await prisma.negotiation.create({
      data: {
        leadId: lead.id,
        salesExecId: salesExecUser.id,
        askingPrice,
        offeredPrice,
        discountRequested,
        discountType: 'FLAT',
        customerObjections: 'Customer feels the price is slightly above market rate for the area.',
        negotiationNotes: 'Customer is serious buyer. Requesting 3% discount to close the deal.',
        nextActionPlan: 'Present counter-offer after manager approval.',
        status: 'OPEN',
      },
    });
  }
  console.log(`  ✓ Negotiation records created`);

  for (const { lead, spec } of bookingsToCreate) {
    const proj = projectMap[spec.projectSlug];
    const salesExec = userMap[spec.assignedKey];

    // Round robin for post sales
    const postSales = userMap[postSalesKeys[postSalesIndex % postSalesKeys.length]];
    postSalesIndex++;

    // Get an available unit
    const unit = await getAvailableUnit(proj.id);
    if (!unit) {
      console.warn(`  ⚠ No available unit for ${spec.firstName} — skipping booking`);
      continue;
    }

    // Mark unit as SOLD
    await prisma.unit.update({ where: { id: unit.id }, data: { status: 'SOLD', soldAt: new Date() } });

    // Create Customer
    const customer = await prisma.customer.create({
      data: {
        leadId: lead.id,
        firstName: lead.firstName,
        lastName: lead.lastName ?? '',
        phone: lead.phone,
        email: lead.email,
        city: 'Mumbai',
        state: 'Maharashtra',
        occupation: 'Professional',
      },
    });

    const agreedPrice = spec.budget ?? 4500000;
    const bookingAmount = Math.round(agreedPrice * 0.01); // 1% token
    const bookingNum = await nextBookingNumber();

    // Create Booking
    const booking = await prisma.booking.create({
      data: {
        bookingNumber: bookingNum,
        customerId: customer.id,
        unitId: unit.id,
        source: 'DIRECT',
        salesExecId: salesExec.id,
        assignedPostSalesId: postSales?.id,
        agreedPrice,
        tokenAmount: bookingAmount,
        totalPayable: agreedPrice,
        status: 'CONFIRMED',
        bookingDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      },
    });

    // Now add post-sales sub-records based on bookingStage
    const stage = spec.bookingStage ?? 'CONFIRMED';

    if (['LOAN', 'AGREEMENT', 'POSSESSION', 'HANDOVER'].includes(stage)) {
      await prisma.loanCase.create({
        data: {
          bookingId: booking.id,
          status: stage === 'LOAN' ? 'APPLIED' : stage === 'AGREEMENT' ? 'APPROVED' : 'DISBURSED',
          bankName: 'HDFC Bank',
          loanAmount: Math.round(agreedPrice * 0.7),
          applicationDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        },
      });
    }

    if (['AGREEMENT', 'POSSESSION', 'HANDOVER'].includes(stage)) {
      await prisma.agreement.create({
        data: {
          bookingId: booking.id,
          status: ['POSSESSION', 'HANDOVER'].includes(stage) ? 'REGISTERED' : 'DRAFT_PREPARED',
          agreementNumber: `AGR-${bookingNum}`,
          draftDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          stampDutyPaid: ['POSSESSION', 'HANDOVER'].includes(stage),
          registrationDone: stage === 'HANDOVER',
        },
      });
    }

    if (['POSSESSION', 'HANDOVER'].includes(stage)) {
      await prisma.possessionHandover.create({
        data: {
          bookingId: booking.id,
          status: stage === 'HANDOVER' ? 'HANDED_OVER' : 'SCHEDULED',
          expectedDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          scheduledDate: stage === 'HANDOVER' ? new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) : undefined,
          actualDate: stage === 'HANDOVER' ? new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) : undefined,
          keysHandedOver: stage === 'HANDOVER',
          handoverById: postSales?.id,
        },
      });
    }

    // Update booking status to reflect the correct post-sales stage
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: stage === 'CONFIRMED' ? 'CONFIRMED'
          : stage === 'LOAN' ? 'LOAN_IN_PROGRESS'
            : stage === 'AGREEMENT' ? 'AGREEMENT_PENDING'
              : stage === 'POSSESSION' ? 'POSSESSION_PENDING'
                : 'HANDOVER_COMPLETED',
      },
    });

    // For HANDOVER stage, set subStatus='DONE' on the lead so Post-Sales dashboard
    // can distinguish "Handover Completed" from "Possession Pending"
    if (stage === 'HANDOVER') {
      await prisma.lead.update({
        where: { id: lead.id },
        data: { subStatus: 'DONE' },
      });
    }

    // Transfer lead ownership to post-sales agent for LOAN and beyond.
    // - BOOKING (just confirmed): Sales Exec still owns it — they're finalising docs
    // - LOAN, AGREEMENT, POSSESSION, HANDOVER: Post-Sales owns the lead
    // The Booking record still has salesExecId to show who originally closed the deal.
    if (['LOAN', 'AGREEMENT', 'POSSESSION', 'HANDOVER'].includes(stage) && postSales?.id) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: { assignedUserId: postSales.id },
      });
    }

    // Create Follow-up for post-sales if it's assigned
    if (postSales?.id) {
      await prisma.followUp.create({
        data: {
          leadId: lead.id,
          userId: postSales.id,
          scheduledDate: new Date(), // today
          status: 'SCHEDULED',
          type: 'CALL',
          remarks: `Follow up regarding ${stage.toLowerCase()} for Unit ${unit.unitNumber}.`,
        },
      });
    }

    console.log(`  ✓ Booking ${bookingNum}: ${spec.firstName} ${spec.lastName} (${stage}) — Unit ${unit.unitNumber} assigned to ${postSales?.name}`);
  }

  // ── STEP 13: CP World — Brokers ────────────────────────────
  console.log('\n📌 Step 13: Setting up CP World (brokers + leads + bookings)...');

  const sm1 = userMap['sourcingmanager1'];
  const sm2 = userMap['sourcingmanager2'];
  const sm3 = userMap['sourcingmanager3'];
  const cm1 = userMap['closingmanager1'];
  const cm2 = userMap['closingmanager2'];
  const cm3 = userMap['closingmanager3'];

  // Map broker code → closing manager (each CM handles their own broker at the project site)
  const brokerToClosingManager: Record<string, any> = {
    'BRK-001': cm1,
    'BRK-002': cm2,
    'BRK-003': cm3,
  };

  // Create 3 external brokers — each recruited by a different Sourcing Manager
  // SM recruits → CM closes deals at site
  const brokerData = [
    { code: 'BRK-001', name: 'Pawan Realty', company: 'Pawan Realty Pvt Ltd', phone: '9600000001', status: 'DEAL', sourcingManager: sm1 },
    { code: 'BRK-002', name: 'Skyline Brokers', company: 'Skyline Brokers LLP', phone: '9600000002', status: 'DEAL', sourcingManager: sm2 },
    { code: 'BRK-003', name: 'Prime Associates', company: 'Prime Associates', phone: '9600000003', status: 'VISIT', sourcingManager: sm3 },
  ];

  const brokerMap: Record<string, any> = {};
  for (const b of brokerData) {
    const existingBroker = await prisma.broker.findUnique({ where: { brokerCode: b.code } });
    if (existingBroker) {
      brokerMap[b.code] = existingBroker;
    } else {
      const broker = await prisma.broker.create({
        data: {
          brokerCode: b.code,
          name: b.name,
          companyName: b.company,
          phone: b.phone,
          status: b.status as any,
          sourcingManagerId: b.sourcingManager?.id, // Each SM recruits their own broker
          city: 'Pune',
          state: 'Maharashtra',
          serviceAreas: ['Pune', 'Pimpri-Chinchwad'],
          experience: 5,
        },
      });
      brokerMap[b.code] = broker;
    }
    console.log(`  ✓ Broker: ${b.name} (managed by ${b.sourcingManager?.name ?? 'unknown'})`);
  }

  // Assign brokers to Grand Horizon CP project — each to their own closing manager
  for (const [code, broker] of Object.entries(brokerMap)) {
    const assignedCm = brokerToClosingManager[code];
    await prisma.brokerProjectAssignment.upsert({
      where: { brokerId_projectId: { brokerId: broker.id, projectId: cpProject.id } },
      update: {},
      create: {
        brokerId: broker.id,
        projectId: cpProject.id,
        brokeragePercent: 2.0,
        closingManagerId: assignedCm?.id,
        isLocked: code === 'BRK-001' || code === 'BRK-002', // Deal signed for first two
      },
    });
  }
  console.log('  ✓ Brokers assigned to Grand Horizon with 2% commission');

  // ── STEP 14: CP Leads (Broker brought them) ─────────────────
  console.log('\n📌 Step 14: Creating CP leads...');

  const cpLeadsData = [
    { firstName: 'Rajan', lastName: 'Sethi', phone: nextPhone(), brokerCode: 'BRK-001', status: 'NEW', temperature: 'HOT', budget: 6000000 },
    { firstName: 'Smita', lastName: 'Kulkarni', phone: nextPhone(), brokerCode: 'BRK-001', status: 'NEW', temperature: 'HOT', budget: 6500000 },
    { firstName: 'Nilesh', lastName: 'Patil', phone: nextPhone(), brokerCode: 'BRK-002', status: 'BOOKING', subStatus: 'DONE', temperature: 'HOT', budget: 7000000 },
    { firstName: 'Madhuri', lastName: 'Rane', phone: nextPhone(), brokerCode: 'BRK-002', status: 'LOAN', subStatus: 'DONE', temperature: 'HOT', budget: 6800000 },
    { firstName: 'Sachin', lastName: 'Wagle', phone: nextPhone(), brokerCode: 'BRK-003', status: 'NEW', temperature: 'WARM', budget: 5500000 },
  ];

  const cpBookingsToCreate: { lead: any; brokerCode: string; budget: number }[] = [];
  for (const spec of cpLeadsData) {
    const broker = brokerMap[spec.brokerCode];
    // Assign the lead to the correct closing manager for this broker
    const assignedCmForLead = brokerToClosingManager[spec.brokerCode];
    const lead = await prisma.lead.create({
      data: {
        firstName: spec.firstName,
        lastName: spec.lastName,
        phone: spec.phone,
        email: `${spec.firstName.toLowerCase()}@cplead.com`,
        status: spec.status as any,
        subStatus: (spec as any).subStatus || 'PENDING',
        temperature: spec.temperature as any,
        score: 80,
        interestedProjectId: cpProject.id,
        assignedUserId: assignedCmForLead?.id, // Each lead goes to the CM who handles its broker
        brokerId: broker?.id,
        budget: spec.budget,
        sourceId: sourceMap['REFERRAL'], // CP leads come via broker referral
      },
    });

    if (['BOOKING', 'LOAN'].includes(spec.status)) {
      cpBookingsToCreate.push({ lead, brokerCode: spec.brokerCode, budget: spec.budget });
    }
  }
  console.log(`  ✓ Created ${cpLeadsData.length} CP leads`);

  // ── STEP 15: CP Bookings + BrokerageRecords ─────────────────
  console.log('\n📌 Step 15: Creating CP bookings and brokerage records...');

  for (const { lead, brokerCode, budget } of cpBookingsToCreate) {
    const broker = brokerMap[brokerCode];
    // Use the correct closing manager for this broker's booking
    const bookingCm = brokerToClosingManager[brokerCode];
    const unit = await getAvailableUnit(cpProject.id);
    if (!unit) {
      console.warn('  ⚠ No available CP unit — skipping');
      continue;
    }

    await prisma.unit.update({ where: { id: unit.id }, data: { status: 'SOLD', soldAt: new Date() } });

    const customer = await prisma.customer.create({
      data: {
        leadId: lead.id,
        firstName: lead.firstName,
        lastName: lead.lastName ?? '',
        phone: lead.phone,
        email: lead.email,
        city: 'Pune',
        state: 'Maharashtra',
      },
    });

    const agreedPrice = budget;
    const bookingNum = await nextBookingNumber();

    const booking = await prisma.booking.create({
      data: {
        bookingNumber: bookingNum,
        customerId: customer.id,
        unitId: unit.id,
        source: 'CHANNEL_PARTNER',
        closingManagerId: bookingCm?.id, // Correct CM per broker
        agreedPrice,
        tokenAmount: Math.round(agreedPrice * 0.01),
        totalPayable: agreedPrice,
        status: lead.status === 'LOAN' ? 'LOAN_IN_PROGRESS' : 'CONFIRMED',
        bookingDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        commissionPercentage: 2.0,
        commissionAmount: Math.round(agreedPrice * 0.02),
      },
    });

    // Create BrokerageRecord (commission owed to broker)
    const brokerageAmount = Math.round(agreedPrice * 0.02);
    await prisma.brokerageRecord.create({
      data: {
        brokerId: broker.id,
        bookingId: booking.id,
        bookingValue: agreedPrice,
        brokeragePercent: 2.0,
        brokerageAmount,
        netPayable: brokerageAmount,
        status: 'PENDING',
      },
    });

    // Add LoanCase if in LOAN stage
    if (lead.status === 'LOAN') {
      await prisma.loanCase.create({
        data: {
          bookingId: booking.id,
          status: 'APPLIED',
          bankName: 'ICICI Bank',
          loanAmount: Math.round(agreedPrice * 0.7),
          applicationDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
      });
    }

    console.log(`  ✓ CP Booking ${bookingNum}: ${lead.firstName} via ${broker.name} (CM: ${bookingCm?.name}) — Brokerage: ₹${brokerageAmount.toLocaleString()}`);
  }

  // ── STEP 16: Clean up old data ─────────────────────────────
  console.log('\n📌 Step 16: Cleaning up non-demo projects...');
  const keepProjectIds = Object.values(projectMap).map((p: any) => p.id);
  const deleted = await prisma.project.deleteMany({
    where: { id: { notIn: keepProjectIds } },
  });
  if (deleted.count > 0) {
    console.log(`  ✓ Removed ${deleted.count} old projects`);
  }

  // ── DONE ────────────────────────────────────────────────────
  console.log('\n✅ Demo seed complete!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  All users use password: Demo@1234');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  BROKERAGE WORLD');
  console.log('  presalesmanager@demo.com   — Pre-Sales Manager');
  console.log('  presales1@demo.com         — Pre-Sales Agent 1  (10 leads)');
  console.log('  presales2@demo.com         — Pre-Sales Agent 2  (5 leads)');
  console.log('  presales3@demo.com         — Pre-Sales Agent 3  (5 leads)');
  console.log('  salesmanager@demo.com      — Sales Manager');
  console.log('  salesexec1@demo.com        — Sales Executive 1  (luxury-villas: 3 SVC + 2 NEG + 1 BOOKING active | 4 leads transferred to post-sales)');
  console.log('  salesexec2@demo.com        — Sales Executive 2  (sunrise-valley: 2 SVC + 1 NEG + 1 BOOKING active)');
  console.log('  salesexec3@demo.com        — Sales Executive 3  (green-meadows: 2 SVC + 1 NEG + 1 LOAN→post-sales)');
  console.log('  postsalesmanager@demo.com  — Post-Sales Manager');
  console.log('  postsales1@demo.com        — Post Sales 1       (owns LOAN/AGREEMENT/HANDOVER leads — round-robin)');
  console.log('  postsales2@demo.com        — Post Sales 2       (owns LOAN/AGREEMENT/HANDOVER leads — round-robin)');
  console.log('  postsales3@demo.com        — Post Sales 3       (owns LOAN/AGREEMENT/HANDOVER leads — round-robin)');
  console.log('  finance@demo.com           — Finance');
  console.log('  businessmanager@demo.com   — Business Manager');
  console.log('  director@demo.com          — Director');
  console.log('  admin@demo.com             — Admin');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  CP WORLD  (Grand Horizon — CP Exclusive project)');
  console.log('  cp1@demo.com               — Channel Partner');
  console.log('  sourcingmanager1@demo.com  — Sourcing Manager 1 (recruited BRK-001 Pawan Realty)');
  console.log('  sourcingmanager2@demo.com  — Sourcing Manager 2 (recruited BRK-002 Skyline Brokers)');
  console.log('  sourcingmanager3@demo.com  — Sourcing Manager 3 (recruited BRK-003 Prime Associates)');
  console.log('  closingmanager1@demo.com   — Closing Manager 1  (closes BRK-001 leads: Rajan, Smita)');
  console.log('  closingmanager2@demo.com   — Closing Manager 2  (closes BRK-002 leads: Nilesh BOOKING, Madhuri LOAN — 2 bookings)');
  console.log('  closingmanager3@demo.com   — Closing Manager 3  (closes BRK-003 leads: Sachin)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
