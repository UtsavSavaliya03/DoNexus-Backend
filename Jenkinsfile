pipeline {
    agent any

    environment {
        NODE_ENV = 'development'
    }

    stages {
        stage('Setup Node.js') {
            steps {
                sh '''
                    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
                    sudo apt-get install -y nodejs
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
                sh 'npm install'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint || true' // avoids pipeline failure if lint fails
            }
        }

        stage('Test') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                echo 'Deploying...'
            }
        }
    }

    post {
        always {
            echo 'Pipeline completed.'
        }
        success {
            echo '✅ Success!'
        }
        failure {
            echo '❌ Failed!'
        }
    }
}
