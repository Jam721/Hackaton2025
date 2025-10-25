from fastapi import APIRouter
from dto.convergence import Convergence
from dto.orbit import Orbit
from dto.coordinates import Coordinate
from calculation.orbit_aproxymator import calculate_orbit

router = APIRouter(prefix="/users", tags=["calc"])

@router.post("/conv/", response_model=Orbit)
async def get_convergence(coords: list[Coordinate]):
    orbit, _ = calculate_orbit(coords)
    return orbit

@router.post("/orbit/", response_model=Convergence)
async def get_orbit(coords: list[Coordinate]):
    _, conv = calculate_orbit(coords)
    return conv