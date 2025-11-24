pipeline {
    agent any

    tools {
        jdk 'JDK 21'
        maven "Maven"   // Your Maven configuration
        nodejs "NodeJS" // Your NodeJS configuration
    }

    environment {
        IMAGE_NAME = "rosterloop-frontend"
        CONTAINER_NAME = "rosterloop-frontend-app"
        FRONTEND_DIR = "frontend"
        BACKEND_DIR = "backend"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                dir(FRONTEND_DIR) {
                    script {
                        sh "docker build -t ${IMAGE_NAME}:latest ."
                    }
                }
            }
        }

        stage('Stop Old Container') {
            steps {
                script {
                    sh """
                    if [ \$(docker ps -q -f name=${CONTAINER_NAME}) ]; then
                        docker stop ${CONTAINER_NAME} || true
                        docker rm ${CONTAINER_NAME} || true
                    fi
                    """
                }
            }
        }

        stage('Start New Container') {
            steps {
                script {
                    sh """
                    docker run -d \
                      --name ${CONTAINER_NAME} \
                      -p 3002:80 \
                      ${IMAGE_NAME}:latest
                    """
                }
            }
        }
    }
}
