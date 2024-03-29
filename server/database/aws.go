package database

// https://docs.aws.amazon.com/sdk-for-go/v1/developer-guide/s3-example-presigned-urls.html

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/khengsaurus/ng-go-todos/consts"
)

type S3Client struct {
	instance *s3.S3
}

func InitS3Client() *S3Client {
	var awsSession *session.Session
	var err error
	if consts.Local {
		fmt.Println("AWS config: local")
		awsSession, err = session.NewSession(
			&aws.Config{
				Region:           aws.String(os.Getenv("AWS_REGION")),
				Endpoint:         aws.String(os.Getenv("AWS_URI_C")),
				Credentials:      credentials.NewStaticCredentials(os.Getenv("AWS_ACCESS_KEY_C"), os.Getenv("AWS_SECRET_KEY_C"), ""),
				S3ForcePathStyle: aws.Bool(true),
			})
	} else {
		fmt.Println("AWS config: remote")
		awsSession, err = session.NewSession(
			&aws.Config{
				Region:      aws.String(os.Getenv("AWS_REGION")),
				Credentials: credentials.NewStaticCredentials(os.Getenv("AWS_ACCESS_KEY"), os.Getenv("AWS_SECRET_KEY"), ""),
			})
	}
	if err != nil {
		log.Fatal(err)
	}

	return &S3Client{instance: s3.New(awsSession)}
}

func GetSignedPutURL(ctx context.Context, key string) (string, error) {
	s3Client, ok := ctx.Value(consts.S3ClientKey).(*S3Client)
	if !ok {
		return "", fmt.Errorf("couldn't find %s in request context", consts.S3ClientKey)
	}

	req, _ := s3Client.instance.PutObjectRequest(
		&s3.PutObjectInput{
			Bucket:      aws.String(os.Getenv("AWS_BUCKET_NAME")),
			Key:         aws.String(key),
			ContentType: aws.String("multipart/form-data"),
		},
	)

	return req.Presign(1 * time.Minute)
}

func GetSignedGetURL(ctx context.Context, key string) (string, error) {
	s3Client, ok := ctx.Value(consts.S3ClientKey).(*S3Client)
	if !ok {
		return "", fmt.Errorf("couldn't find %s in request context", consts.S3ClientKey)
	}

	req, _ := s3Client.instance.GetObjectRequest(
		&s3.GetObjectInput{
			Bucket: aws.String(os.Getenv("AWS_BUCKET_NAME")),
			Key:    aws.String(key),
		},
	)

	return req.Presign(10 * time.Minute)
}

func DeleteObject(ctx context.Context, key string) (bool, error) {
	fmt.Println("DeleteObject called")
	s3Client, ok := ctx.Value(consts.S3ClientKey).(*S3Client)
	if !ok {
		return false, fmt.Errorf("couldn't find %s in request context", consts.S3ClientKey)
	}

	if _, err := s3Client.instance.DeleteObject(
		&s3.DeleteObjectInput{
			Bucket: aws.String(os.Getenv("AWS_BUCKET_NAME")),
			Key:    aws.String(key),
		},
	); err != nil {
		return false, err
	}

	return true, nil
}

func DeleteObjects(ctx context.Context, objects *s3.DeleteObjectsInput) (bool, error) {
	fmt.Println("DeleteObjects called")
	s3Client, ok := ctx.Value(consts.S3ClientKey).(*S3Client)
	if !ok {
		return false, fmt.Errorf("couldn't find %s in request context", consts.S3ClientKey)
	}

	_, err := s3Client.instance.DeleteObjects(objects)
	if err != nil {
		return false, err
	}

	return true, err
}
