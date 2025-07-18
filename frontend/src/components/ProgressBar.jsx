import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCheckIn } from '../contexts/CheckInContext'

const ProgressBar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentStep, completedSteps, canNavigateToStep, getStepPath } = useCheckIn()
  
  const steps = [
    { name: 'Demographics', path: '/demographics' },
    { name: 'Insurance', path: '/insurance' },
    { name: 'Clinical Forms', path: '/clinical-forms' },
    { name: 'Confirmation', path: '/confirmation' }
  ]

  // Determine current step based on current path
  const getCurrentStepFromPath = () => {
    const stepIndex = steps.findIndex(step => step.path === location.pathname)
    return stepIndex !== -1 ? stepIndex + 1 : 1
  }

  const actualCurrentStep = getCurrentStepFromPath()

  const handleStepClick = (stepNumber) => {
    if (canNavigateToStep(stepNumber)) {
      const path = getStepPath(stepNumber)
      navigate(path)
    }
  }

  const getStepStatus = (stepNumber) => {
    if (completedSteps.has(stepNumber)) return 'completed'
    if (stepNumber === actualCurrentStep) return 'current'
    return 'pending'
  }

  return (
    <div className="progress-bar">
      <div className="progress-header">
        <h3>Check-in Progress</h3>
        <span className="step-counter">Step {actualCurrentStep} of {steps.length}</span>
      </div>
      <div className="progress-steps">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const status = getStepStatus(stepNumber)
          const isClickable = canNavigateToStep(stepNumber)
          
          return (
            <div 
              key={index}
              className={`progress-step ${status} ${isClickable ? 'clickable' : ''}`}
              onClick={() => handleStepClick(stepNumber)}
              title={isClickable ? `Go to ${step.name}` : `Complete previous steps to access ${step.name}`}
            >
              <div className="step-number">
                {status === 'completed' ? '✓' : stepNumber}
              </div>
              <div className="step-label">{step.name}</div>
            </div>
          )
        })}
      </div>
      
      {/* Navigation buttons */}
      <div className="progress-navigation">
        {actualCurrentStep > 1 && (
          <button 
            className="btn btn-secondary"
            onClick={() => handleStepClick(actualCurrentStep - 1)}
          >
            ← Previous Step
          </button>
        )}
        {actualCurrentStep < steps.length && completedSteps.has(actualCurrentStep) && (
          <button 
            className="btn btn-primary"
            onClick={() => handleStepClick(actualCurrentStep + 1)}
          >
            Next Step →
          </button>
        )}
      </div>
    </div>
  )
}

export default ProgressBar