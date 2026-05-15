import React from 'react'
import UserManagementTable from './UserManagementTable'

const ManageManagers = () => {
  return (
    <div className="container mx-auto">
      <div className="mb-6 flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Manager Management</h2>
        <p className="text-muted-foreground">Monitor and manage operational managers and department leads.</p>
      </div>
      <UserManagementTable role="Manager" title="Manager Management" />
    </div>
  )
}

export default ManageManagers