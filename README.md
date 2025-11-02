## Development Workflow

- Build the backend once with `mvn clean package` (or `mvn -pl backend/<service> package` for a single module).
- Start infrastructure and any containerized services without rebuilding images:
  - Default: `docker compose up rabbitmq`
  - Supabase connection details live in `.env`; update `SUPABASE_*` entries if the credentials rotate.
  - Add additional services (discovery, gateway, etc.) with `docker compose up <service-name>` after jars are built.
- When running a service directly (e.g. via `spring-boot:run`), export the matching environment variables (`APP_JWT_SECRET`, `SUPABASE_HOST`, `SUPABASE_PORT`, `SUPABASE_DB`, `SUPABASE_USERNAME`, `SUPABASE_PASSWORD`, `MAIL_*`) or source the provided `.env` file so the configuration matches the container setup.
- Run the Spring Boot service you are editing directly on the host for proper hot reload: `mvn -pl backend/<service> spring-boot:run -am`.
- All services now include `spring-boot-devtools`; changes trigger fast restarts when run with `spring-boot:run`.
