from __future__ import annotations

import json

from spine.orchestrator import STITCH


if __name__ == "__main__":
    hive = STITCH()
    boot = hive.boot()
    print(json.dumps(boot, indent=2))
    print("\nTry a test message:")
    result = hive.process("Connect this business to the STITCH Hive Mind with bounded claims and verified memory.")
    print(json.dumps(result, indent=2))
