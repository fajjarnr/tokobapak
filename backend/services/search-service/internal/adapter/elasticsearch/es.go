package elasticsearch

import (
	"github.com/elastic/go-elasticsearch/v8"
)

type ES struct {
	c *elasticsearch.TypedClient
}

func New(addr string) (*ES, error) {
	c, err := elasticsearch.NewTypedClient(elasticsearch.Config{Addresses: []string{addr}})
	if err != nil {
		return nil, err
	}
	return &ES{c: c}, nil
}
