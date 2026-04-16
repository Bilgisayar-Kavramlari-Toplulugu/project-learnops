#!/bin/bash

# ── Usage ─────────────────────────────────────────────────────────────────────
#
#   Encrypt .env → .env.age   (run from the directory containing .env):
#     ./encrypt-env-file.sh
#
#   Decrypt .env.age → .env   (run from the directory containing .env.age):
#     ./encrypt-env-file.sh decrypt
#
#   Requirements:
#     - 'age' must be installed  (macOS: brew install age | Windows: winget install FiloSottile.age)
#     - Your SSH public key must be registered as a recipient to decrypt
#
#   To add or remove recipients:
#     Edit the RECIPIENTS list near the top of this script
#
# ─────────────────────────────────────────────────────────────────────────────

# ── Recipients ───────────────────────────────────────────────────────────────
# Add or remove GitHub usernames here to manage encryption recipients
RECIPIENTS=(
    flovearth
    Shamsiaa
    lerkush
    slymanmrcan
    karalarmehmet
    ferhatabik
    ysfcc
    maliuyanik
    demirgulsen
    muhammedcagrikurt
    belmuh
    ErtanSidar
    ismailaricioglu
    replakcan
    svenes25
    anenthusiastic
)
# ─────────────────────────────────────────────────────────────────────────────

# ── Check if age is installed ─────────────────────────────────────────────────
if ! command -v age &> /dev/null; then
    echo "✗ 'age' is not installed. Install it first:"
    echo ""
    echo "  macOS:   brew install age"
    echo ""
    echo "  Windows: winget install FiloSottile.age"
    echo "           (or download from https://github.com/FiloSottile/age/releases)"
    echo ""
    exit 1
fi
# ─────────────────────────────────────────────────────────────────────────────

# ── Decrypt mode ─────────────────────────────────────────────────────────────
if [ "${1}" = "decrypt" ]; then
    if [ ! -f .env.age ]; then
        echo "✗ .env.age not found in current directory"
        exit 1
    fi

    # Find default SSH private key
    SSH_KEY="${HOME}/.ssh/id_ed25519"
    if [ ! -f "${SSH_KEY}" ]; then
        SSH_KEY="${HOME}/.ssh/id_rsa"
    fi
    if [ ! -f "${SSH_KEY}" ]; then
        echo "✗ No SSH private key found at ~/.ssh/id_ed25519 or ~/.ssh/id_rsa"
        echo "  Specify a key manually: age -d -i /path/to/key .env.age > .env"
        exit 1
    fi

    echo "Decrypting .env.age → .env using ${SSH_KEY}..."
    age -d -i "${SSH_KEY}" .env.age > .env

    if [ $? -eq 0 ]; then
        echo "✓ Successfully decrypted .env.age → .env"
    else
        echo "✗ Decryption failed. Make sure your SSH key is one of the registered recipients."
        rm -f .env
        exit 1
    fi
    exit 0
fi
# ─────────────────────────────────────────────────────────────────────────────

# ── Encrypt mode (default) ────────────────────────────────────────────────────
if [ ! -f .env ]; then
    echo "✗ .env not found in current directory"
    exit 1
fi

echo "Fetching SSH keys from GitHub and encrypting .env..."

(for user in "${RECIPIENTS[@]}"; do
    curl -s "https://github.com/${user}.keys"
done) | \
 age -R - .env > .env.age

if [ $? -eq 0 ]; then
    echo "✓ Successfully encrypted .env → .env.age"
else
    echo "✗ Encryption failed"
    rm -f .env.age
    exit 1
fi
