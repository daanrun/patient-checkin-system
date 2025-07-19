import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCheckIn } from '../contexts/CheckInContext'
import { apiCall } from '../utils/api'

const Insurance = () => {
  const navigate = useNavigate()
  const { formData: contextFormData, updateFormData, markStepCompleted, canNavigateToStep } = useCheckIn()
  const [formData, setFormData] = useState(contextFormData.insurance)
  const [errors, setErrors] = useState({})
  const [selectedFiles, setSelectedFiles] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if user can't access this step
  useEffect(() => {
    if (!canNavigateToStep(2)) {
      navigate('/demographics')
    }
  }, [canNavigateToStep, navigate])

  // Update local state when context data changes
  useEffect(() => {
    setFormData(contextFormData.insurance)
  }, [contextFormData.insurance])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    const newFormData = {
      ...formData,
      [name]: value
    }
    
    setFormData(newFormData)
    updateFormData('insurance', newFormData)
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    
    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type))
    
    if (invalidFiles.length > 0) {
      setErrors(prev => ({
        ...prev,
        cardImages: 'Only JPG, PNG, and PDF files are allowed'
      }))
      return
    }
    
    // Validate file count
    if (files.length > 2) {
      setErrors(prev => ({
        ...prev,
        cardImages: 'Maximum 2 files allowed (front and back of card)'
      }))
      return
    }
    
    // Validate file size (5MB each)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      setErrors(prev => ({
        ...prev,
        cardImages: 'Each file must be smaller than 5MB'
      }))
      return
    }
    
    setSelectedFiles(files)
    
    // Clear file errors
    if (errors.cardImages) {
      setErrors(prev => ({
        ...prev,
        cardImages: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.provider.trim()) {
      newErrors.provider = 'Insurance provider is required'
    }
    if (!formData.policyNumber.trim()) {
      newErrors.policyNumber = 'Policy number is required'
    }
    if (!formData.subscriberName.trim()) {
      newErrors.subscriberName = 'Subscriber name is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      // Get patient ID
      const patientId = contextFormData.demographics?.patientId || Math.floor(Math.random() * 1000) + 1
      
      // Prepare JSON data (file upload simplified for demo)
      const insuranceData = {
        provider: formData.provider,
        policyNumber: formData.policyNumber,
        groupNumber: formData.groupNumber || '',
        subscriberName: formData.subscriberName,
        patientId: patientId,
        hasFiles: selectedFiles.length > 0,
        fileNames: selectedFiles.map(f => f.name)
      }

      // Submit to API
      const response = await apiCall('/insurance', {
        method: 'POST',
        body: JSON.stringify(insuranceData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save insurance information')
      }

      // Store patient ID for next steps
      localStorage.setItem('patientId', patientId.toString())

      // Update context with successful submission
      updateFormData('insurance', {
        ...formData,
        submitted: true,
        submissionId: result.data.id,
        patientId: patientId
      })

      // Mark step as completed and navigate to next step
      markStepCompleted(2)
      navigate('/clinical-forms')

    } catch (error) {
      console.error('Error submitting insurance information:', error)
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Failed to save insurance information. Please try again.'
      }))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkipForNow = () => {
    // Allow skipping for demo purposes
    markStepCompleted(2)
    navigate('/clinical-forms')
  }

  return (
    <div className="step-container">
      <h2>Step 2: Insurance Information</h2>
      <p className="step-description">Please provide your insurance information to help us verify your coverage.</p>
      
      <form onSubmit={handleSubmit} className="insurance-form">
        <div className="form-group">
          <label htmlFor="provider">Insurance Provider *</label>
          <input
            type="text"
            id="provider"
            name="provider"
            value={formData.provider}
            onChange={handleInputChange}
            className={errors.provider ? 'error' : ''}
            placeholder="e.g., Blue Cross Blue Shield, Aetna, Cigna"
          />
          {errors.provider && <span className="error-message">{errors.provider}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="policyNumber">Policy Number *</label>
            <input
              type="text"
              id="policyNumber"
              name="policyNumber"
              value={formData.policyNumber}
              onChange={handleInputChange}
              className={errors.policyNumber ? 'error' : ''}
              placeholder="Enter your policy number"
            />
            {errors.policyNumber && <span className="error-message">{errors.policyNumber}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="groupNumber">Group Number</label>
            <input
              type="text"
              id="groupNumber"
              name="groupNumber"
              value={formData.groupNumber}
              onChange={handleInputChange}
              placeholder="Enter group number (if applicable)"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="subscriberName">Subscriber Name *</label>
          <input
            type="text"
            id="subscriberName"
            name="subscriberName"
            value={formData.subscriberName}
            onChange={handleInputChange}
            className={errors.subscriberName ? 'error' : ''}
            placeholder="Name of the primary insurance holder"
          />
          {errors.subscriberName && <span className="error-message">{errors.subscriberName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="cardImages">Insurance Card Images</label>
          <input
            type="file"
            id="cardImages"
            name="cardImages"
            multiple
            accept="image/*,.pdf"
            className={`file-input ${errors.cardImages ? 'error' : ''}`}
            onChange={handleFileChange}
          />
          {errors.cardImages && <span className="error-message">{errors.cardImages}</span>}
          {selectedFiles.length > 0 && (
            <div className="selected-files">
              <p>Selected files:</p>
              <ul>
                {selectedFiles.map((file, index) => (
                  <li key={index}>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</li>
                ))}
              </ul>
            </div>
          )}
          <small className="form-help">Upload front and back of your insurance card (JPG, PNG, or PDF, max 5MB each)</small>
        </div>

        {errors.submit && (
          <div className="error-message submit-error">
            {errors.submit}
          </div>
        )}

        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={handleSkipForNow}
            disabled={isSubmitting}
          >
            Skip for Now
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Continue to Clinical Forms'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Insurance