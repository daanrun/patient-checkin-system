import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCheckIn } from '../contexts/CheckInContext'

const Confirmation = () => {
  const navigate = useNavigate()
  const { formData, canNavigateToStep, markStepCompleted } = useCheckIn()
  const [completionStatus, setCompletionStatus] = useState({
    isCompleted: false,
    estimatedWaitTime: 20,
    error: null
  })
  const hasCompletedRef = useRef(false)

  // Complete the check-in process
  const completeCheckIn = async () => {
    try {
      const patientId = localStorage.getItem('patientId')
      if (!patientId) {
        throw new Error('Patient ID not found')
      }

      const completionData = {
        patientId: parseInt(patientId),
        estimatedWaitTime: 20
      }

      console.log('🔄 Completing check-in:', completionData)

      // Use direct fetch (same approach that worked for insurance)
      console.log('🧪 Testing direct fetch to /api/completion...')
      
      const response = await fetch('/api/completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(completionData)
      })

      console.log('📥 Direct fetch response status:', response.status)
      console.log('📥 Direct fetch response headers:', Object.fromEntries(response.headers))

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Direct fetch error response:', errorText)
        throw new Error(`Direct Fetch Error (${response.status}): ${errorText}`)
      }

      const result = await response.json()
      console.log('✅ Check-in completion success response:', result)

      setCompletionStatus({
        isCompleted: true,
        estimatedWaitTime: result.data?.estimatedWaitTime || 20,
        error: null
      })

    } catch (error) {
      console.error('💥 Error completing check-in:', error)
      console.error('💥 Error stack:', error.stack)
      setCompletionStatus({
        isCompleted: false,
        estimatedWaitTime: 20,
        error: error.message
      })
    }
  }

  // Redirect if user can't access this step
  useEffect(() => {
    if (!canNavigateToStep(4)) {
      navigate('/demographics')
    } else if (!hasCompletedRef.current) {
      // Mark final step as completed and trigger completion only once
      hasCompletedRef.current = true
      markStepCompleted(4)
      completeCheckIn()
    }
  }, [canNavigateToStep, navigate])

  const handleStartOver = () => {
    // Clear all data and start over
    localStorage.removeItem('checkInFormData')
    localStorage.removeItem('checkInCurrentStep')
    localStorage.removeItem('checkInCompletedSteps')
    localStorage.removeItem('patientId')
    navigate('/demographics')
    window.location.reload() // Force refresh to reset context
  }

  return (
    <div className="step-container">
      <div className="confirmation-header">
        <div className="success-icon">✓</div>
        <h2>Check-in Complete!</h2>
        <p className="confirmation-message">
          Thank you for completing your appointment check-in. Your information has been submitted successfully.
        </p>
        {completionStatus.error && (
          <div className="error-message">
            <strong>Note:</strong> {completionStatus.error}
          </div>
        )}
        {completionStatus.isCompleted && (
          <div className="success-message">
            <strong>Confirmation email sent!</strong> Check your email for appointment details.
          </div>
        )}
      </div>

      <div className="confirmation-summary">
        <h3>Summary of Your Information</h3>
        
        <div className="summary-section">
          <h4>Demographics</h4>
          <div className="summary-details">
            <p><strong>Name:</strong> {formData.demographics.firstName} {formData.demographics.lastName}</p>
            <p><strong>Date of Birth:</strong> {formData.demographics.dateOfBirth}</p>
            <p><strong>Phone:</strong> {formData.demographics.phoneNumber}</p>
            <p><strong>Email:</strong> {formData.demographics.email}</p>
            <p><strong>Address:</strong> {formData.demographics.address}, {formData.demographics.city}, {formData.demographics.state} {formData.demographics.zipCode}</p>
          </div>
        </div>

        <div className="summary-section">
          <h4>Insurance Information</h4>
          <div className="summary-details">
            <p><strong>Provider:</strong> {formData.insurance.provider || 'Not provided'}</p>
            <p><strong>Policy Number:</strong> {formData.insurance.policyNumber || 'Not provided'}</p>
            <p><strong>Subscriber:</strong> {formData.insurance.subscriberName || 'Not provided'}</p>
          </div>
        </div>

        <div className="summary-section">
          <h4>Clinical Information</h4>
          <div className="summary-details">
            <p><strong>Medical History:</strong> {formData.clinicalForms.medicalHistory || 'Not provided'}</p>
            <p><strong>Current Medications:</strong> {formData.clinicalForms.currentMedications || 'Not provided'}</p>
            <p><strong>Allergies:</strong> {formData.clinicalForms.allergies || 'Not provided'}</p>
            <p><strong>Current Symptoms:</strong> {formData.clinicalForms.symptoms || 'Not provided'}</p>
          </div>
        </div>
      </div>

      <div className="next-steps">
        <h3>What's Next?</h3>
        <div className="next-steps-content">
          <div className="step-item">
            <div className="step-number">1</div>
            <div className="step-text">
              <strong>Wait for Your Name</strong>
              <p>Please have a seat in the waiting area. You will be called when it's time for your appointment.</p>
            </div>
          </div>
          <div className="step-item">
            <div className="step-number">2</div>
            <div className="step-text">
              <strong>Estimated Wait Time</strong>
              <p>Approximately {completionStatus.estimatedWaitTime} minutes based on current schedule.</p>
            </div>
          </div>
          <div className="step-item">
            <div className="step-number">3</div>
            <div className="step-text">
              <strong>Questions?</strong>
              <p>If you have any questions or need to update your information, please speak with the front desk staff.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="confirmation-actions">
        <button 
          className="btn btn-secondary"
          onClick={handleStartOver}
        >
          Start New Check-in
        </button>
      </div>
    </div>
  )
}

export default Confirmation