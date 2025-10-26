from fastapi import APIRouter
from dto.convergence import Convergence
from dto.orbit import Orbit
from dto.coordinates import Coordinate
from calculation.orbit_approximator import calculate_orbit

router = APIRouter(prefix="/users", tags=["calc"])

@router.post("/orbit/", response_model=Orbit)  # Исправлено: возвращает Orbit
async def get_orbit(coords: list[Coordinate]):
    c = len(coords) - 5
    orbit, _ = calculate_orbit(coords[c:])
    return orbit

@router.post("/conv/", response_model=Convergence)  # Исправлено: возвращает Convergence
async def get_convergence(coords: list[Coordinate]):
    c = len(coords) - 5
    _, conv = calculate_orbit(coords[c:])
    return conv