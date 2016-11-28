
def publishImageToContainershipApplication(String image, String application, String clusterId) {
    echo "Publishing ${image} to ${application} on cluster[${clusterId}]"
}

node {

    stage 'Preparation' {
        node('docker-slave') {
            echo 'docker slave'
            sh 'ls .'
        }
    }

    stage 'Tests' {
        node('docker-slave') {
            echo 'No tests have been made yet'
            sh 'ls .'
        }
    }

    stage 'Deploy' {
        node('docker-slave') {
            publishImageToContainershipApplication('nicksimage', 'containership.cloud.api', '12345')
            sh 'ls .'
        }
    }

}
