package handler

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

const identityEmailKey = "gatewayUserEmail"

// RequireIdentity trusts headers supplied by the authenticated API Gateway.
// Deployment must prevent clients from bypassing the gateway or forging these headers.
func RequireIdentity() gin.HandlerFunc {
	return func(c *gin.Context) {
		email := strings.TrimSpace(c.GetHeader("X-User-Email"))
		role := strings.TrimSpace(c.GetHeader("X-User-Role"))
		if email == "" || role == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "identity headers are required"})
			return
		}
		if role != "GUIDE" && role != "TOURIST" {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "role is not allowed"})
			return
		}
		c.Set(identityEmailKey, email)
		c.Next()
	}
}

func requireOwnUserPath(c *gin.Context) bool {
	if c.Param("userId") != c.GetString(identityEmailKey) {
		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "userId must match the authenticated user"})
		return false
	}
	return true
}
