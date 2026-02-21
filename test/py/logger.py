from enum import Enum

class LogLevel(Enum):
    INFO = "INFO"
    WARN = "WARN"
    ERROR = "ERROR"

def log(message: str, level: LogLevel = LogLevel.INFO) -> None:
    print(f"[{level.value}] {message}")