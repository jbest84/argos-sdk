node {
  dir('argos-sdk') {
    stage 'Checkout'
    git branch: "${env.BRANCH_NAME}", url: 'https://github.com/jbest84/argos-sdk.git'

    stage 'npm install'
    bat 'npm install'

    stage 'Build'
    bat 'build\\release.cmd'

    stage 'Archive and Fingerprint'
    step([$class: 'ArtifactArchiver', artifacts: 'deploy/**/*.*', excludes: null, fingerprint: true])
  }
}
