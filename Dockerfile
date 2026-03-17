# Dockerfile for Brain Age Prediction Backend
# Build and run:
#   docker build -t brain-age-api:latest .
#   docker run -p 5000:5000 brain-age-api:latest

FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (for layer caching)
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir gunicorn

# Copy backend code
COPY backend/ ./

# Copy model directory (if exists)
COPY model/ ../model/

# Create necessary directories
RUN mkdir -p uploads heatmaps logs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Run with gunicorn for production
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "--timeout", "60", "--access-logfile", "-", "--error-logfile", "-", "app:app"]
