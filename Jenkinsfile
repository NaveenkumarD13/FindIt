
pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'naveenkumar31/findit:1.0'
        DOCKER_EXE = 'C:\\Users\\VIGNESH\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
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
                bat '"%DOCKER_EXE%" build -t %DOCKER_IMAGE% .'
            }
        }

        stage('Login to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-cred',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    bat '''
                        @echo off
                        echo %DOCKER_PASS% | "%DOCKER_EXE%" login -u %DOCKER_USER% --password-stdin
                    '''
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                bat '"%DOCKER_EXE%" push %DOCKER_IMAGE%'
            }
        }

        stage('Build Successful') {
            steps {
                echo 'FindIt image built and pushed successfully.'
            }
        }
    }
}
