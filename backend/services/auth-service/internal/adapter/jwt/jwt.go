package jwt

import (
	"time"
	"github.com/golang-jwt/jwt/v5"
)

type Issuer struct {
	secret []byte
}

func New(secret string) *Issuer { return &Issuer{secret: []byte(secret)} }

func (i *Issuer) Generate(userID, role string) (string, error) {
	claims := jwt.MapClaims{"sub": userID, "role": role, "exp": time.Now().Add(15 * time.Minute).Unix()}
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return t.SignedString(i.secret)
}
