'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch } from '@/lib/hooks';
import { setCredentials } from '@/lib/features/auth/authSlice';
import axiosInstance from '@/lib/axiosInstance';
import { useRouter } from 'next/navigation';
import { ChefHat, Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['Restaurant Owner', 'Manager', 'Cashier', 'Waiter', 'Chef', 'Kitchen Staff', 'Delivery Partner', 'Customer']),
}).refine(d => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'Restaurant Owner' }
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const { confirmPassword, ...payload } = data;
      const res = await axiosInstance.post('/auth/register', payload);
      dispatch(setCredentials({ user: res.data.user, token: res.data.token }));
      toast.success('Account created! Welcome to SmartServe AI!');
      router.push('/admin');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fadeIn">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-blue-600/10 rounded-2xl mb-4">
            <ChefHat className="h-8 w-8 text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold text-white">Create your account</h1>
          <p className="text-gray-400 mt-2">Start managing your restaurant with AI</p>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 backdrop-blur-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label text-gray-300">Full Name</label>
              <input {...register('name')} className={`input-field bg-gray-800 border-gray-600 text-white ${errors.name ? 'border-red-500' : ''}`} placeholder="John Doe" />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label text-gray-300">Email Address</label>
              <input {...register('email')} type="email" className={`input-field bg-gray-800 border-gray-600 text-white ${errors.email ? 'border-red-500' : ''}`} placeholder="you@restaurant.com" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label text-gray-300">Role</label>
              <select {...register('role')} className="input-field bg-gray-800 border-gray-600 text-white">
                {['Restaurant Owner','Manager','Cashier','Waiter','Chef','Kitchen Staff','Delivery Partner','Customer'].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label text-gray-300">Password</label>
              <div className="relative">
                <input {...register('password')} type={showPassword ? 'text' : 'password'} className={`input-field bg-gray-800 border-gray-600 text-white pr-10 ${errors.password ? 'border-red-500' : ''}`} placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="label text-gray-300">Confirm Password</label>
              <input {...register('confirmPassword')} type="password" className={`input-field bg-gray-800 border-gray-600 text-white ${errors.confirmPassword ? 'border-red-500' : ''}`} placeholder="••••••••" />
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full py-3 mt-2 gradient-primary rounded-xl text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-gray-400 text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
