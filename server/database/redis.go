package database

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"os"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/khengsaurus/ng-gql-todos/consts"
	"github.com/khengsaurus/ng-gql-todos/graph/model"
	"github.com/khengsaurus/ng-gql-todos/utils"
)

var (
	container  = os.Getenv("CONTAINER") == "true"
	defaultTTL = time.Second * 1800 // 30 mins
)

type RedisClient struct {
	instance *redis.Client
}

func InitRedisClient() *RedisClient {
	var opts *redis.Options

	if container {
		fmt.Printf("Using local redis service\n")
		redisAddress := fmt.Sprintf("%s:6379", os.Getenv("REDIS_SERVICE"))
		opts = (&redis.Options{
			Addr:     redisAddress,
			Password: "",
			DB:       0,
		})
	} else {
		fmt.Printf("Using remote redis service\n")
		opts = (&redis.Options{
			Addr:     os.Getenv("REDIS_URL"),
			Password: os.Getenv("REDIS_PW"),
			DB:       0,
		})
	}
	rdb := redis.NewClient(opts)

	return &RedisClient{instance: rdb}
}

func GetRedisClient(ctx context.Context) (*RedisClient, error) {
	redisClient, ok := ctx.Value(consts.RedisClientKey).(*RedisClient)
	if !ok {
		return nil, fmt.Errorf("couldn't find %s in context", consts.RedisClientKey)
	}
	return redisClient, nil
}

func (redisClient *RedisClient) DeleteKey(ctx context.Context, key string) {
	redisClient.instance.Del(ctx, key)
}

func (redisClient *RedisClient) GetTodos(ctx context.Context, userId string) (
	[]*model.Todo, error) {
	cacheKey := utils.GetUserTodosKey(userId)
	cacheValue, redisErr := redisClient.instance.Get(ctx, cacheKey).Result()
	if redisErr == redis.Nil {
		// Cached value does not exist. Return nil
		return nil, nil
	} else if redisErr != nil {
		return nil, redisErr
	} else {
		// Cached value exists. Extend TTL & build response
		redisClient.instance.Expire(ctx, cacheKey, defaultTTL).Result()
		data := make([]*model.Todo, 0)
		unmarshalErr := json.Unmarshal(
			bytes.NewBufferString(cacheValue).Bytes(), &data)
		if unmarshalErr != nil {
			return nil, unmarshalErr
		}
		return data, nil
	}
}

func (redisClient *RedisClient) SetTodos(
	ctx context.Context,
	userId string,
	todos []*model.Todo,
) {
	cacheKey := fmt.Sprintf("%s-todos", userId)
	b, marshallErr := json.Marshal(todos)
	if marshallErr != nil {
		fmt.Printf("Failed to marshall todos: %v\n", marshallErr)
	}

	redisSetErr := redisClient.instance.Set(
		ctx,
		cacheKey,
		bytes.NewBuffer(b).Bytes(),
		defaultTTL,
	).Err()
	if redisSetErr != nil {
		fmt.Printf("Failed to cache value for key %s\n", cacheKey)
	}
}

func RemoveKeyFromRedis(ctx context.Context, key string) {
	redisClient, _ := GetRedisClient(ctx)
	if redisClient != nil {
		redisClient.DeleteKey(ctx, key)
	}
}
