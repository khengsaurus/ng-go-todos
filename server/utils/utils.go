package utils

import (
	"fmt"
)

func GetUserTodosKey(userId string) string {
	return fmt.Sprintf("%s-todos", userId)
}
