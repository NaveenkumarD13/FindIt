
pipeline {
    agent any

    options {
        timestamps()
    }

    environment {
        DOCKER_IMAGE = 'naveenkumar31/findit'
        DOCKER_EXE = 'C:\\Users\\VIGNESH\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe'
        KUBECTL_EXE = 'C:\\Users\\VIGNESH\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\kubectl.exe'
        KUBECONFIG = 'C:\\Users\\VIGNESH\\.kube\\config'
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

        stage('Test Docker Hub Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-cred',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    echo "Docker Hub username received by Jenkins: ${DOCKER_USER}"

                    powershell '''
                        $ErrorActionPreference = "Stop"

                        if ([string]::IsNullOrWhiteSpace($env:DOCKER_PASS)) {
                            Write-Error "Docker Hub token is empty."
                            exit 1
                        }

                        Write-Output "Docker token is present; its value will not be displayed."

                        $env:DOCKER_PASS |
                            & $env:DOCKER_EXE login `
                                --username $env:DOCKER_USER `
                                --password-stdin

                        if ($LASTEXITCODE -ne 0) {
                            exit $LASTEXITCODE
                        }

                        Write-Output "Docker Hub login successful."
                    '''
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-cred',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    echo "Docker Hub username received by Jenkins: ${DOCKER_USER}"

                    powershell '''
                        $ErrorActionPreference = "Stop"

                        if ([string]::IsNullOrWhiteSpace($env:DOCKER_PASS)) {
                            Write-Error "Docker Hub token is empty."
                            exit 1
                        }

                        $env:DOCKER_PASS |
                            & $env:DOCKER_EXE login `
                                --username $env:DOCKER_USER `
                                --password-stdin

                        if ($LASTEXITCODE -ne 0) {
                            exit $LASTEXITCODE
                        }

                        & $env:DOCKER_EXE push "${env:DOCKER_IMAGE}:build-${env:BUILD_NUMBER}"
                        if ($LASTEXITCODE -ne 0) {
                            exit $LASTEXITCODE
                        }

                        & $env:DOCKER_EXE push "${env:DOCKER_IMAGE}:1.0"
                        if ($LASTEXITCODE -ne 0) {
                            exit $LASTEXITCODE
                        }
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
    }
}
