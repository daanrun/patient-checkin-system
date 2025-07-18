import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCheckIn } from '../contexts/CheckInContext'
import axios from 'axios'

const Demographics = () => {
  const navigate = useNavigate()
  const { formData: contextFormData, updateFormData, markStepCompleted } = useCheckIn()
  const [formData, setFormData] = useState(contextFormData.demographics)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // Update local state when context data changes
  useEffect(() => {
    setFormData(contextFormData.demographics)
  }, [contextFormData.demographics])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    const newFormData = {
      ...formData,
      [name]: value
    }
    
    setFormData(newFormData)
    // Update context data
    updateFormData('demographics', newFormData)
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Required field validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required'
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required'
    }
    if (!formData.state.trim()) {
      newErrors.state = 'State is required'
    }
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required'
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    }

    // Format validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (formData.phoneNumber && !/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number (e.g., 123-456-7890)'
    }

    if (formData.zipCode && !/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)'
    }

    // Date validation - must be in the past and reasonable age
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      
      if (birthDate > today) {
        newErrors.dateOfBirth = 'Date of birth cannot be in the future'
      } else if (age > 150) {
        newErrors.dateOfBirth = 'Please enter a valid date of birth'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // For now, simulate API success since backend isn't fully implemented
      // TODO: Replace with actual API call when backend is ready
      // const response = await axios.post('/api/patients', {
      //   first_name: formData.firstName,
      //   last_name: formData.lastName,
      //   date_of_birth: formData.dateOfBirth,
      //   address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
      //   phone: formData.phoneNumber,
      //   email: formData.email
      // })

      // Simulate successful response
      const mockResponse = { data: { id: Date.now() } }
      
      // Store patient ID for next steps
      localStorage.setItem('patientId', mockResponse.data.id)
      
      // Mark step as completed
      markStepCompleted(1)
      
      // Navigate to next step
      navigate('/insurance')
    } catch (error) {
      console.error('Error submitting demographics:', error)
      if (error.response?.data?.message) {
        setSubmitError(error.response.data.message)
      } else {
        setSubmitError('An error occurred while saving your information. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="step-container">
      <h2>Step 1: Demographics Information</h2>
      <p className="step-description">Please provide your personal information to complete your check-in.</p>
      
      <form onSubmit={handleSubmit} className="demographics-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name *</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className={errors.firstName ? 'error' : ''}
              placeholder="Enter your first name"
            />
            {errors.firstName && <span className="error-message">{errors.firstName}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="lastName">Last Name *</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className={errors.lastName ? 'error' : ''}
              placeholder="Enter your last name"
            />
            {errors.lastName && <span className="error-message">{errors.lastName}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="dateOfBirth">Date of Birth *</label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            className={errors.dateOfBirth ? 'error' : ''}
          />
          {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="address">Street Address *</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className={errors.address ? 'error' : ''}
            placeholder="Enter your street address"
          />
          {errors.address && <span className="error-message">{errors.address}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="city">City *</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className={errors.city ? 'error' : ''}
              placeholder="Enter your city"
            />
            {errors.city && <span className="error-message">{errors.city}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="state">State *</label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              className={errors.state ? 'error' : ''}
              placeholder="Enter your state"
            />
            {errors.state && <span className="error-message">{errors.state}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="zipCode">ZIP Code *</label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleInputChange}
              className={errors.zipCode ? 'error' : ''}
              placeholder="12345"
            />
            {errors.zipCode && <span className="error-message">{errors.zipCode}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number *</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            className={errors.phoneNumber ? 'error' : ''}
            placeholder="123-456-7890"
          />
          {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={errors.email ? 'error' : ''}
            placeholder="your.email@example.com"
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        {submitError && (
          <div className="submit-error">
            {submitError}
          </div>
        )}

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Continue to Insurance Information'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Demographics