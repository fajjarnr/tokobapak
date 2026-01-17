from typing import Dict, List, Optional, Any
import asyncio
from datetime import datetime
from loguru import logger

from app.core.base_skill import BaseSkill, SkillResult, ValidationResult, SkillStatus


class SkillRegistry:
    def __init__(self):
        self._skills: Dict[str, BaseSkill] = {}
        self._intent_index: Dict[str, List[str]] = {}
        self._dependency_graph: Dict[str, List[str]] = {}
    
    async def register_skill(self, skill: BaseSkill) -> bool:
        try:
            self._skills[skill.skill_id] = skill
            
            for intent in skill.supported_intents:
                if intent not in self._intent_index:
                    self._intent_index[intent] = []
                self._intent_index[intent].append(skill.skill_id)
            
            self._dependency_graph[skill.skill_id] = skill.dependencies
            
            logger.info(f"Registered skill: {skill.skill_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to register skill {skill.skill_id}: {e}")
            return False
    
    async def deregister_skill(self, skill_id: str) -> bool:
        if skill_id not in self._skills:
            return False
        
        skill = self._skills[skill_id]
        
        for intent in skill.supported_intents:
            if intent in self._intent_index:
                self._intent_index[intent].remove(skill_id)
                if not self._intent_index[intent]:
                    del self._intent_index[intent]
        
        del self._skills[skill_id]
        del self._dependency_graph[skill_id]
        
        logger.info(f"Deregistered skill: {skill_id}")
        return True
    
    def get_skill(self, skill_id: str) -> Optional[BaseSkill]:
        return self._skills.get(skill_id)
    
    def get_all_skills(self) -> List[BaseSkill]:
        return list(self._skills.values())
    
    def get_skills_for_intent(self, intent: str) -> List[BaseSkill]:
        skill_ids = self._intent_index.get(intent, [])
        return [self._skills[sid] for sid in skill_ids if sid in self._skills]
    
    def find_best_skill(self, intent: str, context: Dict[str, Any]) -> Optional[BaseSkill]:
        candidates = self.get_skills_for_intent(intent)
        
        valid_skills = [
            skill for skill in candidates
            if skill.validate_context(context).is_valid and skill.enabled
        ]
        
        if not valid_skills:
            return None
        
        valid_skills.sort(key=lambda s: s.priority, reverse=True)
        return valid_skills[0]
    
    async def execute_skill(self, skill_id: str, context: Dict[str, Any]) -> SkillResult:
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
            logger.error(f"Skill execution failed for {skill_id}: {e}")
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
        results = []
        for skill_id in skill_ids:
            result = await self.execute_skill(skill_id, context)
            results.append(result)
            
            if result.data:
                context.update(result.data)
            
            if result.status == SkillStatus.FAILED:
                break
        
        return results
    
    async def execute_parallel_skills(self, skill_ids: List[str], context: Dict[str, Any]) -> List[SkillResult]:
        tasks = [self.execute_skill(sid, context) for sid in skill_ids]
        return await asyncio.gather(*tasks, return_exceptions=True)
    
    def get_skill_dependencies(self, skill_id: str) -> List[str]:
        return self._dependency_graph.get(skill_id, [])
