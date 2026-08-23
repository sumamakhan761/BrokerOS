// This file is a pass-through adapter.
// All code in apps/api imports from here as normal.
// The actual database connection lives in @brokeros/prisma.
export { prismaClient } from '@brokeros/prisma';
