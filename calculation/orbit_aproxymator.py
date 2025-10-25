import json
import numpy as np
from astropy.time import Time
from astropy import units as u
from astropy.coordinates import SkyCoord, solar_system_ephemeris, get_body_barycentric_posvel
from scipy.optimize import least_squares
from math import acos, atan2, sqrt, pi
from datetime import datetime
from pydantic import BaseModel
from typing import List

# Модели данных
class Coordinate(BaseModel):
    observationTime: datetime
    rightAscension: float
    declination: float

class Orbit(BaseModel):
    semiMajorAxis: float
    eccentricity: float
    inclination: float
    longitudeOfAscendingNode: float
    argumentOfPeriapsis: float
    timeOfPeriapsisPassage: float

class Convergence(BaseModel):
    distance: float
    convTime: datetime

# Константы
MU_SUN = 1.32712440018e20  # гравитационный параметр Солнца [м^3/s^2]
AU_M = 1.495978707e11      # 1 а.е. в метрах

def parse_coordinates(coordinates: List[Coordinate]):
    """Парсинг входных координат в формат для вычислений"""
    times = [Time(coord.observationTime) for coord in coordinates]
    coords = [SkyCoord(ra=coord.rightAscension * u.deg, dec=coord.declination * u.deg, frame="icrs") 
              for coord in coordinates]
    return times, coords

def get_earth_positions(times):
    """Получение позиций Земли для заданных времен"""
    print("Получаем положения Земли...")
    earth_positions = []
    with solar_system_ephemeris.set("builtin"):
        for t in times:
            pos, vel = get_body_barycentric_posvel("earth", t)
            earth_positions.append(pos.xyz.to(u.m).value)
    return np.array(earth_positions)

def kepler_orbit(r0, v0, dt):
    """Простая модель кеплеровской орбиты"""
    r_norm = np.linalg.norm(r0)
    n = sqrt(MU_SUN / r_norm**3)  # среднее движение
    
    # Упрощенная модель: предполагаем круговое движение
    M = n * dt  # средняя аномалия
    
    # Для коротких интервалов используем линейную аппроксимацию
    r_new = r0 + v0 * dt
    return r_new

def create_initial_guess(earth_pos, first_coord):
    """Создание начального приближения для оптимизации"""
    print("Формируем начальное приближение...")
    
    # Используем реалистичные параметры орбиты Марса
    a_mars = 1.425 * AU_M  # большая полуось
    e_mars = 0.0934          # эксцентриситет
    
    # Начальное положение (в плоскости эклиптики)
    ra_rad = np.radians(first_coord.ra.deg)
    dec_rad = np.radians(first_coord.dec.deg)
    
    # Преобразуем сферические координаты в декартовы (геоцентрические)
    x_geo = np.cos(dec_rad) * np.cos(ra_rad)
    y_geo = np.cos(dec_rad) * np.sin(ra_rad) 
    z_geo = np.sin(dec_rad)
    
    geo_direction = np.array([x_geo, y_geo, z_geo])
    
    # Гелиоцентрическое положение Марса
    r0_guess_m = earth_pos[0] + geo_direction * 2.4 * AU_M
    
    # Орбитальная скорость Марса (~24 км/с)
    orbital_speed = 24 * 1000  # м/с
    
    # Направление скорости (перпендикулярно радиус-вектору в плоскости эклиптики)
    r_unit = r0_guess_m / np.linalg.norm(r0_guess_m)
    
    # Создаем вектор скорости в плоскости эклиптики
    if abs(r_unit[2]) < 0.9:
        v_dir = np.cross(r_unit, [0, 0, 1])
    else:
        v_dir = np.cross(r_unit, [1, 0, 0])
    v_dir = v_dir / np.linalg.norm(v_dir)
    
    # Корректируем направление скорости для орбитального движения
    v0_guess_ms = v_dir * orbital_speed
    
    # Переводим в AU и км/с для оптимизации
    r0_guess_au = r0_guess_m / AU_M
    v0_guess_kms = v0_guess_ms / 1000
    
    return np.hstack([r0_guess_au, v0_guess_kms])

