from fastapi import APIRouter
from dto.convergence import Convergence
from dto.orbit import Orbit
from dto.coordinates import Coordinate
from calculation.orbit_aproxymator import *

router = APIRouter(prefix="/users", tags=["calc"])

@router.post("/conv/", response_model=Orbit)
async def get_convergence(coords: list[Coordinate]):
    points, dates = extract(coords)
    orbit, _, _ = aprox(points)
    return orbit

@router.post("/orbit/", response_model=Convergence)
async def get_orbit(coords: list[Coordinate]):
    points, dates = extract(coords)
    _, h, k = aprox(points)
    conv = get_conv(dates, h, k)
    return conv