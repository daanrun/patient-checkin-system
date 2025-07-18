# Patient Check-in System

A comprehensive web-based patient check-in system that allows patients to complete their appointment check-in process digitally and provides healthcare staff with an admin interface to manage submissions.

## Features

### Patient Interface
- **Multi-step Form Process**: Demographics → Insurance → Clinical Forms → Confirmation
- **Progress Tracking**: Visual progress bar showing current step and completion status
- **Form Validation**: Client-side and server-side validation with clear error messages
- **File Upload**: Support for insurance card image uploads (JPG, PNG, PDF)
- **Responsive Design**: Mobile-friendly interface that works on all devices
- **Data Persistence**: Form data is preserved when navigating between steps

### Admin Interface
- **Submission Management**: View all patient check-in submissions
- **Advanced Filtering**: Search by patient name, date range, and completion status
- **Detailed View**: Complete patient information including uploaded files
- **Mobile Responsive**: Admin interface optimized for mobile devices

### Security Features
- **HTTPS Support**: SSL/TLS encryption for production environments
- **Input Sanitization**: Protection against XSS and injection attacks
- **Rate Limiting**: Protection against abuse and DoS attacks
- **Security Headers**: Comprehensive security headers including CSP
- **Audit Logging**: Complete logging of form submissions and access

## Technology Stack

- **Frontend**: React.js with React Router
- **Backend**: Node.js with Express.js
- **Database**: SQLite for simplicity and portability
- **File Storage**: Local file system with security controls
- **Styling**: Custom CSS with responsive design

## Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

## Installation

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd patient-checkin-system
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```
   This command installs dependencies for the root project, frontend, and backend.

## Development Setup

### Quick Start (Recommended)
Run both frontend and backend simultaneously:
```bash
npm run dev
```

This starts:
- Backend server on http://localhost:5001
- Frontend development server on http://localhost:5173

### Individual Services
If you prefer to run services separately:

**Backend only:**
```bash
npm run dev:backend
```

**Frontend only:**
```bash
npm run dev:frontend
```

## Production Setup

### 1. Build the Frontend
```bash
npm run build
```

### 2. SSL Certificate Setup (Optional but Recommended)
For HTTPS support in production:

1. Generate SSL certificates:
   ```bash
   cd backend/ssl
   ./generate-cert.sh
   ```

2. Or place your own certificates:
   - `backend/ssl/private-key.pem`
   - `backend/ssl/certificate.pem`

### 3. Environment Configuration
Create environment variables for production:

```bash
export NODE_ENV=production
export PORT=5001
export HTTPS_PORT=5443
export ALLOWED_ORIGINS=https://yourdomain.com
```

### 4. Start Production Server
```bash
cd backend
npm start
```

## Usage

### Patient Check-in Flow

1. **Access the Application**
   - Open http://localhost:5173 (development) or your production URL
   - The system automatically redirects to the demographics step

2. **Complete Demographics**
   - Fill in personal information (name, DOB, address, phone, email)
   - All fields are required and validated

3. **Provide Insurance Information**
   - Enter insurance details (provider, policy number, group number)
   - Upload insurance card images (optional but recommended)

4. **Fill Clinical Forms**
   - Complete medical questionnaire
   - Provide information about medical history, medications, allergies, and current symptoms

5. **Review and Confirm**
   - Review all submitted information
   - Receive confirmation and next steps

### Admin Interface

1. **Access Admin Dashboard**
   - Navigate to http://localhost:5173/admin
   - View all patient submissions

2. **Filter and Search**
   - Search by patient name
   - Filter by date range
   - Filter by completion status

3. **View Submission Details**
   - Click "View Details" on any submission
   - See complete patient information
   - View uploaded insurance card images

## API Endpoints

### Patient Endpoints
- `GET /api/health` - Health check
- `POST /api/patients` - Submit demographics (not implemented - returns 501)
- `POST /api/insurance` - Submit insurance information
- `POST /api/clinical-forms` - Submit clinical forms
- `POST /api/completion` - Mark check-in as complete

### Admin Endpoints
- `GET /api/admin/submissions` - List all submissions with filtering
- `GET /api/admin/submissions/:id` - Get detailed submission information

## Testing

### End-to-End Integration Testing
Run the comprehensive test suite:
```bash
node test-end-to-end-integration.js
```

This test covers:
- Complete patient check-in flow
- Admin interface functionality
- Error handling and validation
- Security headers and measures

### Manual Testing
1. Start the development servers
2. Complete a full patient check-in flow
3. Verify data appears in admin interface
4. Test mobile responsiveness by resizing browser
5. Test error scenarios (invalid data, network issues)

## File Structure

```
patient-checkin-system/
├── backend/
│   ├── database/          # Database setup and models
│   ├── middleware/        # Express middleware
│   ├── models/           # Data models
│   ├── routes/           # API route handlers
│   ├── ssl/              # SSL certificates
│   ├── uploads/          # Uploaded files storage
│   ├── utils/            # Utility functions
│   └── server.js         # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── contexts/     # React contexts
│   │   └── App.jsx       # Main app component
│   └── dist/             # Built frontend files
├── test-*.js             # Test files
└── README.md             # This file
```

## Security Considerations

### Data Protection
- All patient data is stored locally in SQLite database
- File uploads are stored in secure directory with access controls
- Input sanitization prevents XSS and injection attacks

### Network Security
- HTTPS support for encrypted communication
- CORS configuration restricts cross-origin requests
- Rate limiting prevents abuse

### Compliance Notes
- System designed with HIPAA considerations in mind
- Audit logging for all form submissions
- Secure file handling for sensitive documents

## Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Kill process using port 5001
lsof -ti:5001 | xargs kill -9

# Or use different port
PORT=5002 npm run dev:backend
```

**Database Issues**
```bash
# Reset database
rm backend/database/patient_checkin.db
# Restart backend to recreate
```

**SSL Certificate Issues**
```bash
# Regenerate certificates
cd backend/ssl
rm *.pem
./generate-cert.sh
```

**Frontend Build Issues**
```bash
# Clear node_modules and reinstall
rm -rf frontend/node_modules
cd frontend && npm install
```

### Performance Optimization

**Database**
- SQLite is suitable for small to medium deployments
- For high-volume usage, consider PostgreSQL or MySQL

**File Storage**
- Local storage is suitable for development
- For production, consider cloud storage (AWS S3, etc.)

**Caching**
- Add Redis for session management in production
- Implement CDN for static assets

## Contributing

1. Follow existing code style and patterns
2. Add tests for new functionality
3. Update documentation for any changes
4. Ensure mobile responsiveness for UI changes

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the test files for usage examples
3. Check browser console for client-side errors
4. Check server logs for backend issues

## Changelog

### Version 1.0.0
- Initial release with complete patient check-in flow
- Admin interface for submission management
- Mobile responsive design
- Security features and audit logging
- Comprehensive testing suite