import os
import argparse

parser = argparse.ArgumentParser(description='Initializes the backend')
parser.add_argument('--env', type=str, required=True, help='The target environment to initialize')
args = parser.parse_args()

os.system(f"""
    cd ./src && terraform init -backend-config="{args.env}/backend.conf" -reconfigure
""")
