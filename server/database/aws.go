package database

// https://docs.aws.amazon.com/sdk-for-go/v1/developer-guide/s3-example-presigned-urls.html

import (
	"os"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	AWSSession "github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/khengsaurus/ng-go-todos/consts"
)

func InitAWSSession() (*AWSSession.Session, error) {
	if consts.Container {
		return AWSSession.NewSession(
			&aws.Config{
				S3ForcePathStyle: aws.Bool(true),
				Endpoint:         aws.String(os.Getenv("AWS_ENDPOINT_C")),
				Region:           aws.String(os.Getenv("AWS_REGION")),
				Credentials:      credentials.NewStaticCredentials(os.Getenv("AWS_ACCESS_KEY_C"), os.Getenv("AWS_SECRET_ACCESS_KEY_C"), ""),
			})
	} else {
		return AWSSession.NewSession(
			&aws.Config{
				Region:      aws.String(os.Getenv("AWS_REGION")),
				Credentials: credentials.NewStaticCredentials(os.Getenv("AWS_ACCESS_KEY"), os.Getenv("AWS_SECRET_ACCESS_KEY"), ""),
			})
	}
}

func GetSignedPutURL(key string) (string, error) {
	session, err := InitAWSSession()
	if err != nil {
		return "", err
	}

	svc := s3.New(session)
	req, _ := svc.PutObjectRequest(&s3.PutObjectInput{
		Bucket: aws.String(os.Getenv("AWS_BUCKET_NAME")),
		Key:    aws.String(key),
	})

	return req.Presign(10 * time.Minute)
}

func GetSignedGetURL(key string) (string, error) {
	session, err := InitAWSSession()
	if err != nil {
		return "", err
	}

	svc := s3.New(session)
	req, _ := svc.GetObjectRequest(&s3.GetObjectInput{
		Bucket: aws.String(os.Getenv("AWS_BUCKET_NAME")),
		Key:    aws.String(key),
	})

	return req.Presign(10 * time.Minute)
}
