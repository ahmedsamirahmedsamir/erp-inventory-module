#!/bin/bash
set -e

echo "Building Inventory Module Plugin..."

case "$(uname -s)" in
    Linux*)     EXT=".so";;
    Darwin*)    EXT=".dylib";;
    MINGW*|MSYS*|CYGWIN*) EXT=".dll";;
    *)          EXT=".so";;
esac

cd handlers
go build -buildmode=plugin -o ../inventory${EXT} *.go
echo "✓ Plugin built successfully: inventory${EXT}"

