#!/bin/bash

# Kiểm tra xem Docker có đang chạy không
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker chưa được bật hoặc chưa cài đặt."
  echo "👉 Vui lòng cài Docker Desktop for Mac trước: https://www.docker.com/products/docker-desktop/"
  exit 1
fi

echo "🚀 Đang khởi động MS SQL Server (Azure SQL Edge) trên Docker..."

# Tên container
CONTAINER_NAME="acchm-sql"
PASSWORD="yourStrong(!)Password"

# Kiểm tra container đã tồn tại chưa
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
    if [ "$(docker ps -aq -f status=exited -f name=$CONTAINER_NAME)" ]; then
        # Container tồn tại nhưng đang stop -> start lại
        echo "🔄 Container $CONTAINER_NAME đã tồn tại, đang start lại..."
        docker start $CONTAINER_NAME
    else
        echo "✅ Container $CONTAINER_NAME đang chạy."
    fi
else
    # Container chưa tồn tại -> run mới
    # Sử dụng image mcr.microsoft.com/azure-sql-edge (Tối ưu cho chip M1/M2/M3)
    echo "🆕 Đang tạo container mới..."
    docker run --cap-add SYS_PTRACE -e 'ACCEPT_EULA=1' -e "MSSQL_SA_PASSWORD=$PASSWORD" -p 1433:1433 --name $CONTAINER_NAME -d mcr.microsoft.com/azure-sql-edge
fi

echo "⏳ Đang đợi Database khởi động (10s)..."
sleep 10

echo "✅ MS SQL Server đã sẵn sàng!"
echo "🔌 Connection String (đã có trong .env.example):"
echo "   sqlserver://localhost:1433;database=acchm;user=sa;password=$PASSWORD;encrypt=true;trustServerCertificate=true"
echo ""
echo "👉 Bạn có thể dùng Azure Data Studio hoặc DBeaver để kết nối."
