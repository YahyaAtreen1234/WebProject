import connectDB from '@/src/lib/mongodb';
import User from '@/src/models/User';
import bcrypt from 'bcryptjs';

async function setupAdmin() {
  try {
    await connectDB();
    console.log('🔄 Setting up admin user...');

    // Delete existing admin with this email
    await User.deleteOne({ email: 'yahyaatreen@gmail.com' });

    // Hash password
    const hashedPassword = await bcrypt.hash('AliK', 10);

    // Create admin user
    const admin = await User.create({
      email: 'yahyaatreen@gmail.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
    });

    console.log('\n✅ Admin user created successfully!');
    console.log('───────────────────────────────────');
    console.log('📧 Email:    yahyaatreen@gmail.com');
    console.log('🔑 Password: AliK');
    console.log('👤 Role:     Admin');
    console.log('───────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setupAdmin();
