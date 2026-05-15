import React from 'react'
import UserManagementTable from './UserManagementTable'

const ManageAdmins = () => {
  return (
    <div className="container mx-auto">
      <div className="mb-6 flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Admin Management</h2>
        <p className="text-muted-foreground">Manage and monitor all system administrators and their account statuses.</p>
      </div>
      <UserManagementTable role="Admin" title="Admin Management" />
    </div>
  )
}

export default ManageAdmins