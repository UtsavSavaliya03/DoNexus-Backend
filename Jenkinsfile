pipeline {
    agent any

    environment {
        NODE_VERSION = '18.17.0'
    }

    stages {
        stage('Install Node.js (Chocolatey)') {
            steps {
                bat '''
                    choco install nodejs-lts -y
                    node -v
                    npm -v
                '''
            }
        }

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Test') {
            steps {
                bat 'npm test'
            }
        }

        stage('Build') {
            steps {
                bat 'npm run build'
            }
        }
    }

    post {
        always {
            echo 'Build complete.'
        }
    }
}
