'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch } from '@/lib/hooks';
import { setCredentials } from '@/lib/features/auth/authSlice';
import axiosInstance from '@/lib/axiosInstance';
import { useRouter } from 'next/navigation';
import { ChefHat, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await axiosInstance.post('/auth/login', data);
      dispatch(setCredentials({ user: res.data.user, token: res.data.token }));
      toast.success(`Welcome back, ${res.data.user.name}!`);
      router.push('/admin');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute border border-white rounded-full" style={{ width: `${(i+1)*150}px`, height: `${(i+1)*150}px`, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
          ))}
        </div>
        <Link href="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-white/20 rounded-2xl"><ChefHat className="h-8 w-8 text-white" /></div>
            <span className="text-2xl font-bold text-white">SmartServe AI</span>
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-4">Manage your restaurant with the power of AI</h2>
          <p className="text-white/70 text-lg">Complete ERP & POS. Real-time KDS. AI-driven insights. One platform.</p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[['Orders Today', '156'], ['Revenue', '₹48,230'], ['Active Tables', '12/20'], ['Happy Customers', '94%']].map(([k, v]) => (
              <div key={k} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-white/60 text-xs mb-1">{k}</div>
                <div className="text-white text-xl font-bold">{v}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/40 text-sm">© 2025 SmartServe AI</p>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-fadeIn">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="p-2 bg-blue-600 rounded-xl"><ChefHat className="h-6 w-6 text-white" /></div>
            <span className="text-xl font-bold text-white">SmartServe AI</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-gray-400 mb-8">Sign in to your restaurant dashboard</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label text-gray-300">Email address</label>
              <input {...register('email')} type="email" className={`input-field bg-gray-800 border-gray-700 text-white ${errors.email ? 'border-red-500' : ''}`} placeholder="you@restaurant.com" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label text-gray-300">Password</label>
              <div className="relative">
                <input {...register('password')} type={showPassword ? 'text' : 'password'} className={`input-field bg-gray-800 border-gray-700 text-white pr-10 ${errors.password ? 'border-red-500' : ''}`} placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-400">
                <input type="checkbox" className="rounded border-gray-600 bg-gray-800" /> Remember me
              </label>
              <a href="#" className="text-sm text-blue-400 hover:text-blue-300">Forgot password?</a>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full py-3 gradient-primary rounded-xl text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-400 text-sm">
            Don't have an account?{' '}
            <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
