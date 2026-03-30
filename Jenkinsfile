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
                        sh 'npm run build'
                        sh 'docker build -t rosterloop-frontend:${IMAGE_TAG} -t $FRONTEND_IMAGE .'
                    }
                }
            }
        }

        stage('Build Backend') {
            steps {
                dir(BACKEND_DIR) {
                    withCredentials([
                        string(credentialsId: 'DB_PASSWORD', variable: 'SPRING_DATASOURCE_PASSWORD'),
                        string(credentialsId: 'Gmail_Password', variable: 'SPRING_MAIL_PASSWORD'),
                        string(credentialsId: 'MAIL_USERNAME', variable: 'SPRING_MAIL_USERNAME'),
                    ]) {
                        // Create secrets.properties dynamically
                        sh '''
                            cat > src/main/resources/secrets.properties <<EOF
                            spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}
                            spring.mail.password=${SPRING_MAIL_PASSWORD}
                            spring.mail.username=${SPRING_MAIL_USERNAME}
                            EOF
                        '''
                        sh 'mvn clean package -DskipTests'
                        sh 'docker build -t rosterloop-backend:${IMAGE_TAG} -t ${BACKEND_IMAGE} .'
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                withCredentials([
                    string(credentialsId: 'DB_PASSWORD', variable: 'SPRING_DATASOURCE_PASSWORD'),
                    string(credentialsId: 'Gmail_Password', variable: 'SPRING_MAIL_PASSWORD'),
                    string(credentialsId: 'MAIL_USERNAME', variable: 'SPRING_MAIL_USERNAME'),
                ]) {
                    script {
                        sh """
                            SPRING_PROFILE=${params.PROFILE} \
                            SPRING_DATASOURCE_PASSWORD=${SPRING_DATASOURCE_PASSWORD} \
                            SPRING_MAIL_PASSWORD=${SPRING_MAIL_PASSWORD} \
                            SPRING_MAIL_USERNAME=${SPRING_MAIL_USERNAME} \
                            docker compose down || true
                        """
                        sh """
                            SPRING_PROFILE=${params.PROFILE} \
                            SPRING_DATASOURCE_PASSWORD=${SPRING_DATASOURCE_PASSWORD} \
                            SPRING_MAIL_PASSWORD=${SPRING_MAIL_PASSWORD} \
                            SPRING_MAIL_USERNAME=${SPRING_MAIL_USERNAME} \
                            docker compose up -d
                        """
                    }
                }
            }
        }
    }

    post {
        success {
            echo "✅ Deployment successful! Version: ${IMAGE_TAG}"
        }
        failure {
            echo "❌ Build/Deployment failed! Version: ${IMAGE_TAG}"
        }
        always {
            cleanWs(cleanWhenNotBuilt: false)
        }
    }
}
