import bcrypt from 'bcryptjs';
import { connectDB } from '../config/database';
import Admin from '../models/Admin';
import { UserRole } from '../types';

const createAdmin = async () => {
  try {
    await connectDB();

    // Remove existing admin if exists
    await Admin.deleteOne({ email: 'admin@tecidos.com' });

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const admin = new Admin({
      nome: 'Administrador',
      email: 'admin@tecidos.com',
      senha: hashedPassword,
      role: UserRole.ADMINISTRADOR
    });
    
    await admin.save();
    console.log('Admin user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdmin(); 