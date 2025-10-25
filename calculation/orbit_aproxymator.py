import json
import numpy as np
from scipy.optimize import least_squares
from astropy.time import Time
from astropy import units as u
from astropy.coordinates import solar_system_ephemeris, get_body_barycentric_posvel
from dto.convergence import Convergence
from dto.orbit import Orbit
from dto.coordinates import Coordinate

# --- Чтение JSON ---
def test_data():
    with open("observations.json", "r") as f:
        data = json.load(f)

    points = np.array([[obs['x'], obs['y']] for obs in data])
    dates = np.array([obs['date'] for obs in data])
    return points, dates

def extract(data: list[Coordinate]):
    points = np.array([[obs.rightAscension, obs.declination] for obs in data])
    dates = np.array([obs.observationTime for obs in data])
    return points, dates

# --- Эллипс: (x-h)^2/a^2 + (y-k)^2/b^2 = 1, повернутый ---
def ellipse_residuals(params, x, y):
    h, k, a, b, theta = params
    cos_t, sin_t = np.cos(theta), np.sin(theta)
    x_rot = cos_t*(x - h) + sin_t*(y - k)
    y_rot = -sin_t*(x - h) + cos_t*(y - k)
    return ((x_rot/a)**2 + (y_rot/b)**2 - 1)

# Начальные приближения
def initialize(points):
    x_m, y_m = np.mean(points, axis=0)
    a0 = (np.max(points[:,0]) - np.min(points[:,0])) / 2
    b0 = (np.max(points[:,1]) - np.min(points[:,1])) / 2
    theta0 = 0.0
    return [x_m, y_m, a0, b0, theta0]

# МНК аппроксимация
def aprox(points):
    out = Orbit()
    res = least_squares(ellipse_residuals, initialize(points), args=(points[:,0], points[:,1]))
    h, k, out.semiMajorAxis, b, theta = res.x
    out.eccentricity = 1 - b/out.semiMajorAxis  # эксцентриситет (сплюснутость)

    # --- Простая аппроксимация орбиты ---
    out.inclination = 0.0          # наклон орбиты к эклиптике (рад)
    out.longitudeOfAscendingNode = 0.0      # долгота восходящего узла (рад)
    out.argumentOfPeriapsis = theta    # аргумент перицентра = угол поворота эллипса

    # Истинная аномалия ν: угол положения тела на эллипсе от перицентра
    x_c, y_c = points[len(points)//2]
    dx = x_c - h
    dy = y_c - k
    out.timeOfPeriapsisPassage = np.arctan2(dy / b, dx / out.semiMajorAxis)  # приближённо в радианах
    print("Шесть орбитальных элементов:")
    print(f"Размер эллипса = {out.semiMajorAxis:.4f}")
    print(f"e (эксцентриситет) = {out.eccentricity:.4f}")
    print(f"i (наклон к эклиптике) = {out.eccentricity:.4f} рад")
    print(f"Ω (долгота восходящего узла) = {out.longitudeOfAscendingNode:.4f} рад")
    print(f"ω (аргумент перицентра) = {out.argumentOfPeriapsis:.4f} рад")
    print(f"ν (истинная аномалия) = {out.timeOfPeriapsisPassage:.4f} рад\n")
    return out, h, k

# --- Минимальное расстояние до Земли ---
def get_conv(dates, h, k):
    conv = Convergence()
    t_mid = Time(dates[len(dates)//2])
    with solar_system_ephemeris.set('builtin'):
        pos_earth, _ = get_body_barycentric_posvel('earth', t_mid)
        x_earth = pos_earth.x.to(u.AU).value
        y_earth = pos_earth.y.to(u.AU).value

    conv.dictance = np.sqrt((h - x_earth)**2 + (k - y_earth)**2)
    conv.convTime = t_mid.iso

    print("Сближение с Землёй:")
    print(f"Время сближения: {conv.convTime.iso}")
    print(f"Минимальная дистанция: {conv.distance:.4f} AU")
    return conv