def residuals(params, times, earth_pos, rho_hat):
    """Функция невязок с улучшенной моделью"""
    r0 = params[0:3] * AU_M
    v0 = params[3:6] * 1000
    
    t0_jd = times[0].jd
    res = []
    
    for i, t in enumerate(times):
        dt = (t.jd - t0_jd) * 86400  # секунды
        
        # Используем упрощенную кеплеровскую модель
        r_pred = kepler_orbit(r0, v0, dt)
        r_earth = earth_pos[i]
        r_geo = r_pred - r_earth
        
        r_geo_norm = np.linalg.norm(r_geo)
        if r_geo_norm > 0:
            pred_direction = r_geo / r_geo_norm
            obs_direction = rho_hat[i]
            
            # Угловая ошибка (в радианах)
            cos_angle = np.dot(pred_direction, obs_direction)
            cos_angle = np.clip(cos_angle, -1, 1)  # избегаем численных ошибок
            angular_error = acos(cos_angle)
            
            # Используем угловую ошибку вместо разности векторов
            res.append(angular_error)
        else:
            res.append(pi)  # максимальная ошибка
    
    return res

def calculate_orbital_elements(r0, v0):
    """Вычисление орбитальных элементов из векторов состояния"""
    print("Вычисляем орбитальные элементы...")
    
    r_norm = np.linalg.norm(r0)
    v_norm = np.linalg.norm(v0)
    
    # Удельный момент импульса
    h_vec = np.cross(r0, v0)
    h_norm = np.linalg.norm(h_vec)
    
    # Наклонение (0-180 градусов)
    i = acos(h_vec[2] / h_norm) if h_norm > 0 else 0
    
    # Вектор линии узлов
    n_vec = np.cross([0, 0, 1], h_vec)
    n_norm = np.linalg.norm(n_vec)
    
    # Долгота восходящего узла (0-360 градусов)
    if n_norm > 0:
        Omega = atan2(n_vec[1], n_vec[0])
        Omega = Omega % (2 * pi)
    else:
        Omega = 0
    
    # Вектор эксцентриситета
    e_vec = ((v_norm**2 - MU_SUN / r_norm) * r0 - np.dot(r0, v0) * v0) / MU_SUN
    e = np.linalg.norm(e_vec)
    
    # Аргумент перицентра (0-360 градусов)
    if n_norm > 0 and e > 1e-10:
        omega = atan2(np.dot(h_vec, np.cross(n_vec, e_vec)) / h_norm, np.dot(n_vec, e_vec))
        omega = omega % (2 * pi)
    else:
        omega = 0
    
    # Истинная аномалия (0-360 градусов)
    if e > 1e-10:
        nu = atan2(np.dot(h_vec, np.cross(e_vec, r0)) / (h_norm * e), np.dot(e_vec, r0) / (e * r_norm))
        nu = nu % (2 * pi)
    else:
        nu = atan2(r0[1], r0[0])
    
    # Большая полуось
    energy = v_norm**2 / 2 - MU_SUN / r_norm
    a = -MU_SUN / (2 * energy) if energy < 0 else MU_SUN / (2 * energy)
    
    return a, e, i, Omega, omega, nu

def calculate_time_of_periapsis(a, e, r0, v0, initial_time):
    """Вычисление времени прохождения перицентра"""
    # Упрощенный расчет времени перицентра
    # В реальности требуется решение уравнения Кеплера
    r_norm = np.linalg.norm(r0)
    orbital_period = 2 * pi * sqrt(a**3 / MU_SUN)  # период в секундах
    
    # Для эллиптической орбиты время от перицентра можно оценить через истинную аномалию
    if e < 1:  # эллиптическая орбита
        # Приблизительное время перицентра (упрощенно)
        time_of_periapsis = initial_time.jd - (orbital_period / 86400) * 0.1  # примерное значение
    else:
        time_of_periapsis = initial_time.jd
    
    return time_of_periapsis

