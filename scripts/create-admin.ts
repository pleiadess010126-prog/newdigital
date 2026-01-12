import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
}

async function createAdmin() {
    console.log('\n🔐 Admin User Creation Script\n');
    console.log('This script will create a superadmin user for your DigitalMEng application.\n');

    try {
        // Get admin details
        const email = await question('Enter admin email: ');
        const name = await question('Enter admin name: ');
        const password = await question('Enter admin password: ');
        const orgName = await question('Enter organization name (default: "Admin Organization"): ') || 'Admin Organization';

        console.log('\n🔄 Creating admin user...\n');

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create organization slug
        const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            console.log('❌ User with this email already exists!');
            console.log('Updating existing user to superadmin role...\n');

            const updatedUser = await prisma.user.update({
                where: { email },
                data: {
                    role: 'superadmin',
                    name,
                    passwordHash
                }
            });

            console.log('✅ User updated successfully!');
            console.log(`📧 Email: ${updatedUser.email}`);
            console.log(`👤 Name: ${updatedUser.name}`);
            console.log(`🔑 Role: ${updatedUser.role}`);
            console.log(`🆔 User ID: ${updatedUser.id}\n`);

            rl.close();
            return;
        }

        // Create organization first
        const organization = await prisma.organization.create({
            data: {
                name: orgName,
                slug: slug,
                plan: 'enterprise',
                ownerId: 'temp-id', // Will update after user creation
                brandName: orgName,
                timezone: 'UTC',
                defaultLanguage: 'en'
            }
        });

        console.log(`✅ Organization created: ${organization.name}`);

        // Create admin user
        const admin = await prisma.user.create({
            data: {
                email,
                name,
                passwordHash,
                role: 'superadmin',
                authProvider: 'email',
                emailVerified: true,
                organizationId: organization.id
            }
        });

        console.log(`✅ Admin user created: ${admin.email}`);

        // Update organization owner
        await prisma.organization.update({
            where: { id: organization.id },
            data: { ownerId: admin.id }
        });

        console.log('✅ Organization ownership updated');

        // Create organization member record
        await prisma.organizationMember.create({
            data: {
                organizationId: organization.id,
                userId: admin.id,
                role: 'owner',
                invitedBy: admin.id,
                status: 'active',
                acceptedAt: new Date()
            }
        });

        console.log('✅ Organization membership created\n');

        // Display summary
        console.log('═══════════════════════════════════════');
        console.log('🎉 Admin User Created Successfully!');
        console.log('═══════════════════════════════════════');
        console.log(`📧 Email: ${admin.email}`);
        console.log(`👤 Name: ${admin.name}`);
        console.log(`🔑 Role: ${admin.role}`);
        console.log(`🏢 Organization: ${organization.name}`);
        console.log(`🆔 User ID: ${admin.id}`);
        console.log(`🆔 Organization ID: ${organization.id}`);
        console.log('═══════════════════════════════════════\n');
        console.log('You can now login with these credentials at:');
        console.log('http://localhost:3000/login\n');

    } catch (error) {
        console.error('\n❌ Error creating admin user:', error);
        process.exit(1);
    } finally {
        rl.close();
        await prisma.$disconnect();
    }
}

createAdmin();
