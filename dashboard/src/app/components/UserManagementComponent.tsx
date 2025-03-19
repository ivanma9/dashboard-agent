"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AddUserComponent from './AddUserComponent';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AWSEmailAgent } from '@/utils/awsService';
import { toast } from 'sonner';

const UserManagementComponent = () => {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editedUser, setEditedUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const { data: userData, isLoading: loading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch users');
      }
      
      return data.users;
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await fetch(`/api/users`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to update user');
      }
      
      return data.user;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      const result = await AWSEmailAgent.sendUserNotification(editedUser, 'updated');
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
      setIsModalOpen(false);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => { 
      const response = await fetch(`/api/users`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: userId }),
      });
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to delete user');
      }
      
      return data;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      const result = await AWSEmailAgent.sendUserNotification(selectedUser, 'deleted');
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
      setIsModalOpen(false);
    },
  });

  const handleUserClick = (user: any) => {
    setSelectedUser(user);
    setEditedUser({ ...user });
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = () => {
    updateUserMutation.mutate(editedUser);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate(selectedUser.id);
    }
  };

  // Sort handler function
  const handleSort = (field: string) => {
    // If clicking on the current sort field, toggle direction
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If clicking on a new field, set it as sort field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort the user data
  const sortedUserData = React.useMemo(() => {
    if (!userData) return [];
    
    return [...userData].sort((a, b) => {
      // Handle null/undefined values
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      
      // Compare based on current sort direction
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [userData, sortField, sortDirection]);

  // The SortableHeader component for cleaner code
  const SortableHeader = ({ field, children }: { field: string, children: React.ReactNode }) => (
    <th 
      className="py-4 px-6 text-left font-semibold text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortField === field ? (
          <span className="ml-1">
            {sortDirection === 'asc' ? '↑' : '↓'}
          </span>
        ) : null}
      </div>
    </th>
  );

  return (
    <div className="p-6">
      <div className="w-full flex flex-row items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Link href="/">
          <button className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium shadow-lg hover:bg-gray-700 transition-colors duration-200">
            Back to Dashboard
          </button>
        </Link>
      </div>
      <div className="bg-white shadow rounded-lg p-4">
        <AddUserComponent queryClient={queryClient} />
      </div>

      <Card className="shadow-lg">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="text-xl font-semibold">User Directory</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <SortableHeader field="name">Name</SortableHeader>
                  <SortableHeader field="email">Email</SortableHeader>
                  <SortableHeader field="phone">Phone</SortableHeader>
                  <SortableHeader field="createdAt">Created At</SortableHeader>
                  <SortableHeader field="updatedAt">Updated At</SortableHeader>
                  <SortableHeader field="deletedAt">Deleted At</SortableHeader>
                  <th className="py-4 px-6 text-left font-semibold text-gray-900 dark:text-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-4 px-6 text-center text-gray-500">
                      <div className="flex justify-center items-center space-x-2">
                        <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Loading users...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="py-4 px-6 text-center text-red-500">
                      Error loading users: {error instanceof Error ? error.message : 'Unknown error'}
                    </td>
                  </tr>
                ) : sortedUserData.length > 0 ? (
                  sortedUserData.map((user: any, index: number) => (
                    <tr 
                      key={index} 
                      className={`
                        ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} 
                        dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150
                      `}
                    >
                      <td className="py-4 px-6">{user.name}</td>
                      <td className="py-4 px-6">{user.email}</td>
                      <td className="py-4 px-6">{user.phone || 'N/A'}</td>
                      <td className="py-4 px-6">{user.createdAt || 'N/A'}</td>
                      <td className="py-4 px-6">{user.updatedAt || 'N/A'}</td>
                      <td className="py-4 px-6">{user.deletedAt || 'N/A'}</td>
                      <td className="py-4 px-6">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleUserClick(user)}
                        >
                          View/Edit
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-4 px-6 text-center text-gray-500">
                      No users found. Add a user to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* User Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          
          {editedUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={editedUser.name || ''} 
                  onChange={handleInputChange} 
                  className="col-span-3" 
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  value={editedUser.email || ''} 
                  onChange={handleInputChange} 
                  className="col-span-3" 
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">Phone</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  value={editedUser.phone || ''} 
                  onChange={handleInputChange} 
                  className="col-span-3" 
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="createdAt" className="text-right">Created At</Label>
                <Input 
                  id="createdAt" 
                  name="createdAt" 
                  value={editedUser.createdAt || ''} 
                  disabled 
                  className="col-span-3" 
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="updatedAt" className="text-right">Updated At</Label>
                <Input 
                  id="updatedAt" 
                  name="updatedAt" 
                  value={editedUser.updatedAt || ''} 
                  disabled 
                  className="col-span-3" 
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={handleDelete} className="bg-red-100 text-red-700 hover:bg-red-200">
              Delete
            </Button>
            <Button onClick={handleUpdate} className="bg-blue-600 text-white hover:bg-blue-700">
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagementComponent; 