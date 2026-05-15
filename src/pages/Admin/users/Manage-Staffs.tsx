import React from 'react'
import UserManagementTable from './UserManagementTable'

const ManageStaffs = () => {
  return (
    <div className="container mx-auto">
      <div className="mb-6 flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Staff Management</h2>
        <p className="text-muted-foreground">Manage your organization's staff members and their access levels.</p>
      </div>
      <UserManagementTable role="Staff" title="Staff Management" />
    </div>
  )
}

export default ManageStaffs