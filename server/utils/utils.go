package utils

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/khengsaurus/ng-go-todos/consts"
)

func GetUserTodosKey(userId string) string {
	return fmt.Sprintf("%s_%s_todos", consts.RedisKeyPrefix, userId)
}

func GetUserBoardsKey(userId string) string {
	return fmt.Sprintf("%s_%s_boards", consts.RedisKeyPrefix, userId)
}

func Json200(payload any, w http.ResponseWriter) {
	res, _ := json.Marshal(payload)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(res)
}

func ValidateAdmin(token string) bool {
	// Simple validation for now
	return token == "Bearer - admin"
}
