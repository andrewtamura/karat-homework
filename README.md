# Karat Financial Technical Challenege

# Local Development Quick Start
Run the API, browser client, Stripe CLI, and other dependancies via the `docker-compose.yml` file. 

## 1. Load your Stripe API key into `dev.env` file. 
```sh
echo "STRIPE_API_KEY = sk_test_***" > dev.env
```

## 2. Start the docker compose project
```sh
docker compose up -d
```

## 3. Access the browser client on port `3000`
If your docker host is accessible via localhost then open `http://localhost:3000`. The API service is proxied to the same port.