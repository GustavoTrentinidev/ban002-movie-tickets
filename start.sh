#!/bin/bash

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== Verificando Ambiente Docker ===${NC}"

install_docker() {
    echo -e "${BLUE}Tentando instalar Docker...${NC}"
    sudo apt-get update
    sudo apt-get install -y docker.io docker-compose-v2

    sudo systemctl start docker
    sudo systemctl enable docker
    echo -e "${GREEN}Instalação concluída.${NC}"
}

if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker não encontrado.${NC}"
    install_docker
else
    echo -e "${GREEN}✔ Docker detectado.${NC}"
fi

if ! docker compose version &> /dev/null; then
    echo -e "${RED}Docker Compose V2 não encontrado. Instalando plugin...${NC}"
    sudo apt-get update && sudo apt-get install -y docker-compose-plugin
else
    echo -e "${GREEN}✔ Docker Compose detectado.${NC}"
fi

echo -e "${BLUE}=== Subindo a Aplicação ===${NC}"
sudo docker compose -f composes/docker-compose.yml up -d

echo -e "${GREEN}=== Processo finalizado! ===${NC}"
echo -e "Acesse a aplicação em http://localhost:3000"
