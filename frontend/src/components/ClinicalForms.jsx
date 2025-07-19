import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCheckIn } from '../contexts/CheckInContext'
import { apiCall } from '../utils/api'

const ClinicalForms = () => {
  const navigate = useNavigate()
  const { formData: contextFormData, updateFormData, markStepCompleted, canNavigateToStep } = useCheckIn()
  const [formData, setFormData] = useState(contextFormData.clinicalForms)
  const [errors, setErrors] = useState({})

  // Redirect if user can't access this step
  useEffect(() => {
    if (!canNavigateToStep(3)) {
      navigate('/demographics')
    }
  }, [canNavigateToStep, navigate])

  // Update local state when context data changes
  useEffect(() => {
    setFormData(contextFormData.clinicalForms)
  }, [contextFormData.clinicalForms])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    const newFormData = {
      ...formData,
      [name]: value
    }
    
    setFormData(newFormData)
    updateFormData('clinicalForms', newFormData)
    
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

    // Medical history is required (Requirement 3.2)
    if (!formData.medicalHistory.trim()) {
      newErrors.medicalHistory = 'Please provide your medical history or enter "None"'
    } else if (formData.medicalHistory.trim().length > 2000) {
      newErrors.medicalHistory = 'Medical history must be less than 2000 characters'
    }

    // Allergies are required (Requirement 3.2)
    if (!formData.allergies.trim()) {
      newErrors.allergies = 'Please list any allergies or enter "None"'
    } else if (formData.allergies.trim().length > 1000) {
      newErrors.allergies = 'Allergies information must be less than 1000 characters'
    }

    // Optional fields validation for length
    if (formData.currentMedications.trim().length > 2000) {
      newErrors.currentMedications = 'Current medications must be less than 2000 characters'
    }

    if (formData.symptoms.trim().length > 2000) {
      newErrors.symptoms = 'Symptoms description must be less than 2000 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      // Get patient ID from localStorage (set by demographics step)
      const patientId = localStorage.getItem('patientId') || 1; // Fallback for testing

      const clinicalFormsData = {
        medicalHistory: formData.medicalHistory,
        currentMedications: formData.currentMedications,
        allergies: formData.allergies,
        symptoms: formData.symptoms,
        patientId: patientId
      };

      console.log('🔄 Submitting clinical forms data:', clinicalFormsData)

      // Use direct fetch (same approach that worked for insurance)
      console.log('🧪 Testing direct fetch to /api/clinical-forms...')
      
      const response = await fetch('/api/clinical-forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(clinicalFormsData)
      })

      console.log('📥 Direct fetch response status:', response.status)
      console.log('📥 Direct fetch response headers:', Object.fromEntries(response.headers))

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Direct fetch error response:', errorText)
        throw new Error(`Direct Fetch Error (${response.status}): ${errorText}`)
      }

      const result = await response.json()
      console.log('✅ Clinical forms success response:', result)

      // Mark step as completed and navigate to confirmation
      markStepCompleted(3)
      navigate('/confirmation')

    } catch (error) {
      console.error('💥 Error submitting clinical forms:', error);
      console.error('💥 Error stack:', error.stack)
      setErrors({ submit: `Submission failed: ${error.message}. Please check your connection and try again.` });
    }
  }

  return (
    <div className="step-container">
      <h2>Step 3: Clinical Forms</h2>
      <p className="step-description">Please complete this medical questionnaire to help us provide the best care for your visit.</p>
      
      <form onSubmit={handleSubmit} className="clinical-forms">
        <div className="form-group">
          <label htmlFor="medicalHistory">Medical History *</label>
          <textarea
            id="medicalHistory"
            name="medicalHistory"
            value={formData.medicalHistory}
            onChange={handleInputChange}
            className={errors.medicalHistory ? 'error' : ''}
            placeholder="Please describe any significant medical conditions, surgeries, or ongoing health issues. Enter 'None' if not applicable."
            rows="4"
          />
          {errors.medicalHistory && <span className="error-message">{errors.medicalHistory}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="currentMedications">Current Medications</label>
          <textarea
            id="currentMedications"
            name="currentMedications"
            value={formData.currentMedications}
            onChange={handleInputChange}
            className={errors.currentMedications ? 'error' : ''}
            placeholder="List all medications you are currently taking, including dosages. Include over-the-counter medications and supplements. Enter 'None' if not applicable."
            rows="4"
          />
          {errors.currentMedications && <span className="error-message">{errors.currentMedications}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="allergies">Allergies *</label>
          <textarea
            id="allergies"
            name="allergies"
            value={formData.allergies}
            onChange={handleInputChange}
            className={errors.allergies ? 'error' : ''}
            placeholder="List any known allergies to medications, foods, or other substances. Include the type of reaction if known. Enter 'None' if not applicable."
            rows="3"
          />
          {errors.allergies && <span className="error-message">{errors.allergies}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="symptoms">Current Symptoms or Concerns</label>
          <textarea
            id="symptoms"
            name="symptoms"
            value={formData.symptoms}
            onChange={handleInputChange}
            className={errors.symptoms ? 'error' : ''}
            placeholder="Describe any current symptoms, pain, or health concerns you'd like to discuss during your visit. Enter 'None' if this is a routine visit."
            rows="4"
          />
          {errors.symptoms && <span className="error-message">{errors.symptoms}</span>}
        </div>

        {errors.submit && (
          <div className="error-message submit-error">
            {errors.submit}
          </div>
        )}

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
          >
            Complete Check-in
          </button>
        </div>
      </form>
    </div>
  )
}

export default ClinicalForms