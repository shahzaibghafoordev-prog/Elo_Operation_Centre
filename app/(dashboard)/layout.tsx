import Sidebar from '@/components/layout/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#07090f]">
      <Sidebar />
      <main className="flex-1 ml-56 flex flex-col min-h-screen overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}
