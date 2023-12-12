import os
import shutil
import argparse

parser = argparse.ArgumentParser(description='uploads files to google storage')
parser.add_argument('--bucket', type=str, required=True, help='The target buckt upload files to')
parser.add_argument('--dir', type=str, required=True, help='The target directory upload files from')
args = parser.parse_args()

# clear previous build contents
shutil.rmtree(args.dir)

# rebuild the app
os.system(f"cd .. && yarn build")

# empty the cloud bucket 
os.system(f"gsutil -m rm -r gs://{args.bucket}/*")

# upload files to the cloud bucket
os.system(f"gsutil -m cp -r {args.dir}/* gs://{args.bucket}/")

