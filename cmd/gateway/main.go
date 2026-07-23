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
		// /hub/api/* → strip /hub, forward to API
		case strings.HasPrefix(p, "/hub/api/"):
			r.URL.Path = strings.TrimPrefix(p, "/hub")
			apiProxy.ServeHTTP(w, r)

		// /hub/swagger/* → strip /hub, forward to API
		case strings.HasPrefix(p, "/hub/swagger/"):
			r.URL.Path = strings.TrimPrefix(p, "/hub")
			apiProxy.ServeHTTP(w, r)

		// /hub/uploads/* → strip /hub, forward to API
		case strings.HasPrefix(p, "/hub/uploads/"):
			r.URL.Path = strings.TrimPrefix(p, "/hub")
			apiProxy.ServeHTTP(w, r)

		// /hub/health → strip /hub, forward to API
		case p == "/hub/health":
			r.URL.Path = "/health"
			apiProxy.ServeHTTP(w, r)

		// /hub/* → forward to Next.js (Next.js has basePath: /hub)
		case strings.HasPrefix(p, "/hub"):
			webProxy.ServeHTTP(w, r)

		// /hrhub/* → proxy to old ASP.NET app on IIS
		case strings.HasPrefix(p, "/hrhub"):
			iisProxy.ServeHTTP(w, r)

		// /contact/* → proxy to IIS
		case strings.HasPrefix(p, "/contact"):
			iisProxy.ServeHTTP(w, r)

		// Direct API routes (backward compat without /hub prefix)
		case strings.HasPrefix(p, "/api/"),
			strings.HasPrefix(p, "/swagger/"),
			strings.HasPrefix(p, "/uploads/"):
			apiProxy.ServeHTTP(w, r)

		case p == "/health":
			apiProxy.ServeHTTP(w, r)

		// Root → redirect to /hub/
		case p == "/":
			http.Redirect(w, r, "/hub/", http.StatusFound)

		// Everything else → frontend (keep /hub prefix)
		default:
			webProxy.ServeHTTP(w, r)
		}
	})

	log.Printf("Gateway listening on :%s", port)
	log.Printf("  /hub/*   → %s (Next.js, basePath: /hub)", webTarget)
	log.Printf("  /hub/api/* → %s", apiTarget)
	log.Printf("  /hrhub/* → %s (IIS old project)", iisTarget)
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
