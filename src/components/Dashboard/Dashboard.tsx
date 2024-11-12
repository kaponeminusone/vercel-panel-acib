import React from 'react'
import Sidebar from './Sidebar'
import MainContent from './MainContent'
import './Dashboard.css'

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard">
      <Sidebar />
      <MainContent />
    </div>
  )
}

export default Dashboard