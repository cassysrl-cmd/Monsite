import type { Metadata } from 'next'
import { AdminDashboard } from '@/components/admin/dashboard'
import { AdminLoginForm } from '@/components/admin/login-form'
import { isAdmin } from '@/lib/admin-auth'
import { getData } from '@/lib/store'

export const metadata: Metadata = {
  title: 'Administration · Secret Santa ABE',
  robots: { index: false, follow: false },
}

export default async function AdminPage() {
  if (!(await isAdmin())) {
    return (
      <div className="mx-auto max-w-md px-6 py-12 lg:py-16">
        <AdminLoginForm />
      </div>
    )
  }

  const data = await getData()
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <AdminDashboard participants={data.participants} draw={data.draw} />
    </div>
  )
}
