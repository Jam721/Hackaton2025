from fastapi import APIRouter
from dto.convergence import Convergence
from dto.orbit import Orbit
from dto.coordinates import Coordinate

router = APIRouter("/api")

@router.post("/conv/", response_model=Convergence)
async def get_convergence(coords: list[Coordinate]):
    return None

@router.get("/orbit/", response_model=Orbit)
async def get_orbit(coords: list[Coordinate]):
    return None