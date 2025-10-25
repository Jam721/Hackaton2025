from pydantic import BaseModel
from datetime import datetime

class Convergence(BaseModel):
    distance: float
    convTime: datetime