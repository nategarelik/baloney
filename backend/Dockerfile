FROM python:3.11-slim

WORKDIR /app

# Install CPU-only PyTorch first (much smaller than full CUDA build)
RUN pip install --no-cache-dir torch==2.5.1+cpu --index-url https://download.pytorch.org/whl/cpu

# Install remaining dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Pre-download the DeBERTa model at build time (cached in Docker layer)
# This avoids a 30+ second cold start on first request
RUN python -c "from app.services.text_detector import load_model; load_model()"

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
