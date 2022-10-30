package controllers

import (
	"github.com/go-chi/chi"
)

var RestRouter = func(restApi chi.Router) {
	restApi.Route("/files", func(filesApi chi.Router) {
		filesApi.Post("/", GetSignedPutURL)
		filesApi.Get("/{key}", GetSignedGetURL)
	})
}
