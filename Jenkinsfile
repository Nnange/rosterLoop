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

        stage('Test') {
            steps {
                // Run tests before building the images so a failing test blocks
                // the build and deploy.
                dir(FRONTEND_DIR) {
                    sh 'npm ci'
                    sh 'npm run test:run -- --reporter=default --reporter=junit --outputFile=test-results/vitest-junit.xml'
                }
                dir(BACKEND_DIR) {
                    // Unit tests only. RosterloopApplicationTests is a @SpringBootTest
                    // that boots the full context (needs a DB), so it is excluded here.
                    sh "mvn test -Dtest='!RosterloopApplicationTests'"
                }
            }
            post {
                // Publish results now, before the Build Backend stage's `mvn clean`
                // wipes target/surefire-reports.
                always {
                    junit allowEmptyResults: true, testResults: "${FRONTEND_DIR}/test-results/*.xml, ${BACKEND_DIR}/target/surefire-reports/*.xml"
                }
            }
        }

        stage('Frontend Build') {
            steps {
                dir(FRONTEND_DIR) {
                    script {
                        def apiUrls = [
                            local: 'http://localhost:9092/rosterloop/api',
                            dev  : 'http://192.168.178.36:9092/rosterloop/api',
                            prod : 'https://rosterloopapi.awongnnange.com/rosterloop/api'
                        ]
                        def apiUrl = apiUrls[params.PROFILE] ?: apiUrls['dev']

                        // node_modules is installed in the Test stage (same workspace).
                        sh 'npm run build'
                        sh "docker build --build-arg NEXT_PUBLIC_API_URL=${apiUrl} -t rosterloop-frontend:${IMAGE_TAG} -t ${FRONTEND_IMAGE} ."
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
