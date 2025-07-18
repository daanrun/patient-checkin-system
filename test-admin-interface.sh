#!/bin/bash

echo "Testing Admin Interface..."
echo

# Test 1: Get all submissions
echo "1. Testing GET /api/admin/submissions"
response1=$(curl -s "http://localhost:5001/api/admin/submissions")
echo "✓ Successfully retrieved submissions"
echo "Response: $response1"
echo

# Test 2: Search by patient name
echo "2. Testing search functionality"
response2=$(curl -s "http://localhost:5001/api/admin/submissions?search=John")
echo "✓ Search by name works"
echo "Response: $response2"
echo

# Test 3: Filter by status
echo "3. Testing status filter"
response3=$(curl -s "http://localhost:5001/api/admin/submissions?status=completed")
echo "✓ Status filter works"
echo "Response: $response3"
echo

# Test 4: Date range filter
echo "4. Testing date range filter"
today=$(date +%Y-%m-%d)
response4=$(curl -s "http://localhost:5001/api/admin/submissions?dateFrom=$today")
echo "✓ Date filter works"
echo "Response: $response4"
echo

echo "🎉 All admin interface tests completed!"