import numpy as np
from astropy.time import Time, TimeDelta
from astropy import units as u
from astropy.coordinates import SkyCoord, solar_system_ephemeris, get_body_barycentric_posvel, EarthLocation, AltAz
from scipy.optimize import least_squares
from math import acos, atan2, sqrt, pi, sin, cos
from typing import Tuple, Optional
from datetime import datetime

# Импорты DTO классов
from dto.convergence import Convergence
from dto.orbit import Orbit
from dto.coordinates import Coordinate

# Константы
MU_SUN = 1.32712440018e20  # гравитационный параметр Солнца [м^3/s^2]
AU_M = 1.495978707e11      # 1 а.е. в метрах

def calculate_orbit(coordinates: list[Coordinate]) -> Tuple[Optional[Orbit], Optional[Convergence]]:
    """Основная функция для расчета орбиты и сближения"""
    
    # Преобразуем DTO в формат для вычислений
    times = [Time(coord.observationTime) for coord in coordinates]
    coords = [SkyCoord(ra=coord.rightAscension * u.deg, dec=coord.declination * u.deg, frame="icrs") 
              for coord in coordinates]

    # Получаем положения Земли
    print("Получаем положения Земли относительно барицентра Солнечной системы...")
    with solar_system_ephemeris.set("builtin"):
        earth_pos, _ = get_body_barycentric_posvel("earth", Time(times))
        earth_pos = earth_pos.xyz.to(u.m).value.T

    rho_hat = np.array([c.cartesian.xyz.value for c in coords])

    # Формируем начальное приближение
    print("Формируем начальное приближение...")
    first_coord = coordinates[0]
    ra_rad = np.radians(first_coord.rightAscension)
    dec_rad = np.radians(first_coord.declination)
    
    x_geo = np.cos(dec_rad) * np.cos(ra_rad)
    y_geo = np.cos(dec_rad) * np.sin(ra_rad) 
    z_geo = np.sin(dec_rad)
    geo_direction_unit = np.array([x_geo, y_geo, z_geo])
    
    distance_guess_sun_au = 2.0 
    r0_guess_m = earth_pos[0] + geo_direction_unit * distance_guess_sun_au * AU_M
    orbital_speed_guess = sqrt(MU_SUN / (distance_guess_sun_au * AU_M)) 
    
    r_unit = r0_guess_m / np.linalg.norm(r0_guess_m)
    v_approx_ecliptic_dir = np.cross(r_unit, [0, 0, 1])
    if np.linalg.norm(v_approx_ecliptic_dir) < 1e-6:
        v_approx_ecliptic_dir = np.cross(r_unit, [1, 0, 0])
    v_approx_ecliptic_dir = v_approx_ecliptic_dir / np.linalg.norm(v_approx_ecliptic_dir)
    
    v0_guess_ms = v_approx_ecliptic_dir * orbital_speed_guess
    r0_guess_au = r0_guess_m / AU_M
    v0_guess_kms = v0_guess_ms / 1000
    initial = np.hstack([r0_guess_au, v0_guess_kms])
    bounds = ([-50, -50, -20, -200, -200, -100], [50, 50, 20, 200, 200, 100])

    # Вспомогательные функции
    def true_anomaly_from_position(r, e_vec, h_vec, a, e):
        r_norm = np.linalg.norm(r)
        h_norm = np.linalg.norm(h_vec)
        
        if e < 1e-6:
            n_vec = np.cross([0, 0, 1], h_vec)
            n_norm = np.linalg.norm(n_vec)
            if n_norm < 1e-6:
                cos_nu = r[0] / r_norm
                sin_nu = r[1] / r_norm
                nu = atan2(sin_nu, cos_nu)
            else:
                n_vec = n_vec / n_norm
                cos_nu = np.dot(r, n_vec) / r_norm
                tangent_vec = np.cross(h_vec / h_norm, n_vec)
                sin_nu = np.dot(r, tangent_vec) / r_norm
                nu = atan2(sin_nu, cos_nu)
        else:
            cos_nu = np.dot(r, e_vec) / (e * r_norm)
            cos_nu = np.clip(cos_nu, -1, 1)
            sin_nu_numerator = np.dot(np.cross(e_vec, r), h_vec)
            sin_nu_denominator = e * r_norm * h_norm
            sin_nu = sin_nu_numerator / sin_nu_denominator if sin_nu_denominator != 0 else 0
            nu = atan2(sin_nu, cos_nu)
        
        nu = nu % (2 * pi)
        return nu

    def kepler_orbit(r0, v0, dt):
        r = r0.copy()
        v = v0.copy()
        
        steps = max(1, int(abs(dt) / 3600)) 
        dt_step = dt / steps
        
        for _ in range(steps):
            r_norm = np.linalg.norm(r)
            a_accel = -MU_SUN / r_norm**3 * r
            
            r_new = r + v * dt_step + 0.5 * a_accel * dt_step**2
            
            r_new_norm = np.linalg.norm(r_new)
            a_new_accel = -MU_SUN / r_new_norm**3 * r_new
            
            v_new = v + 0.5 * (a_accel + a_new_accel) * dt_step
            
            r, v = r_new, v_new
        
        return r, v

    def residuals(params):
        r0 = params[0:3] * AU_M
        v0 = params[3:6] * 1000
        
        t0_jd = times[0].jd
        res = []
        
        for i, t in enumerate(times):
            dt = (t.jd - t0_jd) * 86400
            
            r_pred, _ = kepler_orbit(r0, v0, dt)
            r_earth = earth_pos[i]
            r_geo = r_pred - r_earth
            
            r_geo_norm = np.linalg.norm(r_geo)
            if r_geo_norm > 0:
                pred_direction = r_geo / r_geo_norm
                obs_direction = rho_hat[i]
                
                cos_angle = np.dot(pred_direction, obs_direction)
                cos_angle = np.clip(cos_angle, -1, 1)
                angular_error = acos(cos_angle)
                
                res.append(angular_error)
            else:
                res.append(pi)
        
        return res

    def eccentric_anomaly_from_true_anomaly(nu, e):
        if e < 1e-6:
            return nu
        E = 2 * atan2(sqrt(1 - e) * sin(nu / 2), sqrt(1 + e) * cos(nu / 2))
        return E

    def mean_anomaly_from_eccentric_anomaly(E, e):
        return E - e * sin(E)

    def calculate_orbital_elements(r, v):
        r_norm = np.linalg.norm(r)
        v_norm = np.linalg.norm(v)
        h_vec = np.cross(r, v)
        h_norm = np.linalg.norm(h_vec)
        i = acos(np.clip(h_vec[2] / h_norm, -1, 1)) if h_norm > 1e-10 else 0
        n_vec = np.cross([0, 0, 1], h_vec)
        n_norm = np.linalg.norm(n_vec)
        
        if n_norm > 1e-10:
            Omega = atan2(n_vec[1], n_vec[0])
            Omega = Omega % (2 * pi)
        else:
            Omega = 0
        
        e_vec = ((v_norm**2 - MU_SUN / r_norm) * r - np.dot(r, v) * v) / MU_SUN
        e = np.linalg.norm(e_vec)
        
        if e > 1e-10 and n_norm > 1e-10:
            cos_omega = np.dot(n_vec, e_vec) / (n_norm * e)
            sin_omega = np.dot(h_vec, np.cross(n_vec, e_vec)) / (h_norm * n_norm * e)
            omega = atan2(sin_omega, cos_omega)
            omega = omega % (2 * pi)
        elif e > 1e-10 and n_norm < 1e-10:
            omega = atan2(e_vec[1], e_vec[0])
            omega = omega % (2 * pi)
        else:
            omega = 0
        
        energy = v_norm**2 / 2 - MU_SUN / r_norm
        if energy < -1e-10:
            a = -MU_SUN / (2 * energy)
        elif energy > 1e-10:
            a = MU_SUN / (2 * energy)
        else:
            a = float('inf') 
        
        nu = true_anomaly_from_position(r, e_vec, h_vec, a, e)
        E = eccentric_anomaly_from_true_anomaly(nu, e)
        M = mean_anomaly_from_eccentric_anomaly(E, e)
        
        return a, e, i, Omega, omega, nu, M

    # Оптимизация
    print("Запускаем оптимизацию...")
    try:
        res_lsq = least_squares(residuals, initial, bounds=bounds, method='trf', 
                           ftol=1e-7, xtol=1e-7, gtol=1e-7, max_nfev=5000)
        print("Оптимизация завершена успешно!")
        r0_au = res_lsq.x[0:3]
        v0_kms = res_lsq.x[3:6]
        r0 = r0_au * AU_M
        v0 = v0_kms * 1000
        a, e, i, Omega, omega, nu, M = calculate_orbital_elements(r0, v0)
        
        # Создаем DTO Orbit
        rad2deg = 180 / pi
        orbit = Orbit(
            semiMajorAxis=a / AU_M,
            eccentricity=e,
            inclination=i * rad2deg,
            longitudeOfAscendingNode=Omega * rad2deg,
            argumentOfPeriapsis=omega * rad2deg,
            timeOfPeriapsisPassage=float(times[0].jd)  # Время первого наблюдения как приближение
        )
        
        # Расчет сближения
        convergence = calculate_convergence(r0, v0, times[0])
        
        return orbit, convergence
        
    except Exception as e:
        print(f"Ошибка оптимизации: {e}")
        return None, None

