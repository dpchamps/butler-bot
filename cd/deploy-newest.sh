set -euxo pipefail

CONTAINER=$(docker ps -a | awk -v image=$IMAGE '$2==image { print $1 }')
docker pull $IMAGE
docker stop $CONTAINER
docker run -e DEBUG=0 --env-file .production.env -d --rm $IMAGE
