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

        // Stage 1: Checkout source code from GitHub
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // Stage 2: Verify Docker and Kubernetes
        stage('Verify Tools and Kubernetes') {
            steps {
                bat '"%DOCKER_EXE%" version'

                bat '"%KUBECTL_EXE%" config current-context'

                bat '"%KUBECTL_EXE%" get nodes'
            }
        }

        // Stage 3: Install dependencies and build the React application
        stage('Install and Build') {
            steps {
                bat 'npm ci'

                bat 'npm run build'
            }
        }

        // Stage 4: Build Docker images
        stage('Build Docker Image') {
            steps {
                bat '"%DOCKER_EXE%" build -t %DOCKER_IMAGE%:build-%BUILD_NUMBER% -t %DOCKER_IMAGE%:1.0 .'
            }
        }

        // Stage 5: Log in to Docker Hub and push both image tags
        stage('Login and Push Docker Image') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-cred',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    powershell '''
                        $ErrorActionPreference = "Stop"

                        $docker = $env:DOCKER_EXE

                        if ([string]::IsNullOrWhiteSpace($env:DOCKER_USER)) {
                            throw "Docker Hub username is empty."
                        }

                        if ([string]::IsNullOrWhiteSpace($env:DOCKER_PASS)) {
                            throw "Docker Hub token is empty."
                        }

                        Write-Output "Docker Hub username: $env:DOCKER_USER"
                        Write-Output "Docker Hub token is available."
                        Write-Output "Logging in to Docker Hub..."

                        # Create an isolated temporary docker config folder to avoid Windows credential helper conflicts
                        $tempConfig = "$env:WORKSPACE\\.docker"
                        if (!(Test-Path $tempConfig)) { New-Item -ItemType Directory -Force -Path $tempConfig | Out-Null }

                        $env:DOCKER_PASS |
                            & $docker --config $tempConfig login `
                                --username $env:DOCKER_USER `
                                --password-stdin

                        if ($LASTEXITCODE -ne 0) {
                            throw "Docker Hub login failed. Verify the Jenkins credential."
                        }

                        Write-Output "Docker Hub login successful."

                        $buildTag = "$($env:DOCKER_IMAGE):build-$($env:BUILD_NUMBER)"
                        $stableTag = "$($env:DOCKER_IMAGE):1.0"

                        Write-Output "Pushing build image..."

                        & $docker --config $tempConfig push $buildTag

                        if ($LASTEXITCODE -ne 0) {
                            throw "Failed to push the build image."
                        }

                        Write-Output "Pushing version 1.0..."

                        & $docker --config $tempConfig push $stableTag

                        if ($LASTEXITCODE -ne 0) {
                            throw "Failed to push image version 1.0."
                        }

                        Write-Output "Both Docker images pushed successfully."
                    '''
                }
            }
        }

        // Stage 6: Deploy the application to Kubernetes
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
            echo 'FindIt CI/CD completed successfully!'
            echo 'Docker image pushed and Kubernetes deployment verified.'
        }

        failure {
            echo 'FindIt pipeline failed.'
            echo 'Check the first failed stage in the Jenkins console output.'
        }

        always {
            echo 'FindIt CI/CD pipeline execution finished.'
        }
    }
}