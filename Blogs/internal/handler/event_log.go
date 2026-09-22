package handler

import (
	"log/slog"
	"os"
)

var eventLogger = slog.New(slog.NewJSONHandler(os.Stdout, nil))
