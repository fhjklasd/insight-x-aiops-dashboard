from pydantic import BaseModel

class ServerMetrics(BaseModel):
    cpu: float
    memory: float
    disk: float
    network: float
    errors: int
