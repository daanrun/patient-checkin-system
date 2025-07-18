import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../utils/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (search.trim()) params.append('search', search.trim());
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      if (statusFilter) params.append('status', statusFilter);

      const response = await apiCall(`/admin/submissions?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }

      const result = await response.json();
      setSubmissions(result.data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [search, dateFrom, dateTo, statusFilter]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status) => {
    if (status === 'completed') {
      return 'status-completed';
    } else {
      return 'status-incomplete';
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <div style={{ fontSize: '1.1rem' }}>Loading submissions...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage patient check-in submissions</p>
      </div>

      {/* Filters */}
      <div className="step-container" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1.5rem' }}>Filters</h2>
        <div className="filters-grid">
          <div className="form-group">
            <label htmlFor="search">Search Patient Name</label>
            <input
              type="text"
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Enter patient name..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="dateFrom">From Date</label>
            <input
              type="date"
              id="dateFrom"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="dateTo">To Date</label>
            <input
              type="date"
              id="dateTo"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="incomplete">Incomplete</option>
            </select>
          </div>
        </div>
        
        <div style={{ marginTop: '1rem' }}>
          <button
            onClick={() => {
              setSearch('');
              setDateFrom('');
              setDateTo('');
              setStatusFilter('');
            }}
            className="btn btn-secondary"
            style={{ fontSize: '0.9rem' }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="submit-error" style={{ marginBottom: '2rem' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Submissions Table */}
      <div className="step-container">
        <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e9ecef' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '600' }}>
            Form Submissions ({submissions.length})
          </h2>
        </div>
        
        {submissions.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
            No submissions found matching your criteria.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="submissions-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Submitted At</th>
                  <th>Status</th>
                  <th>Completed At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr key={submission.id}>
                    <td data-label="Patient Name">
                      <div style={{ fontWeight: '500' }}>
                        {submission.patientName}
                      </div>
                    </td>
                    <td data-label="Email">{submission.email}</td>
                    <td data-label="Phone">{submission.phone}</td>
                    <td data-label="Submitted At">
                      {formatDate(submission.submittedAt)}
                    </td>
                    <td data-label="Status">
                      <span className={`status-badge ${getStatusBadge(submission.status)}`}>
                        {submission.status}
                      </span>
                    </td>
                    <td data-label="Completed At">
                      {formatDate(submission.completedAt)}
                    </td>
                    <td data-label="Actions">
                      <button
                        onClick={() => navigate(`/admin/submissions/${submission.id}`)}
                        className="view-details-btn"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;