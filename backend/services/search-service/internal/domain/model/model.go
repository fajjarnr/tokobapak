package model

type ProductDoc struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Price    int64  `json:"price"`
	Category string `json:"category,omitempty"`
}

type SearchParams struct {
	Query    string `json:"q"`
	Category string `json:"category"`
	MinPrice *int64 `json:"min_price"`
	MaxPrice *int64 `json:"max_price"`
	Limit    int    `json:"limit"`
	Offset   int    `json:"offset"`
}
