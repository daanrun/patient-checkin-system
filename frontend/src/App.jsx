import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { CheckInProvider } from './contexts/CheckInContext'
import Layout from './components/Layout'
import Demographics from './components/Demographics'
import Insurance from './components/Insurance'
import ClinicalForms from './components/ClinicalForms'
import Confirmation from './components/Confirmation'
import ProgressBar from './components/ProgressBar'
import AdminDashboard from './components/AdminDashboard'
import AdminDetailView from './components/AdminDetailView'
import ErrorBoundary from './components/ErrorBoundary'

// Backend connected to Render: https://patient-checkin-system.onrender.com

function App() {
  return (
    <Router>
      <CheckInProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/demographics" replace />} />
            <Route path="/demographics" element={
              <div>
                <ProgressBar />
                <Demographics />
              </div>
            } />
            <Route path="/insurance" element={
              <div>
                <ProgressBar />
                <Insurance />
              </div>
            } />
            <Route path="/clinical-forms" element={
              <div>
                <ProgressBar />
                <ClinicalForms />
              </div>
            } />
            <Route path="/confirmation" element={
              <div>
                <ProgressBar />
                <Confirmation />
              </div>
            } />
            <Route path="/admin" element={
              <ErrorBoundary 
                fallbackMessage="The admin dashboard encountered an error. This might be due to a temporary issue with the application."
                onGoBack={() => window.location.href = '/'}
              >
                <AdminDashboard />
              </ErrorBoundary>
            } />
            <Route path="/admin/submissions/:id" element={
              <ErrorBoundary 
                fallbackMessage="The patient detail view encountered an error. This might be due to a temporary issue with the application."
                onGoBack={() => window.location.href = '/admin'}
              >
                <AdminDetailView />
              </ErrorBoundary>
            } />
          </Routes>
        </Layout>
      </CheckInProvider>
    </Router>
  )
}

export default App