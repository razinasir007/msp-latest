import os
import argparse

parser = argparse.ArgumentParser(description='Applies the tf changes')
parser.add_argument('--env', type=str, required=True, help='The target environment to initialize')
args = parser.parse_args()

os.system(f"""
    cd ./src && terraform destroy ../plans/{args.env}/planfile"
""")
