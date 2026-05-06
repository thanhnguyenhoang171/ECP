'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { User, Lock, Loader2 } from 'lucide-react';
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { loginSchema, LoginFormValues } from "@/features/auth/schemas/auth.schema";

export default function LoginView() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      remember: false,
    },
  });

  function onSubmit(values: LoginFormValues) {
    setIsLoading(true);
    console.log(values);
    
    setTimeout(() => {
      localStorage.setItem('access_token', 'fake_token_123');
      toast.success('Chào mừng bạn quay trở lại!');
      router.push('/dashboard');
      setIsLoading(false);
    }, 1000);
  }

  return (
    <div 
      className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2070')" }}
    >
      <div className="absolute inset-0 bg-black/40" />
      
      <div className="w-full max-w-md mx-4 z-10">
        <div className="backdrop-blur-lg bg-white/10 p-8 rounded-2xl border border-white/20 shadow-2xl space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold liquid-text-primary tracking-tight">Login</h1>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <label className="text-sm liquid-text-secondary ml-1">Enter your email</label>
                    <FormControl>
                      <input 
                        {...field} 
                        className="w-full bg-transparent border-b border-white/50 py-2 text-white outline-none focus:border-white transition-colors placeholder:text-white/30"
                      />
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <label className="text-sm liquid-text-secondary ml-1">Enter your password</label>
                    <FormControl>
                      <input 
                        type="password"
                        {...field} 
                        className="w-full bg-transparent border-b border-white/50 py-2 text-white outline-none focus:border-white transition-colors placeholder:text-white/30"
                      />
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between text-white text-sm">
                <FormField
                  control={form.control}
                  name="remember"
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="remember" 
                        className="border-white/50 data-[state=checked]:bg-white data-[state=checked]:text-black"
                        checked={field.value} 
                        onCheckedChange={field.onChange} 
                      />
                      <label 
                        htmlFor="remember" 
                        className="cursor-pointer liquid-text-secondary"
                      >
                        Remember me
                      </label>
                    </div>
                  )}
                />
                <Link href="#" className="liquid-text-secondary hover:underline opacity-90 hover:opacity-100 transition-opacity">
                  Forgot password?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-white text-black hover:bg-white/90 font-bold rounded-lg transition-all shadow-xl" 
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Log In
              </Button>

              <div className="text-center text-sm liquid-text-secondary pt-2">
                Don't have an account?{" "}
                <Link href="/register" className="text-white font-bold hover:underline underline-offset-4 shadow-sm">
                  Register
                </Link>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
