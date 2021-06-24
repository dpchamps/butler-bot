set -euxo pipefail

docker ps -a
docker kill $(docker ps -a | awk '$2=="${{ secrets.DOCKERHUB_USERNAME }}/butler-bot:latest" { print $1 }')
docker run -e DEBUG=0 --env-file .production.env -d --rm ${{ secrets.DOCKERHUB_USERNAME }}/butler-bot:latest
