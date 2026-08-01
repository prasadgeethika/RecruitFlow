# RecruitFlow — Day 1 status

## Running locally
1. Start PostgreSQL, create `auth_db` in pgAdmin
2. Run eureka-server (port 8761)
3. Run api-gateway (port 8080)
4. Run auth-service (port 8081)

## Working
- Eureka registry
- Gateway routing + JWT validation
- Auth: register, login (JWT issuance)

## Not yet built
- Job, Profile, Application, Interview, Notification services
- React frontend