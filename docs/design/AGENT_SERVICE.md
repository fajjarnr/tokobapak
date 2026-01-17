# Agent Service Design Document

## Overview

**Agent Service** adalah microservice yang bertanggung jawab untuk mengelola AI agent dengan sistem skill-based. Service ini berfungsi sebagai orchestrator yang mengkoordinasikan berbagai skill untuk memberikan pengalaman yang cerdas dan personal kepada pengguna TokoBapak.

---

## Table of Contents

- [Architecture](#architecture)
- [Core Components](#core-components)
- [Skill System](#skill-system)
- [Data Models](#data-models)
- [API Design](#api-design)
- [Technology Stack](#technology-stack)
- [Integration Points](#integration-points)
- [Deployment](#deployment)

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Applications                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  Web App │  │  Mobile  │  │  Admin   │  │  Widget  │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
└───────┼────────────┼────────────┼────────────┼─────────────────┘
        │            │            │            │
        └────────────┼────────────┼────────────┘
                     │
         ┌───────────▼────────────────────────────┐
         │           API Gateway (Kong)           │
         └───────────┬────────────────────────────┘
                     │
         ┌───────────▼────────────────────────────┐
         │          Agent Service (:3008)         │
         │  ┌──────────────────────────────────┐  │
         │  │   Agent Orchestrator            │  │
         │  │   - Intent Recognition          │  │
         │  │   - Skill Selection             │  │
         │  │   - Context Management          │  │
         │  └──────────────────────────────────┘  │
         │  ┌──────────────────────────────────┐  │
         │  │   Skill Registry                │  │
         │  │   - Skill Discovery             │  │
         │  │   - Skill Execution             │  │
         │  │   - Skill Composition           │  │
         │  └──────────────────────────────────┘  │
         └───────┬──────────┬──────────┬────────┘
                 │          │          │
         ┌───────▼──┐ ┌─────▼──────┐ ┌─▼──────────┐
         │ Internal │ │ External   │ │  ML Model  │
         │  Skills  │ │  Skills    │ │  Services  │
         └──────────┘ └────────────┘ └────────────┘
```

### Skill-Based Agent Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Agent Orchestrator                        │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │               Context Manager                       │     │
│  │  - User Context (preferences, history)             │     │
│  │  - Session Context (conversation state)            │     │
│  │  - Business Context (cart, orders, browsing)        │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │               Intent Classifier                     │     │
│  │  - NLU Model (BERT/LLM)                             │     │
│  │  - Intent Detection                                 │     │
│  │  - Entity Extraction                                │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │               Skill Router                          │     │
│  │  - Route to appropriate skill                      │     │
│  │  - Multi-skill orchestration                       │     │
│  │  - Fallback handling                               │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
         │                  │                  │
    ┌────▼────┐       ┌──────▼──────┐    ┌───────▼───────┐
    │  Chat   │       │  Product    │    │  Analytics    │
    │  Skill  │       │   Skills    │    │    Skills     │
    └─────────┘       └─────────────┘    └───────────────┘
```

---

## Core Components

### 1. Agent Orchestrator

**Responsibilities:**
- Mengelola lifecycle agent dari user request ke response
- Koordinasi antar skills
- Manajemen konteks percakapan dan user
- Error handling dan fallback

**Key Classes:**
```python
class AgentOrchestrator:
    def process_request(self, request: AgentRequest) -> AgentResponse:
        pass
    
    def select_skill(self, intent: str, context: dict) -> BaseSkill:
        pass
    
    def execute_skill_chain(self, skills: List[BaseSkill]) -> AgentResponse:
        pass
```

### 2. Skill Registry

**Responsibilities:**
- Registrasi dan discovery skills
- Validasi skill availability
- Skill dependency management
- Skill execution coordination

**Key Classes:**
```python
class SkillRegistry:
    def register_skill(self, skill: BaseSkill) -> None:
        pass
    
    def get_skill(self, skill_name: str) -> BaseSkill:
        pass
    
    def find_skill_for_intent(self, intent: str) -> List[BaseSkill]:
        pass
```

### 3. Context Manager

**Responsibilities:**
- Mengelola user context (preferences, history)
- Mengelola session context (percakapan aktif)
- Mengambil business context (cart, orders)
- Context persistence

**Key Classes:**
```python
class ContextManager:
    def get_user_context(self, user_id: str) -> UserContext:
        pass
    
    def get_session_context(self, session_id: str) -> SessionContext:
        pass
    
    def update_context(self, context_id: str, data: dict) -> None:
        pass
```

### 4. Intent Classifier

**Responsibilities:**
- Natural Language Understanding
- Intent detection
- Entity extraction
- Sentiment analysis

**Key Classes:**
```python
class IntentClassifier:
    def classify(self, text: str, context: dict) -> Intent:
        pass
    
    def extract_entities(self, text: str) -> List[Entity]:
        pass
```

---

## Skill System

### Skill Hierarchy

```
BaseSkill (abstract)
├── Internal Skills
│   ├── ChatSkill
│   ├── ProductSearchSkill
│   ├── ProductRecommendationSkill
│   ├── CartSkill
│   ├── OrderTrackingSkill
│   └── FAQSkill
├── External Skills
│   ├── WeatherSkill
│   ├── NewsSkill
│   └── CalculatorSkill
└── Composite Skills
    ├── ShoppingAssistantSkill
    ├── GiftRecommendationSkill
    └── CustomerSupportSkill
```

### Skill Interface

```python
class BaseSkill(ABC):
    skill_id: str
    name: str
    description: str
    supported_intents: List[str]
    required_context: List[str]
    dependencies: List[str]
    priority: int
    
    @abstractmethod
    async def execute(self, context: dict) -> SkillResult:
        pass
    
    @abstractmethod
    def can_handle(self, intent: str, context: dict) -> bool:
        pass
```

### Skill Execution Flow

```
User Request
    ↓
Intent Classification
    ↓
Skill Selection (Skill Registry)
    ↓
Context Gathering (Context Manager)
    ↓
Skill Execution (parallel for independent skills)
    ↓
Response Aggregation
    ↓
User Response
```

### Built-in Skills

| Skill | Purpose | Data Sources | API |
|-------|---------|--------------|-----|
| **ChatSkill** | General conversation | LLM (GPT-4, Claude) | `/v1/agent/chat` |
| **ProductSearchSkill** | Search products | Elasticsearch | `/v1/agent/search` |
| **ProductRecommendationSkill** | Recommend products | ML models | `/v1/agent/recommend` |
| **CartSkill** | Manage shopping cart | Cart service | `/v1/agent/cart` |
| **OrderTrackingSkill** | Track orders | Order service | `/v1/agent/track-order` |
| **FAQSkill** | Answer common questions | Knowledge base | `/v1/agent/faq` |
| **GiftRecommendationSkill** | Suggest gifts | User preferences + ML | `/v1/agent/gift` |

---

## Data Models

### AgentRequest

```python
class AgentRequest(BaseModel):
    request_id: str
    user_id: str
    session_id: str
    message: str
    context: Optional[dict] = None
    metadata: Optional[dict] = None
    timestamp: datetime
```

### AgentResponse

```python
class AgentResponse(BaseModel):
    request_id: str
    response: str
    actions: List[AgentAction]
    context_updates: dict
    suggested_next_actions: List[str]
    metadata: dict
    processing_time_ms: int
    timestamp: datetime
```

### Intent

```python
class Intent(BaseModel):
    intent_id: str
    name: str
    confidence: float
    entities: List[Entity]
    sentiment: Optional[str]
```

### SkillResult

```python
class SkillResult(BaseModel):
    skill_id: str
    success: bool
    data: dict
    message: str
    requires_followup: bool
    suggested_actions: List[str]
```

### AgentAction

```python
class AgentAction(BaseModel):
    action_type: str
    parameters: dict
    target_service: str
    description: str
```

---

## API Design

### Core Endpoints

#### 1. Chat Endpoint

```http
POST /v1/agent/chat
Content-Type: application/json
Authorization: Bearer {token}

{
  "request_id": "req_123",
  "user_id": "user_456",
  "session_id": "session_789",
  "message": "Cari sepatu adidas untuk lari",
  "context": {
    "page": "/products",
    "category_id": "cat_123"
  }
}
```

**Response:**
```json
{
  "request_id": "req_123",
  "response": "Saya menemukan beberapa sepatu Adidas untuk lari. Berikut rekomendasi terbaik untuk Anda...",
  "actions": [
    {
      "action_type": "search_products",
      "parameters": {
        "query": "sepatu adidas lari",
        "filters": {
          "category": "sport-shoes",
          "brand": "adidas"
        }
      },
      "target_service": "search-service"
    }
  ],
  "context_updates": {
    "last_search": "sepatu adidas lari"
  },
  "suggested_next_actions": [
    "Lihat detail sepatu",
    "Filter berdasarkan harga",
    "Filter berdasarkan ukuran"
  ],
  "metadata": {
    "skills_used": ["chat", "product_search"],
    "intent": "search_product",
    "intent_confidence": 0.95
  },
  "processing_time_ms": 245,
  "timestamp": "2026-01-17T10:30:00Z"
}
```

#### 2. Recommendation Endpoint

```http
POST /v1/agent/recommend
Content-Type: application/json

{
  "request_id": "req_124",
  "user_id": "user_456",
  "recommendation_type": "product",
  "context": {
    "page": "/checkout"
  }
}
```

#### 3. Skill Discovery Endpoint

```http
GET /v1/agent/skills
Authorization: Bearer {token}
```

**Response:**
```json
{
  "skills": [
    {
      "skill_id": "chat",
      "name": "Chat",
      "description": "General conversation skill",
      "enabled": true
    },
    {
      "skill_id": "product_search",
      "name": "Product Search",
      "description": "Search and find products",
      "enabled": true
    }
  ]
}
```

---

## Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| **Runtime** | Python | 3.12+ |
| **Framework** | FastAPI | 0.115+ |
| **LLM Integration** | LangChain | 0.3+ |
| **Vector Database** | Weaviate / Pinecone | Latest |
| **Cache** | Redis | 7.0+ |
| **Database** | PostgreSQL | 16+ |
| **Message Queue** | RabbitMQ | 3.12+ |
| **Orchestration** | Kubernetes | 1.28+ |

### Dependencies

```txt
fastapi==0.115.0
uvicorn[standard]==0.32.0
pydantic==2.9.0
sqlalchemy==2.0.35
alembic==1.14.0
redis==5.2.0
langchain==0.3.0
langchain-openai==0.2.0
openai==1.57.0
anthropic==0.39.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
pytest==8.3.0
pytest-asyncio==0.24.0
```

---

## Integration Points

### Service Dependencies

| Service | Integration Type | Purpose |
|---------|------------------|---------|
| **product-service** | HTTP/gRPC | Product data retrieval |
| **catalog-service** | HTTP/gRPC | Category/brand data |
| **search-service** | HTTP | Full-text search |
| **recommendation-service** | HTTP | ML recommendations |
| **cart-service** | HTTP | Cart operations |
| **order-service** | HTTP | Order tracking |
| **auth-service** | HTTP | User authentication |
| **user-service** | HTTP | User profile data |

### Event Streams (Kafka Topics)

| Topic | Purpose | Producer | Consumer |
|-------|---------|----------|----------|
| `agent.interactions` | Track all agent interactions | agent-service | analytics-service |
| `agent.fallbacks` | Track failed intents | agent-service | analytics-service |
| `skill.executions` | Track skill executions | agent-service | analytics-service |
| `recommendations.generated` | New recommendations | agent-service | notification-service |

---

## Deployment

### Container Configuration

```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 3008

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3008"]
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: agent-service
spec:
  replicas: 2
  selector:
    matchLabels:
      app: agent-service
  template:
    metadata:
      labels:
        app: agent-service
    spec:
      containers:
      - name: agent-service
        image: tokobapak/agent-service:latest
        ports:
        - containerPort: 3008
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-credentials
              key: url
        - name: REDIS_URL
          valueFrom:
            configMapKeyRef:
              name: service-configs
              key: redis-url
        resources:
          requests:
            cpu: 500m
            memory: 512Mi
          limits:
            cpu: 1000m
            memory: 1Gi
```

---

## Monitoring & Observability

### Key Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `agent_requests_total` | Counter | Total agent requests |
| `agent_response_time_seconds` | Histogram | Response time distribution |
| `skill_execution_duration_seconds` | Histogram | Skill execution time |
| `intent_classification_accuracy` | Gauge | Intent classifier accuracy |
| `skill_success_rate` | Gauge | Skill execution success rate |

### Logging

- Structured logging (JSON format)
- Request/Response logging
- Skill execution traces
- Error and exception logs

---

## Future Enhancements

### Phase 2
- [ ] Multi-modal support (text + image)
- [ ] Voice input/output
- [ ] Real-time collaboration (multiple agents)
- [ ] A/B testing for skill routing

### Phase 3
- [ ] Self-learning skills
- [ ] Dynamic skill loading
- [ ] Federated learning across skills
- [ ] Explainable AI for decisions

---

*Document Version: 1.0 | Last Updated: January 2026*
