set -euxo pipefail

docker ps -a
docker kill $(docker ps -a | awk '$2=="$IMAGE" { print $1 }')
docker run -e DEBUG=0 --env-file .production.env -d --rm $IMAGE
