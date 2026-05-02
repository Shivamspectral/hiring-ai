import json
import hashlib
from datetime import datetime
from db.supabase_client import get_client

def _make_key(namespace: str, content: str) -> str:
    """Create a deterministic cache key from content."""
    hash_val = hashlib.md5(content.encode()).hexdigest()
    return f"{namespace}:{hash_val}"

def get_cached(namespace: str, content: str):
    """Returns cached result or None if not found/expired."""
    supabase = get_client()
    key = _make_key(namespace, content)
    
    try:
        response = supabase.table("ai_cache")\
            .select("*")\
            .eq("cache_key", key)\
            .execute()
        
        if response.data:
            return response.data[0]["result"]
    except Exception:
        pass
    
    return None

def set_cached(namespace: str, content: str, result: dict):
    """Store a result in cache."""
    supabase = get_client()
    key = _make_key(namespace, content)
    
    try:
        supabase.table("ai_cache").upsert({
            "cache_key": key,
            "namespace": namespace,
            "result": result,
            "created_at": datetime.utcnow().isoformat()
        }).execute()
    except Exception as e:
        print(f"Cache write failed (non-critical): {e}")
