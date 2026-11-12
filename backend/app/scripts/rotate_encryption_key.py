"""
Re-encrypt every stored secret under the current ENCRYPTION_KEY.

Usage (from the backend directory or inside the api container):
    ENCRYPTION_KEYS_OLD=<old key> ENCRYPTION_KEY=<new key> python -m app.scripts.rotate_encryption_key

Safe to run more than once. Exits non-zero if any value cannot be decrypted.
"""
import asyncio
import sys

from sqlalchemy import select

from app.crypto import rotate
from app.database import AsyncSessionLocal
from app.models import StorageConfig


async def main() -> int:
    rotated = failed = 0
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(StorageConfig).where(StorageConfig.secret_access_key.is_not(None)))
        for cfg in result.scalars().all():
            try:
                cfg.secret_access_key = rotate(cfg.secret_access_key)
                rotated += 1
            except ValueError:
                failed += 1
                print(f"Could not decrypt storage secret for tenant {cfg.tenant_id}", file=sys.stderr)
        if failed:
            await db.rollback()
            print(f"Aborted: {failed} value(s) could not be decrypted; nothing was changed.", file=sys.stderr)
            return 1
        await db.commit()
    print(f"Re-encrypted {rotated} storage secret(s) under the current key.")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
