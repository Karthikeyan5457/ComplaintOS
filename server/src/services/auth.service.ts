import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../lib/supabase';
import { env } from '../config/env';
import { AppError } from '../middleware/error.middleware';

export class AuthService {
  async register(data: { email: string; password: string; name: string; phone?: string }) {
    const { data: existing } = await supabase.from('users').select('id').eq('email', data.email).maybeSingle();
    if (existing) {
      throw new AppError('Email already registered', 409);
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email: data.email,
        password: hashedPassword,
        name: data.name,
        phone: data.phone || null,
      })
      .select('id, email, name, role, phone, departmentId, createdAt')
      .single();

    if (error) {
      console.error('Supabase Registration Error:', error);
      throw new AppError('Failed to create user', 500);
    }

    const token = this.generateToken(user.id);
    return { user, token };
  }

  async login(email: string, password: string) {
    const { data: user, error } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
    
    if (error) {
      console.error('Supabase Login Error:', error);
    }
    console.log('Login User Lookup Result:', user);

    if (error || !user || !user.isActive) {
      throw new AppError('Invalid credentials', 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = this.generateToken(user.id);
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async getProfile(userId: string) {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, role, phone, avatar, departmentId, isActive, createdAt, departments!fk_department(id, name)')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('getProfile Error:', error);
      throw new AppError(`Supabase Error: ${error.message} - ${error.details}`, 500);
    }
    if (!user) throw new AppError('User not found', 404);
    
    // Map departments to department to match previous output
    const { departments, ...rest } = user;
    return { ...rest, department: departments };
  }

  private generateToken(userId: string): string {
    return jwt.sign({ userId }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    } as jwt.SignOptions);
  }
}

export const authService = new AuthService();
