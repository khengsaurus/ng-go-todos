package controllers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/go-chi/chi"
	"github.com/google/uuid"
	"github.com/khengsaurus/ng-go-todos/database"
	"github.com/khengsaurus/ng-go-todos/utils"
)

type PutUrlReqBody struct {
	UserID   string `json:"userId"`
	TodoID   string `json:"todoId"`
	FileName string `json:"fileName"`
}

type Res struct {
	Url string `json:"url"`
	Key string `json:"key"`
}

func GetSignedPutURL(w http.ResponseWriter, r *http.Request) {
	fmt.Println("GetSignedPutURL called")
	var req PutUrlReqBody
	err := json.NewDecoder(r.Body).Decode(&req)

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	key := fmt.Sprintf("%s_%s_%s", req.TodoID, uuid.New(), req.FileName)
	url, err := database.GetSignedPutURL(r.Context(), fmt.Sprintf("%s/%s", req.UserID, key))
	if err != nil {
		fmt.Printf("%v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	utils.Json200(&Res{Url: url, Key: key}, w)
}

func GetSignedGetURL(w http.ResponseWriter, r *http.Request) {
	fmt.Println("GetSignedGetURL called")
	userId := chi.URLParam(r, "user_id")
	key := chi.URLParam(r, "file_key")

	if userId == "" || key == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	url, err := database.GetSignedGetURL(r.Context(), fmt.Sprintf("%s/%s", userId, key))
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	utils.Json200(&Res{Url: url}, w)
}

func DeleteFile(w http.ResponseWriter, r *http.Request) {
	fmt.Println("DeleteFile called")
	userId := chi.URLParam(r, "user_id")
	key := chi.URLParam(r, "file_key")

	if userId == "" || key == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	_, err := database.DeleteObject(r.Context(), fmt.Sprintf("%s/%s", userId, key))
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
