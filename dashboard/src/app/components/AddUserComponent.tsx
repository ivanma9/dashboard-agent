"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AWSEmailAgent } from '@/utils/awsService';
import { QueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { toast } from 'sonner';
interface User {
  name: string;
  email: string; 
  phone: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export default function AddUserComponent({ queryClient }: { queryClient: QueryClient }      ) {
  const [formData, setFormData] = useState<User>({
    name: '',
    email: '',
    phone: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(async (data) => {
      if (data.success) {
        console.log('User created successfully:', data.user);
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null
        });
        queryClient.invalidateQueries({ queryKey: ['users'] });
        // Send notification email for user creation
        const result = await AWSEmailAgent.sendUserNotification(data.user, 'created');
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      } else {
        console.error('Error creating user:', data.error);
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Add New User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Miguel Rodriguez"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="miguel.r@gmail.com"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(555) 345-6789"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add User
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
