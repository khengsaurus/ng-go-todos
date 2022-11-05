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
}

func GetSignedPutURL(w http.ResponseWriter, r *http.Request) {
	fmt.Println("GetSignedPutURL called")
	var req PutUrlReqBody
	err := json.NewDecoder(r.Body).Decode(&req)

	if err != nil {
		// TODO check if shd be 400 instead
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	key := fmt.Sprintf("%s/%s_%s_%s", req.UserID, req.TodoID, uuid.New(), req.FileName)
	url, err := database.GetSignedPutURL(r.Context(), key)
	if err != nil {
		fmt.Printf("%v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	utils.Json200(&Res{Url: url}, w)
}

func GetSignedGetURL(w http.ResponseWriter, r *http.Request) {
	fmt.Println("GetSignedGetURL called")
	key := chi.URLParam(r, "key")

	if key == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	url, err := database.GetSignedGetURL(r.Context(), key)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	utils.Json200(&Res{Url: url}, w)
}
