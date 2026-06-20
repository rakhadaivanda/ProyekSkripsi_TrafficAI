FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV TRANSFORMERS_CACHE=/tmp/transformers_cache
ENV HF_HOME=/tmp/hf_home

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create cache directories with proper permissions
RUN mkdir -p /tmp/transformers_cache /tmp/hf_home && \
    chmod -R 777 /tmp/transformers_cache /tmp/hf_home

# Expose port (HF Spaces default: 7860)
EXPOSE 7860

# Run the application with gunicorn for production
CMD ["gunicorn", "--bind", "0.0.0.0:7860", "--timeout", "600", "--workers", "1", "--threads", "2", "app:app"]
