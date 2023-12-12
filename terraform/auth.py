import os
import argparse

parser = argparse.ArgumentParser(description='Applies the tf changes')
parser.add_argument('--env', type=str, required=True, help='The target environment to initialize')
args = parser.parse_args()

# figure out which env file to parse
path = f"./src/{args.env}/terraform.tfvars"

# extract the projectId for the right environment
projectId = None
with open(path, 'r') as file:
    for line in file.readlines():
        if line:
            k,v = line.split("=")
            if k.strip() == "projectId":
                projectId = v.strip()

if projectId:
    os.system("gcloud auth application-default login")
else:
    print(f"[ERROR]: Unable to find project id for given env in this path: {path}")


