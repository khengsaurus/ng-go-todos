import os
import boto3
from dotenv import load_dotenv

load_dotenv()

REGION = os.getenv("AWS_REGION")
BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")

BUCKET_CONFIG = {'LocationConstraint': REGION}
BUCKET_CORS_CONFIG = {
    "CORSRules": [
        {
            "AllowedHeaders": ["*"],
            "AllowedOrigins": ["*"],
            "AllowedMethods": ["HEAD", "GET", "POST", "PUT", "PATCH", "DELETE"],
            "ExposeHeaders": ["ETag"],
            "MaxAgeSeconds": 86400
        }
    ]
}


def main():
    res = "SUCCESS"
    try:
        client = boto3.client(
            's3',
            region_name=REGION,
            endpoint_url="http://localhost.localstack.cloud:4566"
        )
        client.create_bucket(
            Bucket=BUCKET_NAME,
            CreateBucketConfiguration=BUCKET_CONFIG
        )
        client.put_bucket_cors(
            Bucket=BUCKET_NAME,
            CORSConfiguration=BUCKET_CORS_CONFIG
        )
    except:
        res = "FAILURE"
    finally:
        print("Create Localstack S3 bucket `%s` - %s" % (BUCKET_NAME, res))


if __name__ == "__main__":
    main()
