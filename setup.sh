#!/bin/bash

# copy .env.local.example to .env.local
cp .env.local.example .env.local

# prompt user to enter OpenAI API key
echo "Please enter your OpenAI API key:"
read openai_key

# Determine the operating system and run the appropriate sed command
if [[ "$(uname)" == "Darwin" ]]; then
    # MacOS
    sed -i '' "s|OPENAI_API_KEY=|OPENAI_API_KEY=$openai_key|" .env.local
else
    # Linux/Unix
    sed -i "s|OPENAI_API_KEY=|OPENAI_API_KEY=$openai_key|" .env.local
fi

echo "API key has been set in .env.local file."
