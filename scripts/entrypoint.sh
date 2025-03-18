#!/bin/sh
set -e

# Flag file to indicate that user/group creation has already run
setup_complete_file="/tmp/pocket-id-portal_setup_complete"

# Check if setup has already been completed
if [ -f "${setup_complete_file}" ]; then
  echo "User and group setup already completed."
  exec su-exec "$PUID:$PGID" "$@"
  exit 0
fi

echo "Creating user and group..."

PUID=${PUID:-100}
PGID=${PGID:-1000}

# Check if the group with PGID exists; if not, create it
if ! getent group pocket-id-portal > /dev/null 2>&1; then
  echo "Creating group pocket-id-portal with GID $PGID"
  addgroup -g "$PGID" pocket-id-portal
else
  echo "Group pocket-id-portal already exists"
fi

# Check if a user with PUID exists; if not, create it
if ! id -u pocket-id-portal > /dev/null 2>&1; then
  if ! getent passwd "$PUID" > /dev/null 2>&1; then
    echo "Creating user pocket-id-portal with UID $PUID and GID $PGID"
    adduser -u "$PUID" -G pocket-id-portal -s /bin/sh -D pocket-id-portal
  else
    # If a user with the PUID already exists, use that user
    existing_user=$(getent passwd "$PUID" | cut -d: -f1)
    echo "Using existing user: $existing_user"
  fi
else
  echo "User pocket-id-portal already exists"
fi

# Change ownership of the /app directory
mkdir -p /app/data
find /app/data \( ! -group "${PGID}" -o ! -user "${PUID}" \) -exec chown "${PUID}:${PGID}" {} +

# Change ownership of /app and /app/data to the mapped user
chown -R "${PUID}:${PGID}" /app
chown -R "${PUID}:${PGID}" /app/data

# Mark setup as complete
touch "${setup_complete_file}"

# Switch to the non-root user
exec su-exec "$PUID:$PGID" "$@"
