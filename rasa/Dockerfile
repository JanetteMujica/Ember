FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY . .

EXPOSE 5005

CMD ["rasa", "run", "--enable-api", "--cors", "*"]