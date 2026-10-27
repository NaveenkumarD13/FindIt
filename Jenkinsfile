pipeline {
    agent any

    options {
        timestamps()
    }

    environment {
        DOCKER_IMAGE = 'naveenkumar31/findit'
        DOCKER_EXE = 'C:\\Users\\VIGNESH\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe'
        KUBECTL_EXE = 'C:\\Users\\VIGNESH\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\kubectl.exe'
        KUBECONFIG = 'C:\\Users\\NAVEEN\\.kube\\config'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify Tools and Kubernetes') {
            steps {
                bat '"%DOCKER_EXE%" version'
                bat '"%KUBECTL_EXE%" config current-context'
                bat '"%KUBECTL_EXE%" get nodes'
            }
        }

        stage('Install and Build') {
            steps {
                bat 'npm ci'
                bat 'npm run build'
            }
        }

        stage('Build Docker Image') {
            steps {
                bat '"%DOCKER_EXE%" build -t %DOCKER_IMAGE%:build-%BUILD_NUMBER% -t %DOCKER_IMAGE%:1.0 .'
            }
        }

        stage('Push Docker Image') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-cred',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    bat '''
                        @echo off
                        echo %DOCKER_PASS% | "%DOCKER_EXE%" login -u %DOCKER_USER% --password-stdin
                        if errorlevel 1 exit /b 1

                        "%DOCKER_EXE%" push %DOCKER_IMAGE%:build-%BUILD_NUMBER%
                        if errorlevel 1 exit /b 1

                        "%DOCKER_EXE%" push %DOCKER_IMAGE%:1.0
                        if errorlevel 1 exit /b 1
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                bat '"%KUBECTL_EXE%" apply -f deployment.yaml'
                bat '"%KUBECTL_EXE%" apply -f service.yaml'

                bat '"%KUBECTL_EXE%" set image deployment/findit findit=%DOCKER_IMAGE%:build-%BUILD_NUMBER%'

                bat '"%KUBECTL_EXE%" rollout status deployment/findit --timeout=180s'
                bat '"%KUBECTL_EXE%" get pods -l app=findit'
                bat '"%KUBECTL_EXE%" get service findit-service'
            }
        }
    }

    post {
        success {
            echo 'FindIt CI/CD completed: image pushed and Kubernetes deployment verified.'
        }
        failure {
            echo 'FindIt pipeline failed. Check the first failed stage in the Jenkins console.'
        }
        always {
            bat(returnStatus: true, script: '"%DOCKER_EXE%" logout')
        }
    }
}