def calculate_convergence(r0, v0, start_time, forecast_years=20, forecast_steps_per_year=400) -> Optional[Convergence]:
    """Расчет сближения с Землей"""
    print(f"РАСЧЕТ СБЛИЖЕНИЯ С ЗЕМЛЕЙ (в ближайшие {forecast_years} лет):")
    
    try:
        total_days = forecast_years * 365.25
        total_steps = int(forecast_years * forecast_steps_per_year)
        
        days_array = np.linspace(0, total_days, total_steps)
        test_times = start_time + TimeDelta(days_array * u.day)
        
        print(f"Получаем эфемериды Земли на {forecast_years} лет вперед...")
        with solar_system_ephemeris.set("builtin"):
            earth_future_pos, _ = get_body_barycentric_posvel("earth", test_times)
            earth_future_pos_m = earth_future_pos.xyz.to(u.m).value.T

        print(f"Интегрируем орбиту кометы на {forecast_years} лет вперед...")
        
        def kepler_orbit_simple(r0, v0, dt):
            r = r0.copy()
            v = v0.copy()
            steps = max(1, int(abs(dt) / 3600)) 
            dt_step = dt / steps
            
            for _ in range(steps):
                r_norm = np.linalg.norm(r)
                a_accel = -MU_SUN / r_norm**3 * r
                r_new = r + v * dt_step + 0.5 * a_accel * dt_step**2
                r_new_norm = np.linalg.norm(r_new)
                a_new_accel = -MU_SUN / r_new_norm**3 * r_new
                v_new = v + 0.5 * (a_accel + a_new_accel) * dt_step
                r, v = r_new, v_new
            
            return r, v

        comet_positions = []
        r_comet_current = r0.copy()
        v_comet_current = v0.copy()
        comet_positions.append(r_comet_current)
        
        dt_forecast_seconds = (test_times[1].jd - test_times[0].jd) * 86400.0
        
        for i in range(1, total_steps):
            r_comet_new, v_comet_new = kepler_orbit_simple(r_comet_current, v_comet_current, dt_forecast_seconds)
            comet_positions.append(r_comet_new)
            r_comet_current = r_comet_new
            v_comet_current = v_comet_new
        
        comet_positions_m = np.array(comet_positions)

        print("Вычисляем расстояния между кометой и Землей...")
        distances = np.linalg.norm(comet_positions_m - earth_future_pos_m, axis=1)
        
        min_dist_idx = np.argmin(distances)
        min_dist_m = distances[min_dist_idx]
        min_dist_au = min_dist_m / AU_M
        closest_time = test_times[min_dist_idx]
        
        # Создаем DTO Convergence
        convergence = Convergence(
            distance=min_dist_au,
            convTime=closest_time.datetime
        )
        
        print(f"Минимальное расстояние: {min_dist_au:.6f} а.е.")
        print(f"Дата максимального сближения: {closest_time.iso}")
        
        return convergence

    except Exception as e:
        print(f"Ошибка при расчете сближения: {e}")
        return None