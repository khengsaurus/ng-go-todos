package controllers

import (
	"github.com/go-chi/chi"
)

var RestRouter = func(restApi chi.Router) {
	restApi.Route("/files", func(filesApi chi.Router) {
		filesApi.Get("/{user_id}/{file_key}", GetSignedGetURL)
		filesApi.Delete("/{user_id}/{file_key}", DeleteFile)
		filesApi.Post("/", GetSignedPutURL)
	})
}
