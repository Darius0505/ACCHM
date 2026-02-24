#!/bin/bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"code": "ADMIN_01", "password": "admin123"}' | grep -o '"token":"[^"]*' | cut -d '"' -f 4)
echo "Token: $TOKEN"
echo "--- ROLES ---"
curl -s -H "Cookie: token=$TOKEN" http://localhost:3000/api/roles
echo -e "\n--- BRANCHES ---"
curl -s -H "Cookie: token=$TOKEN" http://localhost:3000/api/branches
echo -e "\n--- DEPT ---"
curl -s -H "Cookie: token=$TOKEN" http://localhost:3000/api/departments
