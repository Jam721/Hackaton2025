from pydantic import BaseModel
from datetime import datetime

class Orbit(BaseModel):
    distance: float
    convTime: datetime