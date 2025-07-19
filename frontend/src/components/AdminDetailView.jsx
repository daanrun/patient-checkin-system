import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiCall, getFileUrl } from '../utils/api';

const AdminDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubmissionDetails = async () => {
      try {
        setLoading(true);
        
        console.log('🔄 Fetching submission details for ID:', id);

        // Use direct fetch (same approach that worked for other components)
        console.log('🧪 Testing direct fetch to /api/admin/submissions/' + id);
        
        const response = await fetch(`/api/admin/submissions/${id}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        console.log('📥 Direct fetch response status:', response.status);
        console.log('📥 Direct fetch response headers:', Object.fromEntries(response.headers));

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Direct fetch error response:', errorText);
          throw new Error(`Direct Fetch Error (${response.status}): ${errorText}`);
        }

        const result = await response.json();
        console.log('✅ Submission details success response:', result);

        setSubmission(result.data);
        setError(null);
      } catch (err) {
        console.error('💥 Error fetching submission details:', err);
        console.error('💥 Error stack:', err.stack);
        setError(`Failed to fetch submission details: ${err.message}. Please check your connection and try again.`);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSubmissionDetails();
    }
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <div style={{ fontSize: '1.1rem' }}>Loading submission details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div className="submit-error" style={{ marginBottom: '2rem' }}>
          <strong>Error:</strong> {error}
        </div>
        <button onClick={() => navigate('/admin')} className="btn btn-secondary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!submission) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
          Submission not found.
        </div>
        <button onClick={() => navigate('/admin')} className="btn btn-secondary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2c5aa0', marginBottom: '0.5rem' }}>
            Patient Details
          </h1>
          <p style={{ color: '#666' }}>
            {submission.patient.firstName} {submission.patient.lastName} - 
            <span 
              style={{
                marginLeft: '0.5rem',
                padding: '0.25rem 0.75rem',
                borderRadius: '1rem',
                fontSize: '0.75rem',
                fontWeight: '500',
                backgroundColor: submission.status === 'completed' ? '#d4edda' : '#fff3cd',
                color: submission.status === 'completed' ? '#155724' : '#856404'
              }}
            >
              {submission.status}
            </span>
          </p>
        </div>
        <button onClick={() => navigate('/admin')} className="btn btn-secondary">
          Back to Dashboard
        </button>
      </div>

      {/* Patient Information */}
      <div className="step-container" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1.5rem', color: '#2c5aa0' }}>
          Patient Information
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#333' }}>Name:</strong>
              <div style={{ marginTop: '0.25rem' }}>{submission.patient.firstName} {submission.patient.lastName}</div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#333' }}>Date of Birth:</strong>
              <div style={{ marginTop: '0.25rem' }}>{formatDateOnly(submission.patient.dateOfBirth)}</div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#333' }}>Phone:</strong>
              <div style={{ marginTop: '0.25rem' }}>{submission.patient.phone}</div>
            </div>
          </div>
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#333' }}>Email:</strong>
              <div style={{ marginTop: '0.25rem' }}>{submission.patient.email}</div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#333' }}>Address:</strong>
              <div style={{ marginTop: '0.25rem' }}>{submission.patient.address}</div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#333' }}>Submitted At:</strong>
              <div style={{ marginTop: '0.25rem' }}>{formatDate(submission.patient.createdAt)}</div>
            </div>
          </div>
        </div>
        
        {(submission.patient.emergencyContact || submission.patient.emergencyPhone) && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e9ecef' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#333' }}>
              Emergency Contact
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              {submission.patient.emergencyContact && (
                <div>
                  <strong style={{ color: '#333' }}>Contact Name:</strong>
                  <div style={{ marginTop: '0.25rem' }}>{submission.patient.emergencyContact}</div>
                </div>
              )}
              {submission.patient.emergencyPhone && (
                <div>
                  <strong style={{ color: '#333' }}>Contact Phone:</strong>
                  <div style={{ marginTop: '0.25rem' }}>{submission.patient.emergencyPhone}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Insurance Information */}
      {submission.insurance ? (
        <div className="step-container" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1.5rem', color: '#2c5aa0' }}>
            Insurance Information
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#333' }}>Insurance Provider:</strong>
                <div style={{ marginTop: '0.25rem' }}>{submission.insurance.provider}</div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#333' }}>Policy Number:</strong>
                <div style={{ marginTop: '0.25rem' }}>{submission.insurance.policyNumber}</div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#333' }}>Group Number:</strong>
                <div style={{ marginTop: '0.25rem' }}>{submission.insurance.groupNumber || 'N/A'}</div>
              </div>
            </div>
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#333' }}>Subscriber Name:</strong>
                <div style={{ marginTop: '0.25rem' }}>{submission.insurance.subscriberName}</div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#333' }}>Subscriber DOB:</strong>
                <div style={{ marginTop: '0.25rem' }}>{formatDateOnly(submission.insurance.subscriberDob)}</div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#333' }}>Relationship:</strong>
                <div style={{ marginTop: '0.25rem' }}>{submission.insurance.subscriberRelation}</div>
              </div>
            </div>
          </div>
          
          {/* Insurance Card Images */}
          {submission.insurance.cardImagePath && (
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e9ecef' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#333' }}>
                Insurance Card Images
              </h3>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ 
                  border: '1px solid #e9ecef', 
                  borderRadius: '8px', 
                  padding: '1rem',
                  backgroundColor: '#f8f9fa',
                  maxWidth: '300px'
                }}>
                  <img 
                    src={getFileUrl(submission.insurance.cardImagePath)}
                    alt="Insurance Card"
                    style={{ 
                      maxWidth: '100%', 
                      height: 'auto',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                    onClick={() => window.open(getFileUrl(submission.insurance.cardImagePath), '_blank')}
                  />
                  <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666', textAlign: 'center' }}>
                    Click to view full size
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="step-container" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1.5rem', color: '#2c5aa0' }}>
            Insurance Information
          </h2>
          <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px', color: '#666' }}>
            No insurance information provided
          </div>
        </div>
      )}

      {/* Clinical Forms */}
      {submission.clinicalForms ? (
        <div className="step-container" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1.5rem', color: '#2c5aa0' }}>
            Clinical Forms
          </h2>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div>
              <strong style={{ color: '#333' }}>Medical History:</strong>
              <div style={{ 
                marginTop: '0.5rem', 
                padding: '1rem', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '4px',
                whiteSpace: 'pre-wrap'
              }}>
                {submission.clinicalForms.medicalHistory || 'None provided'}
              </div>
            </div>
            
            <div>
              <strong style={{ color: '#333' }}>Current Medications:</strong>
              <div style={{ 
                marginTop: '0.5rem', 
                padding: '1rem', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '4px',
                whiteSpace: 'pre-wrap'
              }}>
                {submission.clinicalForms.currentMedications || 'None provided'}
              </div>
            </div>
            
            <div>
              <strong style={{ color: '#333' }}>Allergies:</strong>
              <div style={{ 
                marginTop: '0.5rem', 
                padding: '1rem', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '4px',
                whiteSpace: 'pre-wrap'
              }}>
                {submission.clinicalForms.allergies || 'None provided'}
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <div>
                <strong style={{ color: '#333' }}>Current Symptoms:</strong>
                <div style={{ 
                  marginTop: '0.5rem', 
                  padding: '1rem', 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: '4px',
                  whiteSpace: 'pre-wrap'
                }}>
                  {submission.clinicalForms.symptoms || 'None provided'}
                </div>
              </div>
              
              <div>
                <strong style={{ color: '#333' }}>Pain Level (1-10):</strong>
                <div style={{ 
                  marginTop: '0.5rem', 
                  padding: '1rem', 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: '4px'
                }}>
                  {submission.clinicalForms.painLevel || 'Not specified'}
                </div>
              </div>
            </div>
            
            {submission.clinicalForms.additionalConcerns && (
              <div>
                <strong style={{ color: '#333' }}>Additional Concerns:</strong>
                <div style={{ 
                  marginTop: '0.5rem', 
                  padding: '1rem', 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: '4px',
                  whiteSpace: 'pre-wrap'
                }}>
                  {submission.clinicalForms.additionalConcerns}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="step-container" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1.5rem', color: '#2c5aa0' }}>
            Clinical Forms
          </h2>
          <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px', color: '#666' }}>
            No clinical forms completed
          </div>
        </div>
      )}

      {/* Completion Information */}
      {submission.completion && (
        <div className="step-container" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1.5rem', color: '#2c5aa0' }}>
            Completion Details
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div>
              <strong style={{ color: '#333' }}>Completed At:</strong>
              <div style={{ marginTop: '0.25rem' }}>{formatDate(submission.completion.completedAt)}</div>
            </div>
            <div>
              <strong style={{ color: '#333' }}>Estimated Wait Time:</strong>
              <div style={{ marginTop: '0.25rem' }}>{submission.completion.estimatedWaitTime || 'Not specified'}</div>
            </div>
            <div>
              <strong style={{ color: '#333' }}>Confirmation Sent:</strong>
              <div style={{ marginTop: '0.25rem' }}>{submission.completion.confirmationSent ? 'Yes' : 'No'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDetailView;