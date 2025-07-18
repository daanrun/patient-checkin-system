#!/bin/bash

# Generate self-signed SSL certificate for development
# This script creates a private key and certificate for HTTPS testing

echo "Generating self-signed SSL certificate for development..."

# Generate private key
openssl genrsa -out private-key.pem 2048

# Generate certificate signing request
openssl req -new -key private-key.pem -out csr.pem -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

# Generate self-signed certificate
openssl x509 -req -days 365 -in csr.pem -signkey private-key.pem -out certificate.pem

# Clean up CSR file
rm csr.pem

echo "SSL certificate generated successfully!"
echo "Files created:"
echo "  - private-key.pem (private key)"
echo "  - certificate.pem (certificate)"
echo ""
echo "Note: This is a self-signed certificate for development only."
echo "For production, use certificates from a trusted Certificate Authority."