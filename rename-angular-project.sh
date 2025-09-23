#!/bin/bash
set -e

if [ -z "$1" ]; then
  echo "❌ Uso: ./rename-angular-project.sh <novo-nome>"
  exit 1
fi

NEW_NAME=$1
GENERIC_NAME="\[name-generic\]"
NEW_NAME_UNDERSCORE=$(echo "$NEW_NAME" | tr '-' '_')

echo "🚀 Renomeando projeto para: $NEW_NAME"

# Arquivos principais
FILES=("angular.json" "package.json" "nx.json" "tsconfig.json")

for FILE in "${FILES[@]}"; do
  if [ -f "$FILE" ]; then
    echo "📝 Atualizando $FILE..."
    sed -i "s/$GENERIC_NAME/$NEW_NAME/g" "$FILE"
  fi
done

# Substitui [name-generic] no webpack.config.js usando "_" em vez de "-"
if [ -f webpack.config.js ]; then
  echo "📝 Atualizando webpack.config.js (usando underscores)..."
  sed -i "s/$GENERIC_NAME/$NEW_NAME_UNDERSCORE/g" webpack.config.js
fi

# Pasta src/app (caso exista algo com [name-generic])
if [ -d "src/app" ]; then
  find src/app -type f -exec sed -i "s/$GENERIC_NAME/$NEW_NAME/g" {} +
fi

# Renomear diretórios que usam [name-generic]
if [ -d "projects/[name-generic]" ]; then
  echo "📂 Renomeando pasta projects/[name-generic] para projects/$NEW_NAME"
  mv "projects/[name-generic]" "projects/$NEW_NAME"
fi

# Ajustar imports que referenciem [name-generic]
grep -rl "\[name-generic\]" . | while read -r file; do
  echo "🔍 Corrigindo import em $file"
  sed -i "s/$GENERIC_NAME/$NEW_NAME/g" "$file"
done

echo "✅ Projeto renomeado com sucesso para $NEW_NAME!"
