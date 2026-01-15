/**
 * Create Support Team User - Quick Script
 * 
 * Creates a support team member with the 'support' role
 * who can access the Support Dashboard to manage tickets.
 * 
 * Usage:
 *   npm run support:create
 * 
 * Or with custom credentials:
 *   SUPPORT_EMAIL="support@example.com" SUPPORT_NAME="John Support" npm run support:create
 */

const bcrypt = require('bcryptjs');

// Default support user credentials (can be overridden via environment variables)
const DEFAULTS = {
    email: process.env.SUPPORT_EMAIL || 'support@digitalmeng.com',
    name: process.env.SUPPORT_NAME || 'Support Team',
    password: process.env.SUPPORT_PASSWORD || 'support123',
    organizationId: process.env.ORG_ID || null,
};

async function createSupportUser() {
    console.log('\n🎫 DigitalMEng - Support Team User Creation\n');
    console.log('━'.repeat(50));

    // Check if bcryptjs is available
    try {
        require('bcryptjs');
    } catch (e) {
        console.error('❌ bcryptjs is not installed. Run: npm install bcryptjs');
        process.exit(1);
    }

    // Try to use Prisma if available, otherwise use mock
    let prisma;
    try {
        const { PrismaClient } = require('@prisma/client');
        prisma = new PrismaClient();

        // Test connection
        await prisma.$connect();
        console.log('✅ Connected to database');
    } catch (e) {
        console.log('⚠️  Prisma not available or database not connected.');
        console.log('   Creating mock support user for demo purposes.\n');

        // Create mock user for demo
        const passwordHash = bcrypt.hashSync(DEFAULTS.password, 10);

        console.log('📋 Support User Details (Mock):');
        console.log('━'.repeat(50));
        console.log(`   Email:    ${DEFAULTS.email}`);
        console.log(`   Name:     ${DEFAULTS.name}`);
        console.log(`   Password: ${DEFAULTS.password}`);
        console.log(`   Role:     support`);
        console.log(`   Hash:     ${passwordHash.substring(0, 20)}...`);
        console.log('━'.repeat(50));
        console.log('\n✅ Mock support user created for demo mode.');
        console.log('\n📌 To create a real support user, ensure:');
        console.log('   1. Database is running');
        console.log('   2. Run: npm run db:generate');
        console.log('   3. Run: npm run db:push');
        console.log('   4. Run this script again\n');

        console.log('🔗 Access Support Dashboard at:');
        console.log('   http://localhost:3000/support/dashboard\n');

        return;
    }

    try {
        // Hash the password
        const passwordHash = bcrypt.hashSync(DEFAULTS.password, 10);

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: DEFAULTS.email }
        });

        if (existingUser) {
            // Update existing user to support role
            await prisma.user.update({
                where: { email: DEFAULTS.email },
                data: {
                    role: 'support',
                    passwordHash: passwordHash,
                    name: DEFAULTS.name,
                }
            });
            console.log(`✅ Updated existing user "${DEFAULTS.email}" to support role`);
        } else {
            // Find or create an organization for the support user
            let organizationId = DEFAULTS.organizationId;

            if (!organizationId) {
                // Get the first organization or create one
                const org = await prisma.organization.findFirst();
                if (org) {
                    organizationId = org.id;
                } else {
                    // Create a support organization
                    const newOrg = await prisma.organization.create({
                        data: {
                            id: `org_support_${Date.now()}`,
                            name: 'Support Team',
                            slug: 'support-team',
                            ownerId: `user_support_${Date.now()}`,
                            plan: 'enterprise',
                        }
                    });
                    organizationId = newOrg.id;
                    console.log(`✅ Created Support Team organization: ${newOrg.id}`);
                }
            }

            // Create new support user
            const newUser = await prisma.user.create({
                data: {
                    id: `user_support_${Date.now()}`,
                    email: DEFAULTS.email,
                    name: DEFAULTS.name,
                    passwordHash: passwordHash,
                    role: 'support',
                    authProvider: 'email',
                    emailVerified: true,
                    organizationId: organizationId,
                }
            });
            console.log(`✅ Created new support user: ${newUser.email}`);
        }

        console.log('\n📋 Support User Credentials:');
        console.log('━'.repeat(50));
        console.log(`   Email:    ${DEFAULTS.email}`);
        console.log(`   Password: ${DEFAULTS.password}`);
        console.log(`   Role:     support`);
        console.log('━'.repeat(50));

        console.log('\n⚠️  IMPORTANT: Change the password after first login!');

        console.log('\n🔗 Access Support Dashboard at:');
        console.log('   http://localhost:3000/support/dashboard');

        console.log('\n📌 Support Team Capabilities:');
        console.log('   • View all customer tickets');
        console.log('   • Assign tickets to team members');
        console.log('   • Reply to customers');
        console.log('   • Add internal notes');
        console.log('   • Resolve and close tickets');
        console.log('   • View support statistics\n');

    } catch (error) {
        console.error('❌ Error creating support user:', error.message);
        console.log('\n💡 Troubleshooting:');
        console.log('   1. Ensure database is running');
        console.log('   2. Run: npm run db:generate');
        console.log('   3. Run: npm run db:push');
        console.log('   4. Check DATABASE_URL in .env\n');
    } finally {
        if (prisma) {
            await prisma.$disconnect();
        }
    }
}

// Run the script
createSupportUser().catch(console.error);
