import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../../components/layout/AdminSidebar';

const AdminLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-grow min-h-screen overflow-y-auto no-scrollbar relative z-10 w-full max-w-[calc(100vw-320px)] ml-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
