from pydantic import BaseModel

class Convergence(BaseModel):
    semiMajorAxis: float
    eccentricity: float
    inclination: float
    longitudeOfAscendingNode: float
    argumentOfPeriapsis: float
    timeOfPeriapsisPassage: float