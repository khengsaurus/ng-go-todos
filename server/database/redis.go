package database

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"os"

	"github.com/go-redis/redis/v8"
	"github.com/khengsaurus/ng-gql-todos/consts"
	"github.com/khengsaurus/ng-gql-todos/graph/model"
	"github.com/khengsaurus/ng-gql-todos/utils"
)

type RedisClient struct {
	instance *redis.Client
}

func InitRedisClient() *RedisClient {
	var opts *redis.Options

	if consts.Container {
		fmt.Println("Redis config: local")
		redisAddress := fmt.Sprintf("%s:6379", os.Getenv("REDIS_SERVICE"))
		opts = (&redis.Options{
			Addr:     redisAddress,
			Password: "",
			DB:       0,
		})
	} else {
		fmt.Println("Redis config: remote")
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

func GetRedisValue[M model.Todo | model.Board](
	redisClient *RedisClient,
	ctx context.Context,
	cacheKey string) []*M {
	cacheValue, err := redisClient.instance.Get(ctx, cacheKey).Result()
	if err == redis.Nil {
		// Cached value does not exist. Return nil
		return nil
	} else if err != nil {
		fmt.Printf("%v\n", err)
		return nil
	} else {
		// Cached value exists. Extend TTL & build response
		redisClient.instance.Expire(ctx, cacheKey, consts.DefaultTTL).Result()
		data := make([]*M, 0)
		err := json.Unmarshal(
			bytes.NewBufferString(cacheValue).Bytes(), &data)
		if err != nil {
			fmt.Printf("%v\n", err)
			return nil
		}
		return data
	}
}

func SetRedisValue[M model.Todo | model.Board](
	redisClient *RedisClient,
	ctx context.Context,
	cacheKey string,
	values []*M,
) {
	b, err := json.Marshal(values)
	if err != nil {
		fmt.Printf("Failed to marshall values: %v\n", err)
	}
	err = redisClient.instance.Set(
		ctx,
		cacheKey,
		bytes.NewBuffer(b).Bytes(),
		consts.DefaultTTL,
	).Err()
	if err != nil {
		fmt.Printf("Failed to cache value for key %s\n", cacheKey)
	}
}

func RemoveKeyFromRedis(ctx context.Context, key string) {
	redisClient, _ := GetRedisClient(ctx)
	if redisClient != nil {
		redisClient.DeleteKey(ctx, key)
	}
}

/* -------------------- Methods --------------------*/

func (redisClient *RedisClient) DeleteKey(ctx context.Context, key string) {
	redisClient.instance.Del(ctx, key)
}

func (redisClient *RedisClient) GetTodos(ctx context.Context, userId string) (
	[]*model.Todo, error) {
	return GetRedisValue[model.Todo](
		redisClient,
		ctx,
		utils.GetUserTodosKey(userId),
	), nil
}

func (redisClient *RedisClient) SetTodos(
	ctx context.Context,
	userId string,
	todos []*model.Todo,
) {
	SetRedisValue(
		redisClient,
		ctx,
		utils.GetUserTodosKey(userId),
		todos,
	)
}

func (redisClient *RedisClient) GetBoards(ctx context.Context, userId string) (
	[]*model.Board, error) {
	return GetRedisValue[model.Board](
		redisClient,
		ctx,
		utils.GetUserBoardsKey(userId),
	), nil
}

func (redisClient *RedisClient) SetBoards(
	ctx context.Context,
	userId string,
	todos []*model.Board,
) {
	SetRedisValue(
		redisClient,
		ctx,
		utils.GetUserBoardsKey(userId),
		todos,
	)
}
