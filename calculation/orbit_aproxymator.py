import json
import numpy as np
from scipy.optimize import least_squares
from astropy.time import Time
from astropy import units as u
from astropy.coordinates import solar_system_ephemeris, get_body_barycentric_posvel

# --- Чтение JSON ---
with open("observations.json", "r") as f:
    data = json.load(f)

points = np.array([[obs['x'], obs['y']] for obs in data])
dates = np.array([obs['date'] for obs in data])

# --- Эллипс: (x-h)^2/a^2 + (y-k)^2/b^2 = 1, повернутый ---
def ellipse_residuals(params, x, y):
    h, k, a, b, theta = params
    cos_t, sin_t = np.cos(theta), np.sin(theta)
    x_rot = cos_t*(x - h) + sin_t*(y - k)
    y_rot = -sin_t*(x - h) + cos_t*(y - k)
    return ((x_rot/a)**2 + (y_rot/b)**2 - 1)

# Начальные приближения
x_m, y_m = np.mean(points, axis=0)
a0 = (np.max(points[:,0]) - np.min(points[:,0])) / 2
b0 = (np.max(points[:,1]) - np.min(points[:,1])) / 2
theta0 = 0.0
initial = [x_m, y_m, a0, b0, theta0]

# МНК аппроксимация
res = least_squares(ellipse_residuals, initial, args=(points[:,0], points[:,1]))
h, k, a, b, theta = res.x
e = 1 - b/a  # эксцентриситет (сплюснутость)

# --- Простая аппроксимация орбиты ---
i = 0.0          # наклон орбиты к эклиптике (рад)
Omega = 0.0      # долгота восходящего узла (рад)
omega = theta    # аргумент перицентра = угол поворота эллипса

# Истинная аномалия ν: угол положения тела на эллипсе от перицентра
x_c, y_c = points[len(points)//2]
dx = x_c - h
dy = y_c - k
nu = np.arctan2(dy / b, dx / a)  # приближённо в радианах

# --- Минимальное расстояние до Земли ---
t_mid = Time(dates[len(dates)//2])
with solar_system_ephemeris.set('builtin'):
    pos_earth, _ = get_body_barycentric_posvel('earth', t_mid)
    x_earth = pos_earth.x.to(u.AU).value
    y_earth = pos_earth.y.to(u.AU).value

distance = np.sqrt((h - x_earth)**2 + (k - y_earth)**2)

# --- Вывод ---
print("Шесть орбитальных элементов:")
print(f"Размер эллипса = {a:.4f}")
print(f"e (эксцентриситет) = {e:.4f}")
print(f"i (наклон к эклиптике) = {i:.4f} рад")
print(f"Ω (долгота восходящего узла) = {Omega:.4f} рад")
print(f"ω (аргумент перицентра) = {omega:.4f} рад")
print(f"ν (истинная аномалия) = {nu:.4f} рад\n")

print("Сближение с Землёй:")
print(f"Время сближения: {t_mid.iso}")
print(f"Минимальная дистанция: {distance:.4f} AU")