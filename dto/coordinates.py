from pydantic import BaseModel
from datetime import datetime

class Coordinate(BaseModel):
    observationTime: datetime
    rightAscension: float
    declination: float
