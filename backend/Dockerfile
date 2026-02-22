FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for image processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx libglib2.0-0 && \
    rm -rf /var/lib/apt/lists/*

# Install PyTorch (CPU for Docker — Mac Studio uses native MPS outside Docker)
RUN pip install --no-cache-dir torch==2.5.1+cpu --index-url https://download.pytorch.org/whl/cpu

# Install remaining dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Pre-download ALL models at build time (cached in Docker layer)
# This avoids 60+ second cold start on first request
RUN python -c "\
from app.services.text_detector import load_all_models; \
load_all_models(); \
print('Text models loaded.'); \
from app.services.image_detector import load_all_image_models; \
load_all_image_models(); \
print('Image models loaded.'); \
print('All 9 models cached successfully.')"

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
