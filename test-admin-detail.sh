#!/bin/bash

echo "🧪 Testing Admin Detail View API..."

# Test getting list of submissions
echo "📋 Testing submissions list..."
SUBMISSIONS=$(curl -s "http://localhost:5001/api/admin/submissions")
echo "✅ Submissions list retrieved"

# Extract first submission ID (assuming JSON format)
FIRST_ID=$(echo "$SUBMISSIONS" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')

if [ -n "$FIRST_ID" ]; then
    echo "🔍 Testing detail view for submission ID: $FIRST_ID"
    
    # Test getting detail for first submission
    DETAIL=$(curl -s "http://localhost:5001/api/admin/submissions/$FIRST_ID")
    
    if echo "$DETAIL" | grep -q '"message":"Submission details retrieved successfully"'; then
        echo "✅ Detail view API working correctly"
        
        # Extract some key information
        FIRST_NAME=$(echo "$DETAIL" | grep -o '"firstName":"[^"]*"' | cut -d'"' -f4)
        LAST_NAME=$(echo "$DETAIL" | grep -o '"lastName":"[^"]*"' | cut -d'"' -f4)
        STATUS=$(echo "$DETAIL" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
        
        echo "   Patient: $FIRST_NAME $LAST_NAME"
        echo "   Status: $STATUS"
        
        # Check for insurance data
        if echo "$DETAIL" | grep -q '"insurance":{'; then
            echo "   Has Insurance: Yes"
        else
            echo "   Has Insurance: No"
        fi
        
        # Check for clinical forms data
        if echo "$DETAIL" | grep -q '"clinicalForms":{'; then
            echo "   Has Clinical Forms: Yes"
        else
            echo "   Has Clinical Forms: No"
        fi
        
    else
        echo "❌ Detail view API not working correctly"
        exit 1
    fi
else
    echo "⚠️  No submissions found to test with"
fi

# Test error handling
echo "🚫 Testing error handling..."
ERROR_RESPONSE=$(curl -s "http://localhost:5001/api/admin/submissions/999")

if echo "$ERROR_RESPONSE" | grep -q '"error":"Submission not found"'; then
    echo "✅ Error handling working correctly"
else
    echo "❌ Error handling not working as expected"
    exit 1
fi

echo "🎉 All API tests passed!"