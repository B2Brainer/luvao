FROM python:3.11-slim

# Evita que Python genere archivos .pyc y asegura logs en consola
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Copiar dependencias
COPY requirements.txt .

# 🔧 Instalar dependencias del sistema necesarias para Prisma + Node
RUN apt-get update && apt-get install -y \
    libatomic1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Instalar dependencias Python
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copiar el código fuente y configuración de Prisma
COPY src/ src/
COPY prisma/ prisma/

# 🔧 Generar el cliente de Prisma dentro del contenedor
RUN python -m prisma generate

# Exponer el puerto
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["uvicorn", "src.app:app", "--host", "0.0.0.0", "--port", "3000", "--reload"]



