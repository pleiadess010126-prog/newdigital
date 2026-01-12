import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createQuickAdmin() {
    console.log('\n🔐 Quick Admin Creation\n');

    // Default admin credentials
    const email = process.env.ADMIN_EMAIL || 'admin@digitalmeng.com';
    const name = process.env.ADMIN_NAME || 'System Administrator';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const orgName = process.env.ORG_NAME || 'DigitalMEng Admin';

    try {
        console.log('Creating admin user with default credentials...\n');

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create organization slug
        const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            console.log('⚠️  User already exists. Updating to superadmin...\n');

            const updatedUser = await prisma.user.update({
                where: { email },
                data: {
                    role: 'superadmin',
                    passwordHash
                }
            });

            console.log('✅ Admin user updated!\n');
            console.log('═══════════════════════════════════════');
            console.log('📧 Email:', updatedUser.email);
            console.log('🔑 Password:', password);
            console.log('👤 Role:', updatedUser.role);
            console.log('═══════════════════════════════════════\n');

            return;
        }

        // Check if organization exists
        let organization = await prisma.organization.findUnique({
            where: { slug }
        });

        if (!organization) {
            // Create organization
            organization = await prisma.organization.create({
                data: {
                    name: orgName,
                    slug: slug,
                    plan: 'enterprise',
                    ownerId: 'temp-id',
                    brandName: orgName,
                    timezone: 'UTC',
                    defaultLanguage: 'en'
                }
            });
            console.log(`✅ Organization created: ${organization.name}`);
        }

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

        console.log('\n═══════════════════════════════════════');
        console.log('🎉 Admin User Created Successfully!');
        console.log('═══════════════════════════════════════');
        console.log('📧 Email:', email);
        console.log('🔑 Password:', password);
        console.log('👤 Name:', name);
        console.log('🏢 Organization:', organization.name);
        console.log('🔐 Role: superadmin');
        console.log('═══════════════════════════════════════\n');
        console.log('⚠️  IMPORTANT: Change the password after first login!\n');
        console.log('Login at: http://localhost:3000/login\n');

    } catch (error) {
        console.error('\n❌ Error creating admin:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

createQuickAdmin();
