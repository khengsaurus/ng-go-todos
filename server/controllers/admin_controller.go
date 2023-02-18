package controllers

import (
	"fmt"
	"net/http"

	"github.com/go-chi/chi"
	"github.com/khengsaurus/ng-go-todos/consts"
	"github.com/khengsaurus/ng-go-todos/database"
	"github.com/khengsaurus/ng-go-todos/graph/model"
	"go.mongodb.org/mongo-driver/bson"
)

func AdminGet(w http.ResponseWriter, r *http.Request) {
	fmt.Println("AdminGet called")
	w.WriteHeader(http.StatusOK)
}

// For Localstack, since the unpaid version does not support persistence through restarts
func AdminDelete(w http.ResponseWriter, r *http.Request) {
	action := chi.URLParam(r, "action")
	if action == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	switch action {
	case "files":
		HandleDeleteFiles(w, r)
		return
	default:
		w.WriteHeader(http.StatusBadRequest)
		return
	}
}

func HandleDeleteFiles(w http.ResponseWriter, r *http.Request) {
	fmt.Println("AdminDelete called - HandleDeleteFiles")
	todosColl, err := database.GetCollection(r.Context(), consts.TodosCollection)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	// cursor, err := todosColl.Find(ctx, bson.D{{}}, options.Find())
	// if err != nil {
	// 	w.WriteHeader(http.StatusInternalServerError)
	// 	return
	// }
	// defer cursor.Close(ctx)

	// objects := []*s3.ObjectIdentifier{}
	// for cursor.Next(ctx) {
	// 	var todo model.Todo
	// 	err := cursor.Decode(&todo)
	// 	if err != nil {
	// 		fmt.Printf("Failed to decode todo document: %v\n", err)
	// 	} else {
	// 		for _, file := range todo.Files {
	// 			key := fmt.Sprintf("%s/%s", todo.UserID, file.Key)
	// 			fmt.Printf("To delete: %s\n", key)
	// 			objects = append(objects,
	// 				&s3.ObjectIdentifier{Key: aws.String(key)},
	// 			)
	// 		}
	// 	}
	// }

	// success, err := database.DeleteObjects(ctx, &s3.DeleteObjectsInput{
	// 	Bucket: aws.String(os.Getenv("AWS_BUCKET_NAME")),
	// 	Delete: &s3.Delete{Objects: objects},
	// })

	// if !success {
	// 	fmt.Printf("Failed to delete objects: %s\n", err)
	// 	w.WriteHeader(http.StatusInternalServerError)
	// }

	_, err = todosColl.UpdateMany(
		r.Context(),
		bson.D{{}},
		bson.M{"$set": bson.M{"files": []*model.File{}}},
	)
	if err != nil {
		fmt.Printf("Failed to clear all todos' Files field: %s\n", err)
		w.WriteHeader(http.StatusInternalServerError)
	}
	w.WriteHeader(http.StatusOK)
}
