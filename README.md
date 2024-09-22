# NTUA ECE SAAS 2024 PROJECT - solveMyProblem

## TEAM (51)

## Setup Instructions

Follow these steps to set up the project locally:

### 1. Copy Environment Variables

Rename the sample environment file by copying it:

```bash
cp .env.sample .env.local
```

### 2. Configure Environment Variables

Open the `.env.local` file and fill in the missing variables with the correct values required for your environment.

### 3. Build and Run the Application

Navigate to the source folder and run the following command to build and start the application:

```bash
docker compose up --build
```

### 4. Access the Application

Once the application is running, open your browser and navigate to http://localhost:3000 to view the app.

## Additional Notes

- Ensure you have Docker installed on your machine and running.
- Make sure all microservices are running.
