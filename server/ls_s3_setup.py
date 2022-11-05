import boto3

REGION = 'ap-southeast-1'
BUCKET_NAME = 'ng-go-todos'

BUCKET_CONFIG = {'LocationConstraint': REGION}
BUCKET_CORS_CONFIG = {
    "CORSRules": [
        {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["HEAD", "GET", "POST", "PUT", "DELETE"],
            "AllowedOrigins": ["*"],
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
