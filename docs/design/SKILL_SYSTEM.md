# Skill System Design Document

## Overview

**Skill System** adalah framework modular yang memungkinkan AI Agent TokoBapak untuk memperluas kemampuannya melalui plugin-based architecture. Setiap skill adalah komponen independen yang dapat menangani tugas spesifik dan digabungkan untuk memberikan solusi kompleks.

---

## Table of Contents

- [Design Philosophy](#design-philosophy)
- [Skill Architecture](#skill-architecture)
- [Skill Lifecycle](#skill-lifecycle)
- [Skill Registry](#skill-registry)
- [Built-in Skills](#built-in-skills)
- [Custom Skill Development](#custom-skill-development)
- [Skill Composition](#skill-composition)
- [Testing & Validation](#testing--validation)

---

## Design Philosophy

### Core Principles

1. **Modularity** - Setiap skill adalah unit mandiri dengan tanggung jawab tunggal
2. **Discoverability** - Skills dapat dideteksi secara otomatis oleh registry
3. **Composability** - Skills dapat dikombinasikan untuk membuat skill baru
4. **Extensibility** - Mudah menambahkan skill baru tanpa mengubah core system
5. **Observability** - Semua eksekusi skill tertrace dan termonitor

### SOLID Principles Application

| Principle | Application in Skills |
|-----------|----------------------|
| **S**ingle Responsibility | Setiap skill menangani satu domain |
| **O**pen/Closed | Terbuka untuk ekstensi, tertutup untuk modifikasi |
| **L**iskov Substitution | Semua skill dapat dipertukarkan melalui BaseSkill |
| **I**nterface Segregation | Interface minimal, fokus pada kebutuhan spesifik |
| **D**ependency Inversion | Skill bergantung pada abstraksi, bukan implementasi |

---

## Skill Architecture

### Class Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                    BaseSkill (ABC)                          │
│  - skill_id: str                                             │
│  - name: str                                                 │
│  - description: str                                          │
│  - version: str                                             │
│  - enabled: bool                                            │
│  - supported_intents: List[str]                             │
│  - required_context: List[str]                               │
│  - dependencies: List[str]                                  │
│  - priority: int                                            │
│                                                             │
│  + execute(context: dict) -> SkillResult                    │
│  + can_handle(intent: str, context: dict) -> bool           │
│  + validate_context(context: dict) -> ValidationResult     │
│  + get_metadata() -> SkillMetadata                          │
└─────────────────────────────────────────────────────────────┘
         │
         ├──┌─────────────────────────────────────────────┐
         ││         Internal Skills                        │
         │├─────────────────────────────────────────────┤
         ││  ┌─────────────────────────────────────────┐ │
         ││  │         ChatSkill                      │ │
         ││  │  - LLM-based conversation              │ │
         ││  │  - Multi-turn dialog                   │ │
         ││  └─────────────────────────────────────────┘ │
         ││  ┌─────────────────────────────────────────┐ │
         ││  │     ProductSearchSkill                 │ │
         ││  │  - Elasticsearch integration           │ │
         ││  │  - Advanced filtering                   │ │
         ││  └─────────────────────────────────────────┘ │
         ││  ┌─────────────────────────────────────────┐ │
         ││  │  ProductRecommendationSkill            │ │
         ││  │  - ML-based recommendations            │ │
         ││  │  - Personalization                     │ │
         ││  └─────────────────────────────────────────┘ │
         ││  ┌─────────────────────────────────────────┐ │
         ││  │         CartSkill                       │ │
         ││  │  - Cart operations                     │ │
         ││  │  - Quantity management                 │ │
         ││  └─────────────────────────────────────────┘ │
         ││  ┌─────────────────────────────────────────┐ │
         ││  │    OrderTrackingSkill                  │ │
         ││  │  - Order status tracking               │ │
         ││  │  - Timeline display                    │ │
         ││  └─────────────────────────────────────────┘ │
         │└─────────────────────────────────────────────┘
         │
         ├──┌─────────────────────────────────────────────┐
         ││         External Skills                       │
         │├─────────────────────────────────────────────┤
         ││  ┌─────────────────────────────────────────┐ │
         ││  │      WeatherSkill                       │ │
         ││  │  - Weather API integration              │ │
         ││  └─────────────────────────────────────────┘ │
         ││  ┌─────────────────────────────────────────┐ │
         ││  │       NewsSkill                         │ │
         ││  │  - News aggregation                    │ │
         ││  └─────────────────────────────────────────┘ │
         │└─────────────────────────────────────────────┘
         │
         └──┌─────────────────────────────────────────────┐
            │        Composite Skills                       │
            ├─────────────────────────────────────────────┤
            │  ┌─────────────────────────────────────────┐ │
            │  │  ShoppingAssistantSkill                │ │
            │  │  - Combines Search + Recommend + Cart   │ │
            │  └─────────────────────────────────────────┘ │
            │  ┌─────────────────────────────────────────┐ │
            │  │  GiftRecommendationSkill               │ │
            │  │  - User preferences + ML               │ │
            │  └─────────────────────────────────────────┘ │
            │  ┌─────────────────────────────────────────┐ │
            │  │   CustomerSupportSkill                 │ │
            │  │  - FAQ + Order Tracking + Chat          │ │
            │  └─────────────────────────────────────────┘ │
            └─────────────────────────────────────────────┘
```

### Skill Interfaces

#### BaseSkill Abstract Class

```python
from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class SkillStatus(Enum):
    """Status eksekusi skill"""
    SUCCESS = "success"
    FAILED = "failed"
    PARTIAL = "partial"
    SKIPPED = "skipped"

class SkillMetadata:
    """Metadata skill"""
    skill_id: str
    name: str
    description: str
    version: str
    author: str
    category: str
    tags: List[str]
    supported_intents: List[str]
    required_context: List[str]
    dependencies: List[str]
    priority: int
    enabled: bool
    created_at: datetime
    updated_at: datetime

class ValidationResult:
    """Hasil validasi konteks"""
    is_valid: bool
    missing_context: List[str]
    errors: List[str]

class SkillResult:
    """Hasil eksekusi skill"""
    skill_id: str
    status: SkillStatus
    data: Optional[Dict[str, Any]]
    message: str
    requires_followup: bool
    suggested_actions: List[str]
    next_intent: Optional[str]
    execution_time_ms: int
    metadata: Dict[str, Any]

class BaseSkill(ABC):
    """Base class untuk semua skills"""
    
    def __init__(self):
        self.skill_id: str = ""
        self.name: str = ""
        self.description: str = ""
        self.version: str = "1.0.0"
        self.enabled: bool = True
        self.supported_intents: List[str] = []
        self.required_context: List[str] = []
        self.dependencies: List[str] = []
        self.priority: int = 0
        self._config: Dict[str, Any] = {}
    
    @abstractmethod
    async def execute(self, context: Dict[str, Any]) -> SkillResult:
        """Execute skill dengan konteks yang diberikan"""
        pass
    
    @abstractmethod
    def can_handle(self, intent: str, context: Dict[str, Any]) -> bool:
        """Cek apakah skill dapat menangani intent ini"""
        pass
    
    def validate_context(self, context: Dict[str, Any]) -> ValidationResult:
        """Validasi apakah konteks yang diperlukan tersedia"""
        missing = [key for key in self.required_context if key not in context]
        return ValidationResult(
            is_valid=len(missing) == 0,
            missing_context=missing,
            errors=[] if len(missing) == 0 else [f"Missing required context: {', '.join(missing)}"]
        )
    
    def configure(self, config: Dict[str, Any]) -> None:
        """Konfigurasi skill dengan parameter tambahan"""
        self._config.update(config)
    
    def get_metadata(self) -> SkillMetadata:
        """Dapatkan metadata skill"""
        return SkillMetadata(
            skill_id=self.skill_id,
            name=self.name,
            description=self.description,
            version=self.version,
            author="TokoBapak",
            category=self.__class__.__bases__[0].__name__,
            tags=[],
            supported_intents=self.supported_intents,
            required_context=self.required_context,
            dependencies=self.dependencies,
            priority=self.priority,
            enabled=self.enabled,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
    
    async def pre_execute(self, context: Dict[str, Any]) -> None:
        """Hook sebelum eksekusi (opsional)"""
        pass
    
    async def post_execute(self, result: SkillResult, context: Dict[str, Any]) -> SkillResult:
        """Hook setelah eksekusi (opsional)"""
        return result
```

---

## Skill Lifecycle

### State Machine

```
┌──────────┐
│ REGISTER │
└────┬─────┘
     │
     ▼
┌──────────┐     ┌──────────┐     ┌──────────┐
│  ACTIVE  │────►│EXECUTING │────►│COMPLETED │
└────┬─────┘     └────┬─────┘     └──────────┘
     │                │
     │                ▼
     │           ┌──────────┐
     │           │  FAILED  │
     │           └────┬─────┘
     │                │
     │                ▼
     │           ┌──────────┐
     └───────────│ RETRYING │
                 └──────────┘
```

### Lifecycle Methods

| Phase | Method | Description |
|-------|--------|-------------|
| **Initialization** | `__init__()` | Setup skill configuration |
| **Registration** | `register()` | Register skill ke registry |
| **Validation** | `validate_context()` | Check context requirements |
| **Pre-execution** | `pre_execute()` | Prepare before execution |
| **Execution** | `execute()` | Main skill logic |
| **Post-execution** | `post_execute()` | Cleanup or post-processing |
| **Deregistration** | `deregister()` | Remove from registry |

---

## Skill Registry

### Registry Design

```python
from typing import Dict, List, Optional
from concurrent.futures import ThreadPoolExecutor
import asyncio

class SkillRegistry:
    """Central registry untuk semua skills"""
    
    def __init__(self):
        self._skills: Dict[str, BaseSkill] = {}
        self._intent_index: Dict[str, List[str]] = {}  # intent -> [skill_ids]
        self._dependency_graph: Dict[str, List[str]] = {}  # skill_id -> [dependent_skill_ids]
        self._executor = ThreadPoolExecutor(max_workers=10)
    
    async def register_skill(self, skill: BaseSkill) -> bool:
        """Register skill baru ke registry"""
        try:
            self._skills[skill.skill_id] = skill
            
            # Index by intent
            for intent in skill.supported_intents:
                if intent not in self._intent_index:
                    self._intent_index[intent] = []
                self._intent_index[intent].append(skill.skill_id)
            
            # Build dependency graph
            self._dependency_graph[skill.skill_id] = skill.dependencies
            
            return True
        except Exception as e:
            print(f"Failed to register skill {skill.skill_id}: {e}")
            return False
    
    async def deregister_skill(self, skill_id: str) -> bool:
        """Remove skill dari registry"""
        if skill_id not in self._skills:
            return False
        
        skill = self._skills[skill_id]
        
        # Remove from intent index
        for intent in skill.supported_intents:
            if intent in self._intent_index:
                self._intent_index[intent].remove(skill_id)
                if not self._intent_index[intent]:
                    del self._intent_index[intent]
        
        del self._skills[skill_id]
        del self._dependency_graph[skill_id]
        return True
    
    def get_skill(self, skill_id: str) -> Optional[BaseSkill]:
        """Get skill by ID"""
        return self._skills.get(skill_id)
    
    def get_all_skills(self) -> List[BaseSkill]:
        """Get all registered skills"""
        return list(self._skills.values())
    
    def get_skills_for_intent(self, intent: str) -> List[BaseSkill]:
        """Get skills yang dapat menangani intent tertentu"""
        skill_ids = self._intent_index.get(intent, [])
        return [self._skills[sid] for sid in skill_ids if sid in self._skills]
    
    def find_best_skill(self, intent: str, context: Dict[str, Any]) -> Optional[BaseSkill]:
        """Find skill terbaik untuk intent dan konteks tertentu"""
        candidates = self.get_skills_for_intent(intent)
        
        # Filter skills yang dapat handle context
        valid_skills = [
            skill for skill in candidates
            if skill.validate_context(context).is_valid and skill.enabled
        ]
        
        if not valid_skills:
            return None
        
        # Sort by priority
        valid_skills.sort(key=lambda s: s.priority, reverse=True)
        return valid_skills[0]
    
    async def execute_skill(self, skill_id: str, context: Dict[str, Any]) -> SkillResult:
        """Execute skill by ID"""
        skill = self.get_skill(skill_id)
        if not skill:
            return SkillResult(
                skill_id=skill_id,
                status=SkillStatus.FAILED,
                data=None,
                message=f"Skill {skill_id} not found",
                requires_followup=False,
                suggested_actions=[],
                next_intent=None,
                execution_time_ms=0,
                metadata={}
            )
        
        if not skill.enabled:
            return SkillResult(
                skill_id=skill_id,
                status=SkillStatus.SKIPPED,
                data=None,
                message=f"Skill {skill_id} is disabled",
                requires_followup=False,
                suggested_actions=[],
                next_intent=None,
                execution_time_ms=0,
                metadata={}
            )
        
        # Validate context
        validation = skill.validate_context(context)
        if not validation.is_valid:
            return SkillResult(
                skill_id=skill_id,
                status=SkillStatus.FAILED,
                data=None,
                message=f"Context validation failed: {', '.join(validation.errors)}",
                requires_followup=False,
                suggested_actions=[],
                next_intent=None,
                execution_time_ms=0,
                metadata={}
            )
        
        # Execute skill
        start_time = datetime.now()
        try:
            await skill.pre_execute(context)
            result = await skill.execute(context)
            result = await skill.post_execute(result, context)
            
            execution_time = int((datetime.now() - start_time).total_seconds() * 1000)
            result.execution_time_ms = execution_time
            
            return result
        except Exception as e:
            execution_time = int((datetime.now() - start_time).total_seconds() * 1000)
            return SkillResult(
                skill_id=skill_id,
                status=SkillStatus.FAILED,
                data=None,
                message=f"Skill execution failed: {str(e)}",
                requires_followup=False,
                suggested_actions=[],
                next_intent=None,
                execution_time_ms=execution_time,
                metadata={"error": str(e)}
            )
    
    async def execute_skill_chain(self, skill_ids: List[str], context: Dict[str, Any]) -> List[SkillResult]:
        """Execute multiple skills in sequence"""
        results = []
        for skill_id in skill_ids:
            result = await self.execute_skill(skill_id, context)
            results.append(result)
            
            # Update context with result
            if result.data:
                context.update(result.data)
            
            # Stop on failure
            if result.status == SkillStatus.FAILED:
                break
        
        return results
    
    async def execute_parallel_skills(self, skill_ids: List[str], context: Dict[str, Any]) -> List[SkillResult]:
        """Execute multiple skills in parallel"""
        tasks = [self.execute_skill(sid, context) for sid in skill_ids]
        return await asyncio.gather(*tasks, return_exceptions=True)
    
    def get_skill_dependencies(self, skill_id: str) -> List[str]:
        """Get dependencies untuk skill tertentu"""
        return self._dependency_graph.get(skill_id, [])
    
    def validate_dependency_order(self, skill_ids: List[str]) -> bool:
        """Validasi bahwa dependencies terpenuhi"""
        for skill_id in skill_ids:
            deps = self.get_skill_dependencies(skill_id)
            for dep in deps:
                if dep not in skill_ids:
                    return False
        return True
```

---

## Built-in Skills

### 1. ChatSkill

**Purpose**: General conversation menggunakan LLM

**Supported Intents**: `chat.general`, `chat.greeting`, `chat.farewell`

**Required Context**: `user_id`, `session_id`

```python
class ChatSkill(BaseSkill):
    """LLM-based conversation skill"""
    
    def __init__(self, llm_client):
        super().__init__()
        self.skill_id = "chat"
        self.name = "Chat"
        self.description = "General conversation skill using LLM"
        self.supported_intents = ["chat.general", "chat.greeting", "chat.farewell"]
        self.required_context = ["user_id", "session_id"]
        self.priority = 1
        self.llm_client = llm_client
    
    def can_handle(self, intent: str, context: Dict[str, Any]) -> bool:
        return intent in self.supported_intents
    
    async def execute(self, context: Dict[str, Any]) -> SkillResult:
        user_message = context.get("message", "")
        user_id = context.get("user_id")
        session_id = context.get("session_id")
        
        # Get conversation history
        history = await self._get_conversation_history(user_id, session_id)
        
        # Generate response using LLM
        response = await self.llm_client.chat(
            messages=history + [{"role": "user", "content": user_message}],
            system_message="You are a helpful shopping assistant for TokoBapak, an Indonesian e-commerce platform."
        )
        
        # Save conversation
        await self._save_conversation(user_id, session_id, user_message, response)
        
        return SkillResult(
            skill_id=self.skill_id,
            status=SkillStatus.SUCCESS,
            data={"response": response},
            message=response,
            requires_followup=True,
            suggested_actions=self._generate_suggestions(response),
            next_intent=None,
            execution_time_ms=0,
            metadata={"model": "gpt-4", "tokens_used": response.usage.total_tokens}
        )
```

### 2. ProductSearchSkill

**Purpose**: Search products dengan advanced filtering

**Supported Intents**: `search.product`, `search.category`, `search.brand`

**Required Context**: `query` or `filters`

```python
class ProductSearchSkill(BaseSkill):
    """Product search skill using Elasticsearch"""
    
    def __init__(self, search_service_url: str):
        super().__init__()
        self.skill_id = "product_search"
        self.name = "Product Search"
        self.description = "Search products with advanced filtering"
        self.supported_intents = ["search.product", "search.category", "search.brand"]
        self.required_context = ["query"]
        self.priority = 10
        self.search_service_url = search_service_url
    
    def can_handle(self, intent: str, context: Dict[str, Any]) -> bool:
        return intent in self.supported_intents
    
    async def execute(self, context: Dict[str, Any]) -> SkillResult:
        query = context.get("query", "")
        filters = context.get("filters", {})
        page = context.get("page", 1)
        limit = context.get("limit", 20)
        
        # Search products via search-service
        response = await self._search_products(query, filters, page, limit)
        
        products = response.get("results", [])
        total = response.get("total", 0)
        
        return SkillResult(
            skill_id=self.skill_id,
            status=SkillStatus.SUCCESS,
            data={
                "products": products,
                "total": total,
                "page": page,
                "limit": limit
            },
            message=f"Menemukan {total} produk untuk '{query}'",
            requires_followup=False,
            suggested_actions=self._generate_suggestions(products),
            next_intent="view_product" if products else None,
            execution_time_ms=0,
            metadata={"query": query, "filters": filters}
        )
```

### 3. ProductRecommendationSkill

**Purpose**: Recommend products berdasarkan ML

**Supported Intents**: `recommend.product`, `recommend.similar`, `recommend.trending`

**Required Context**: `user_id`

```python
class ProductRecommendationSkill(BaseSkill):
    """Product recommendation skill using ML"""
    
    def __init__(self, recommendation_service_url: str):
        super().__init__()
        self.skill_id = "product_recommendation"
        self.name = "Product Recommendation"
        self.description = "Recommend products using ML algorithms"
        self.supported_intents = ["recommend.product", "recommend.similar", "recommend.trending"]
        self.required_context = ["user_id"]
        self.priority = 8
        self.recommendation_service_url = recommendation_service_url
    
    def can_handle(self, intent: str, context: Dict[str, Any]) -> bool:
        return intent in self.supported_intents
    
    async def execute(self, context: Dict[str, Any]) -> SkillResult:
        user_id = context.get("user_id")
        intent = context.get("intent")
        limit = context.get("limit", 10)
        
        # Get recommendations
        if intent == "recommend.similar" and "product_id" in context:
            products = await self._get_similar_products(context["product_id"], limit)
            message = "Berikut produk yang mirip dengan yang Anda lihat"
        elif intent == "recommend.trending":
            products = await self._get_trending_products(limit)
            message = "Berikut produk yang sedang populer"
        else:
            products = await self._get_personalized_recommendations(user_id, limit)
            message = "Berikut rekomendasi produk untuk Anda"
        
        return SkillResult(
            skill_id=self.skill_id,
            status=SkillStatus.SUCCESS,
            data={"products": products},
            message=message,
            requires_followup=False,
            suggested_actions=["Lihat detail produk", "Tambahkan ke keranjang"],
            next_intent="view_product",
            execution_time_ms=0,
            metadata={"algorithm": "collaborative_filtering", "limit": limit}
        )
```

### 4. CartSkill

**Purpose**: Manage shopping cart operations

**Supported Intents**: `cart.add`, `cart.remove`, `cart.update`, `cart.view`

**Required Context**: `user_id` or `session_id`

```python
class CartSkill(BaseSkill):
    """Shopping cart management skill"""
    
    def __init__(self, cart_service_url: str):
        super().__init__()
        self.skill_id = "cart"
        self.name = "Cart"
        self.description = "Manage shopping cart operations"
        self.supported_intents = ["cart.add", "cart.remove", "cart.update", "cart.view"]
        self.required_context = ["user_id"]
        self.priority = 15
        self.cart_service_url = cart_service_url
    
    def can_handle(self, intent: str, context: Dict[str, Any]) -> bool:
        return intent in self.supported_intents
    
    async def execute(self, context: Dict[str, Any]) -> SkillResult:
        user_id = context.get("user_id")
        intent = context.get("intent")
        
        if intent == "cart.add":
            result = await self._add_to_cart(user_id, context.get("product_id"), context.get("quantity", 1))
            message = f"Berhasil menambahkan {context.get('quantity', 1)} produk ke keranjang"
        elif intent == "cart.remove":
            result = await self._remove_from_cart(user_id, context.get("item_id"))
            message = "Berhasil menghapus produk dari keranjang"
        elif intent == "cart.update":
            result = await self._update_cart_item(user_id, context.get("item_id"), context.get("quantity"))
            message = "Berhasil memperbarui keranjang"
        else:  # cart.view
            result = await self._get_cart(user_id)
            message = f"Keranjang Anda berisi {len(result.get('items', []))} produk"
        
        return SkillResult(
            skill_id=self.skill_id,
            status=SkillStatus.SUCCESS,
            data=result,
            message=message,
            requires_followup=False,
            suggested_actions=["Checkout", "Lanjutkan belanja"],
            next_intent="checkout" if intent == "cart.view" and result.get("items") else None,
            execution_time_ms=0,
            metadata={}
        )
```

---

## Custom Skill Development

### Creating a New Skill

1. **Create skill class** extending `BaseSkill`

```python
class MyCustomSkill(BaseSkill):
    """Custom skill example"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__()
        self.skill_id = "my_custom_skill"
        self.name = "My Custom Skill"
        self.description = "Description of what this skill does"
        self.version = "1.0.0"
        self.supported_intents = ["my.custom.intent"]
        self.required_context = ["user_id"]
        self.priority = 5
        self.configure(config)
    
    def can_handle(self, intent: str, context: Dict[str, Any]) -> bool:
        return intent in self.supported_intents
    
    async def execute(self, context: Dict[str, Any]) -> SkillResult:
        # Implement skill logic here
        result = await self._do_something(context)
        
        return SkillResult(
            skill_id=self.skill_id,
            status=SkillStatus.SUCCESS,
            data=result,
            message="Skill executed successfully",
            requires_followup=False,
            suggested_actions=[],
            next_intent=None,
            execution_time_ms=0,
            metadata={}
        )
    
    async def _do_something(self, context: Dict[str, Any]) -> Dict[str, Any]:
        # Your implementation
        return {}
```

2. **Register the skill**

```python
# In your application startup
registry = SkillRegistry()
custom_skill = MyCustomSkill({"api_key": "secret"})
await registry.register_skill(custom_skill)
```

### Skill Configuration

Skills dapat dikonfigurasi melalui environment variables atau config files:

```python
# config.yaml
skills:
  chat:
    model: "gpt-4"
    temperature: 0.7
    max_tokens: 500
  
  product_search:
    elasticsearch_url: "http://localhost:9200"
    default_limit: 20
  
  cart:
    cart_service_url: "http://localhost:3003"
    max_items: 50
```

---

## Skill Composition

### Sequential Composition

```python
# Execute skills in sequence
result = await registry.execute_skill_chain(
    ["product_search", "product_recommendation", "cart"],
    context
)
```

### Parallel Composition

```python
# Execute skills in parallel
results = await registry.execute_parallel_skills(
    ["product_search", "product_recommendation"],
    context
)
```

### Conditional Composition

```python
# Execute based on conditions
best_skill = registry.find_best_skill(intent, context)
if best_skill:
    result = await registry.execute_skill(best_skill.skill_id, context)
```

### Composite Skills

```python
class ShoppingAssistantSkill(BaseSkill):
    """Composite skill for shopping assistance"""
    
    def __init__(self, registry: SkillRegistry):
        super().__init__()
        self.skill_id = "shopping_assistant"
        self.name = "Shopping Assistant"
        self.dependencies = ["product_search", "product_recommendation", "cart"]
        self.registry = registry
    
    async def execute(self, context: Dict[str, Any]) -> SkillResult:
        # Search products
        search_result = await self.registry.execute_skill("product_search", context)
        
        if search_result.data.get("products"):
            # Get recommendations
            rec_result = await self.registry.execute_skill("product_recommendation", context)
            
            # Combine results
            combined = {
                "search_results": search_result.data.get("products"),
                "recommendations": rec_result.data.get("products")
            }
            
            return SkillResult(
                skill_id=self.skill_id,
                status=SkillStatus.SUCCESS,
                data=combined,
                message="Saya menemukan beberapa produk yang cocok untuk Anda",
                requires_followup=True,
                suggested_actions=["Lihat detail", "Tambahkan ke keranjang"],
                next_intent="view_product",
                execution_time_ms=search_result.execution_time_ms + rec_result.execution_time_ms,
                metadata={}
            )
```

---

## Testing & Validation

### Unit Testing

```python
import pytest

@pytest.mark.asyncio
async def test_chat_skill_execution():
    llm_client = MockLLMClient()
    skill = ChatSkill(llm_client)
    
    context = {
        "user_id": "user_123",
        "session_id": "session_456",
        "message": "Halo"
    }
    
    result = await skill.execute(context)
    
    assert result.status == SkillStatus.SUCCESS
    assert result.data["response"]
    assert result.message

@pytest.mark.asyncio
async def test_skill_validation():
    skill = ProductSearchSkill("http://localhost:9200")
    
    # Missing required context
    context = {}
    validation = skill.validate_context(context)
    
    assert not validation.is_valid
    assert "query" in validation.missing_context
```

### Integration Testing

```python
@pytest.mark.asyncio
async def test_skill_registry():
    registry = SkillRegistry()
    
    # Register skills
    await registry.register_skill(ChatSkill(mock_llm))
    await registry.register_skill(ProductSearchSkill(mock_search))
    
    # Find skill for intent
    skill = registry.find_best_skill("search.product", {"query": "sepatu"})
    
    assert skill
    assert skill.skill_id == "product_search"
    
    # Execute skill
    result = await registry.execute_skill("product_search", {"query": "sepatu"})
    
    assert result.status == SkillStatus.SUCCESS
```

---

*Document Version: 1.0 | Last Updated: January 2026*
