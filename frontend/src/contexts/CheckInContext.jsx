import React, { createContext, useContext, useState, useEffect } from 'react'

const CheckInContext = createContext()

export const useCheckIn = () => {
  const context = useContext(CheckInContext)
  if (!context) {
    throw new Error('useCheckIn must be used within a CheckInProvider')
  }
  return context
}

export const CheckInProvider = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    demographics: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phoneNumber: '',
      email: ''
    },
    insurance: {
      provider: '',
      policyNumber: '',
      groupNumber: '',
      subscriberName: '',
      cardImages: []
    },
    clinicalForms: {
      medicalHistory: '',
      currentMedications: '',
      allergies: '',
      symptoms: ''
    }
  })
  const [completedSteps, setCompletedSteps] = useState(new Set())

  // Load data from localStorage on initialization
  useEffect(() => {
    const savedData = localStorage.getItem('checkInFormData')
    const savedStep = localStorage.getItem('checkInCurrentStep')
    const savedCompleted = localStorage.getItem('checkInCompletedSteps')

    if (savedData) {
      try {
        setFormData(JSON.parse(savedData))
      } catch (error) {
        console.error('Error loading saved form data:', error)
      }
    }

    if (savedStep) {
      setCurrentStep(parseInt(savedStep, 10))
    }

    if (savedCompleted) {
      try {
        setCompletedSteps(new Set(JSON.parse(savedCompleted)))
      } catch (error) {
        console.error('Error loading completed steps:', error)
      }
    }
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('checkInFormData', JSON.stringify(formData))
  }, [formData])

  useEffect(() => {
    localStorage.setItem('checkInCurrentStep', currentStep.toString())
  }, [currentStep])

  useEffect(() => {
    localStorage.setItem('checkInCompletedSteps', JSON.stringify([...completedSteps]))
  }, [completedSteps])

  const updateFormData = (section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }))
  }

  const markStepCompleted = (step) => {
    setCompletedSteps(prev => new Set([...prev, step]))
  }

  const navigateToStep = (step) => {
    if (step >= 1 && step <= 4) {
      setCurrentStep(step)
    }
  }

  const canNavigateToStep = (step) => {
    // Can always go to step 1
    if (step === 1) return true
    
    // Can navigate to a step if the previous step is completed
    return completedSteps.has(step - 1)
  }

  const getStepPath = (step) => {
    const paths = {
      1: '/demographics',
      2: '/insurance', 
      3: '/clinical-forms',
      4: '/confirmation'
    }
    return paths[step] || '/'
  }

  const value = {
    currentStep,
    setCurrentStep,
    formData,
    updateFormData,
    completedSteps,
    markStepCompleted,
    navigateToStep,
    canNavigateToStep,
    getStepPath
  }

  return (
    <CheckInContext.Provider value={value}>
      {children}
    </CheckInContext.Provider>
  )
}