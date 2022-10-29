package controllers

import "github.com/go-chi/chi"

var RestHandler = func(router chi.Router) {
	router.Post("/", GetSignedPutURL)
	router.Get("/{key}", GetSignedPutURL)
}
