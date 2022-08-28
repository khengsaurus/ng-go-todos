package main

/*
 * Script to add bson tags to generated models.
 * Will add `bson: "objectId"` for fields ending with "Id".
 * Adapted from https://github.com/99designs/gqlgen/issues/865#issuecomment-573043996
 */

import (
	"fmt"
	"os"

	"github.com/99designs/gqlgen/api"
	"github.com/99designs/gqlgen/codegen/config"
	"github.com/99designs/gqlgen/plugin/modelgen"
)

func mutateHook(b *modelgen.ModelBuild) *modelgen.ModelBuild {
	for _, model := range b.Models {
		for _, field := range model.Fields {
			name := field.Name
			if name == "id" {
				name = "_id"
			}
			// if strings.HasSuffix(name, "Id") {
			// 	name = "objectId"
			// }
			field.Tag += ` bson:"` + name + `"`
		}
	}
	return b
}

func main() {
	cfg, err := config.LoadConfigFromDefaultLocations()
	if err != nil {
		fmt.Fprintln(os.Stderr, "failed to load config", err.Error())
		os.Exit(2)
	}

	p := modelgen.Plugin{
		MutateHook: mutateHook,
	}

	err = api.Generate(cfg,
		api.NoPlugins(),
		api.AddPlugin(&p),
	)
	if err != nil {
		fmt.Fprintln(os.Stderr, err.Error())
		os.Exit(3)
	}
}
