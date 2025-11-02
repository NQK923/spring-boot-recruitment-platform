## Development Workflow

- Build the backend once with `mvn clean package` (or `mvn -pl backend/<service> package` for a single module).
- Start infrastructure and any containerized services without rebuilding images:
  - Default: `docker compose -f docker-compose.dev.yml up rabbitmq`
  - Supabase connection details live in `.env`; update `SUPABASE_*` entries if the credentials rotate.
  - To run discovery and gateway in containers, build their jars then add them to the command above.
  - To run other services in containers using the pre-built jar layers, append `--profile containerized <service>` (e.g. `docker compose -f docker-compose.dev.yml --profile containerized up auth-service`).
- Run the Spring Boot service you are editing directly on the host for proper hot reload: `mvn -pl backend/<service> spring-boot:run -am`.
- All services now include `spring-boot-devtools`; changes trigger fast restarts when run with `spring-boot:run`.