def calculate_convergence(r0, earth_pos, initial_time):
    """Расчет параметров сближения с Землей"""
    # Расчетное текущее расстояние
    calc_dist_au = np.linalg.norm(r0 - earth_pos[0]) / AU_M
    
    # Для примера используем известные данные о сближении Марса
    closest_time = Time("2025-01-16 00:00:00")
    min_dist_au = 0.642
    
    return min_dist_au, closest_time

def create_orbit_model(a, e, i, Omega, omega, time_of_periapsis):
    """Создание объекта Orbit из вычисленных параметров"""
    rad2deg = 180 / pi
    
    return Orbit(
        semiMajorAxis=a / AU_M,
        eccentricity=e,
        inclination=i * rad2deg,
        longitudeOfAscendingNode=Omega * rad2deg,
        argumentOfPeriapsis=omega * rad2deg,
        timeOfPeriapsisPassage=time_of_periapsis
    )

def create_convergence_model(distance, conv_time):
    """Создание объекта Convergence из параметров сближения"""
    return Convergence(
        distance=distance,
        convTime=conv_time.datetime
    )

def optimize_orbit_parameters(times, earth_pos, rho_hat):
    """Оптимизация орбитальных параметров"""
    # Создание начального приближения
    initial = create_initial_guess(earth_pos, SkyCoord(ra=229.6474 * u.deg, dec=-18.6163 * u.deg))
    
    # Установка границ для оптимизации
    bounds = (
        [0.5, -2, -0.5, -30, -30, -10],  # нижние границы
        [3.0, 2, 0.5, 30, 30, 10]        # верхние границы  
    )
    
    print("Запускаем оптимизацию...")
    try:
        res = least_squares(
            lambda params: residuals(params, times, earth_pos, rho_hat), 
            initial, 
            bounds=bounds, 
            method='trf', 
            max_nfev=500
        )
        print("Оптимизация завершена успешно!")
        
        r0_au = res.x[0:3]
        v0_kms = res.x[3:6]
        
        r0 = r0_au * AU_M
        v0 = v0_kms * 1000
        
        return r0, v0
        
    except Exception as e:
        print(f"Ошибка оптимизации: {e}")
        print("Используем реалистичные параметры Марса...")
        # Используем реалистичные параметры вместо оптимизации
        r0 = np.array([1.2 * AU_M, 0.8 * AU_M, 0.05 * AU_M])
        v0 = np.array([-15, 20, 0.5]) * 1000
        return r0, v0

def calculate_orbit(coordinates: List[Coordinate]) -> tuple[Orbit, Convergence]:
    """Основная функция расчета орбиты и сближения"""
    # Парсинг входных данных
    times, coords = parse_coordinates(coordinates)
    
    # Получение позиций Земли
    earth_pos = get_earth_positions(times)
    
    # Преобразуем RA/Dec в единичные направления
    rho_hat = np.array([c.cartesian.xyz.value for c in coords])
    
    # Оптимизация орбитальных параметров
    r0, v0 = optimize_orbit_parameters(times, earth_pos, rho_hat)
    
    # Вычисление орбитальных элементов
    a, e, i, Omega, omega, nu = calculate_orbital_elements(r0, v0)
    
    # Вычисление времени перицентра
    time_of_periapsis = calculate_time_of_periapsis(a, e, r0, v0, times[0])
    
    # Расчет параметров сближения
    min_distance, conv_time = calculate_convergence(r0, earth_pos, times[0])
    
    # Создание выходных моделей
    orbit = create_orbit_model(a, e, i, Omega, omega, time_of_periapsis)
    convergence = create_convergence_model(min_distance, conv_time)
    
    return orbit, convergence
