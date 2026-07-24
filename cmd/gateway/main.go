package main

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strings"
)

func newProxy(target string) *httputil.ReverseProxy {
	u, _ := url.Parse(target)
	return httputil.NewSingleHostReverseProxy(u)
}

func main() {
	apiTarget := getEnv("API_TARGET", "http://localhost:5000")
	webTarget := getEnv("WEB_TARGET", "http://localhost:3000")
	iisTarget := getEnv("IIS_TARGET", "http://localhost:8082")
	port := getEnv("GATEWAY_PORT", "80")

	apiProxy := newProxy(apiTarget)
	webProxy := newProxy(webTarget)
	iisProxy := newProxy(iisTarget)

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		p := r.URL.Path

		switch {
		case strings.HasPrefix(p, "/peoplehub/api/"):
			r.URL.Path = strings.TrimPrefix(p, "/peoplehub")
			apiProxy.ServeHTTP(w, r)

		case strings.HasPrefix(p, "/peoplehub/swagger/"):
			r.URL.Path = strings.TrimPrefix(p, "/peoplehub")
			apiProxy.ServeHTTP(w, r)

		case strings.HasPrefix(p, "/peoplehub/uploads/"):
			r.URL.Path = strings.TrimPrefix(p, "/peoplehub")
			apiProxy.ServeHTTP(w, r)

		case p == "/peoplehub/health":
			r.URL.Path = "/health"
			apiProxy.ServeHTTP(w, r)

		case strings.HasPrefix(p, "/peoplehub"):
			webProxy.ServeHTTP(w, r)

		case strings.HasPrefix(p, "/contact"):
			iisProxy.ServeHTTP(w, r)

		case strings.HasPrefix(p, "/api/"),
			strings.HasPrefix(p, "/swagger/"),
			strings.HasPrefix(p, "/uploads/"):
			apiProxy.ServeHTTP(w, r)

		case p == "/health":
			apiProxy.ServeHTTP(w, r)

		case p == "/":
			http.Redirect(w, r, "/peoplehub", http.StatusFound)

		default:
			webProxy.ServeHTTP(w, r)
		}
	})

	log.Printf("Gateway listening on :%s", port)
	log.Printf("  /peoplehub/*   → %s (Next.js)", webTarget)
	log.Printf("  /peoplehub/api/* → %s", apiTarget)
	log.Printf("  /contact/* → %s (IIS)", iisTarget)

	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("Gateway failed: %v", err)
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
