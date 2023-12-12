import os
import argparse

parser = argparse.ArgumentParser(description='creats the planned changes')
parser.add_argument('--env', type=str, required=True, help='The target environment to initialize')
args = parser.parse_args()

# create the folder to hold the plans for the given enviornment
directory = f"./plans/{args.env}"
if not os.path.exists(directory):
    os.makedirs(directory)

os.system(f"""
    cd ./src && terraform plan -out "../plans/{args.env}/planfile" -var-file="./{args.env}/terraform.tfvars"
""")
