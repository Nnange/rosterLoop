pipeline {
    agent any

    tools {
        jdk 'JDK 21'
        maven "Maven"   // Your Maven configuration
        nodejs "NodeJS" // Your NodeJS configuration
    }

    parameters {
        choice(name: 'PROFILE', choices: ['local', 'dev', 'prod'], description: 'Spring profile to use')
    }

    environment {
        IMAGE_NAME = "rosterloop-frontend"
        CONTAINER_NAME = "rosterloop-frontend-app"
        FRONTEND_DIR = "frontend"
        BACKEND_DIR = "rosterloop"
        FRONTEND_IMAGE = "rosterloop-frontend:latest"
        BACKEND_IMAGE = "rosterloop-backend:latest"

        // This reads the git tag → becomes your app version
        APP_VERSION = sh(
            script: "git describe --tags --abbrev=0 --match 'v*.*.*' 2>/dev/null || echo '0.0.0'",
            returnStdout: true
        ).trim().replace('v', '')

        IMAGE_TAG = "${APP_VERSION}-${BUILD_NUMBER}"
        
        // Optional: show in logs
        FULL_INFO = "Version: ${APP_VERSION} | Build: ${BUILD_NUMBER} | Tag: ${IMAGE_TAG}"

    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Frontend Build') {
            steps {
                dir(FRONTEND_DIR) {
                    script {
                        sh 'npm install'
                        // This creates a symlink so Vite reads the correct .env file
                        // THIS IS THE ONLY CORRECT VERSION
                        // sh "npm run test"
                        sh 'npm run build'
                        sh 'docker build -t rosterloop-frontend:${IMAGE_TAG} -t $FRONTEND_IMAGE .'
                    }
                }
            }
        }

        stage('Build Backend') {
            steps {
                dir(BACKEND_DIR) {
                    //  withCredentials passes sensitive information
                    withCredentials([
                    string(credentialsId: 'DB_PASSWORD', variable: 'SPRING_DATASOURCE_PASSWORD'),
                ]){

                    // Create secrets.properties dynamically
                    sh '''
                        cat > src/main/resources/secrets.properties <<EOF
                        spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}
                        EOF
                    '''
                    sh 'mvn clean'  
                    sh 'mvn package -DskipTests'
                    sh 'docker build -t todo-backend:${IMAGE_TAG} -t ${BACKEND_IMAGE} .'
                    }
                }
            }
        }
    }
}
