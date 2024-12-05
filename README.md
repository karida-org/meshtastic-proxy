# Meshtastic Proxy

Proxy Meshtastic MQTT messages and locations to other services.

## Features

- **MQTT Integration**: Connects to an MQTT broker to receive Meshtastic messages.
- **Traccar Integration**: Sends device positions to a Traccar server.
- **FIWARE Integration**: Upserts device entities and telemetry data to a FIWARE Context Broker.
- **Caching**: Caches device data for efficient processing.
- **Logging**: Logs activities and errors with daily rotation.
- More to come...

## Installation

1. Clone the repository:

  ```sh
  git clone git@github.com:Georepublic/meshtastic-proxy.git
  cd meshtastic-proxy
  ```

2. Install dependencies:

  ```sh
  yarn install
  ```

3. Build the project:

  ```sh
  yarn build
  ```

## Usage

1. Create a `.env` file based on the `.env.example` file and fill in the
   necessary configuration values.

2. Start the application:

  ```sh
  yarn start
  ```

## Configuration

Configuration is done via environment variables. Below are the key variables:

- **MQTT Configuration**:
  - `MQTT_CONNECTION`: MQTT broker URL (e.g., `mqtt://localhost:1883`)
  - `MQTT_USERNAME`: MQTT broker username
  - `MQTT_PASSWORD`: MQTT broker password
  - `MQTT_TOPIC`: MQTT topic to subscribe to (e.g., `meshtastic/#`)

- **Traccar Configuration**:
  - `TRACCAR_API_URL`: Traccar API URL (e.g., `http://your.traccar.server:8082`)
  - `TRACCAR_OSMAND_URL`: Traccar OsmAnd endpoint URL (e.g., `http://your.traccar.server:5055`)
  - `TRACCAR_API_TOKEN`: Traccar API token
  - `TRACCAR_ID_PREFIX`: Prefix for Traccar device identifiers (e.g., `msh-`)

- **FIWARE Configuration**:
  - `FIWARE_BROKER`: FIWARE Context Broker URL (e.g., `https://fiware.example.com/orion/v2`)
  - `FIWARE_SERVICE`: FIWARE service (e.g., `tenant_id`)
  - `FIWARE_SERVICE_PATH`: FIWARE service path (e.g., `/`)

- **WSO2 Configuration**:
  - `WSO2_AUTH_URL`: WSO2 OAuth2 token URL (e.g., `https://wso2.example.com/oauth2/token`)
  - `WSO2_CONSUMER_KEY`: WSO2 consumer key
  - `WSO2_CONSUMER_SECRET`: WSO2 consumer secret

- **Database Configuration**:
  - `DUCKDB_PATH`: Path to the DuckDB database file (e.g., `data/meshtastic.db`)

- **Logging Configuration**:
  - `LOG_LEVEL`: Logging level (e.g., `DEBUG`, `INFO`, `WARN`, `ERROR`)

## Development

To start the development server with hot-reloading, use:

  ```sh
  yarn dev
  ```

## Running with Docker

1. Build the Docker image:

  ```sh
  docker build -t meshtastic-proxy .
  ```

2. Run the Docker container:

  ```sh
  docker run --env-file .env \
    -v $(pwd)/data:/app/data \
    -v $(pwd)/logs:/app/logs \
    -p 3000:3000 meshtastic-proxy
  ```

Alternatively, you can use docker-compose:

1. Ensure your `.env` file is set up.
2. Start the services:

  ```sh
  docker-compose up -d
  ```

## License

This project is licensed under the GPL-3.0-or-later - see the [LICENSE](LICENSE) file for details.
