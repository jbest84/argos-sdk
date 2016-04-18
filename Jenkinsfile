node {
  dir('argos-sdk') {
    stage 'Checkout'
    git 'https://github.com/jbest84/argos-sdk.git'

    stage 'npm install'
    bat 'npm install'

    stage 'Build'
    bat 'build\\release.cmd'

    stage 'archive'
    archive 'deploy/**/*.*'
  }
}
