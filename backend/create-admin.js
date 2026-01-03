import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdmin() {
    try {
        console.log('🔍 Checking for existing admin user...');

        // Check if admin already exists
        const existing = await prisma.user.findUnique({
            where: { email: 'admin@company.com' }
        });

        if (existing) {
            console.log('\n❌ Admin user already exists!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📧 Email:', existing.email);
            console.log('🆔 Login ID:', existing.loginId);
            console.log('👤 Name:', existing.firstName, existing.lastName);
            console.log('🔐 Role:', existing.role);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('\n💡 You can login with:');
            console.log('   Email: admin@company.com');
            console.log('   Password: Admin@123');
            return;
        }

        console.log('✨ Creating new admin user...\n');

        // Create admin user
        const passwordHash = await bcrypt.hash('Admin@123', 10);

        const admin = await prisma.user.create({
            data: {
                email: 'admin@company.com',
                loginId: 'ADMIN001',
                passwordHash,
                role: 'ADMIN',
                firstName: 'Admin',
                lastName: 'User',
                isVerified: true,
                isFirstLogin: false,
            }
        });

        console.log('✅ Admin user created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email:', admin.email);
        console.log('🆔 Login ID:', admin.loginId);
        console.log('🔑 Password: Admin@123');
        console.log('👤 Name:', admin.firstName, admin.lastName);
        console.log('🔐 Role:', admin.role);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n🚀 Next Steps:');
        console.log('1. Login via POST /api/v1/auth/login');
        console.log('2. Check your email for OTP');
        console.log('3. Verify OTP via POST /api/v1/auth/verify-otp');
        console.log('4. Use the access token for authenticated requests');
        console.log('\n📖 See POSTMAN_GUIDE.md for detailed API testing instructions');

    } catch (error) {
        console.error('\n❌ Error creating admin:', error.message);
        if (error.code === 'P2002') {
            console.log('\n💡 Tip: A user with this email or loginId already exists.');
        }
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
