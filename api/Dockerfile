FROM python:latest as development
WORKDIR /code
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt
COPY api/ api/
ENV FLASK_APP='api.app:create_app("api.config.DevelopmentConfig")'
ENV FLASK_DEBUG=True
ENV FLASK_PORT=5000
EXPOSE 5000
CMD flask run --host=0.0.0.0