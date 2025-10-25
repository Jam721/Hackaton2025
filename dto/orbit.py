from pydantic import BaseModel

class Orbit(BaseModel):
    semiMajorAxis: float
    eccentricity: float
    inclination: float
    longitudeOfAscendingNode: float
    argumentOfPeriapsis: float
    timeOfPeriapsisPassage: float