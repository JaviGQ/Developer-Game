import { Outlet } from 'react-router'
import Sidebar from './Sidebar'

function Layout() {
  return (
    <div className="layout">
      <Sidebar />
      <div className="content">
        <Outlet />
      </div>
    </div>
  )
}

export default Layout