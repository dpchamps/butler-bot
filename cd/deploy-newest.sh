set -euxo pipefail

docker stop $(docker ps -a | awk -v image=$IMAGE '$2==image { print $1 }')
docker run -e DEBUG=0 --env-file .production.env -d --rm $IMAGE
