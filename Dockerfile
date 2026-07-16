FROM golang:1.26-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o /app/server ./cmd/server && \
    go build -o /app/seed-geo ./cmd/seed && \
    go build -o /app/seed-org ./cmd/seed/organization && \
    go build -o /app/seed-leave ./cmd/seed/leave && \
    go build -o /app/superadmin ./cmd/superadmin

FROM alpine:3.20

RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app

COPY --from=builder /app/server .
COPY --from=builder /app/seed-geo .
COPY --from=builder /app/seed-org .
COPY --from=builder /app/seed-leave .
COPY --from=builder /app/superadmin .

EXPOSE 5000

CMD ["./server"]
