import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import LiveFeedTicker from '../ui/LiveFeedTicker'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-sw-bg flex flex-col">
      {/* Top navbar — fixed height 56px */}
      <Navbar />

      {/* Page content — sits below navbar */}
      <main className="flex-1 mt-[56px]">
        <Outlet />
      </main>

      {/* Live feed ticker pinned to bottom */}
      <LiveFeedTicker />
    </div>
  )
}
